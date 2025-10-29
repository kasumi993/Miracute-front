import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { rateLimit } from '../../utils/security/rateLimit'
import { isAdminUser } from '../../utils/security/auth'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  await rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 20
  })(event)

  try {
    // 1. Check admin authentication
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const isAdmin = await isAdminUser(user.id, event)
    if (!isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      })
    }

    // 2. Validate request body
    const rawBody = await readBody(event)
    const createBundleSchema = z.object({
      name: z.string().min(1, 'Bundle name is required').max(100, 'Name too long'),
      description: z.string().optional(),
      bundle_price: z.number().positive('Bundle price must be positive'),
      original_price: z.number().positive('Original price must be positive').optional(),
      products: z.array(z.string().uuid()).min(2, 'Bundle must contain at least 2 products'),
      is_active: z.boolean().optional().default(true),
      featured: z.boolean().optional().default(false),
      display_order: z.number().int().optional().default(0),
      slug: z.string().optional(),
      meta_title: z.string().optional(),
      meta_description: z.string().optional(),
      featured_image: z.string().url().optional(),
      gallery_images: z.array(z.string().url()).optional()
    })

    const validation = createBundleSchema.safeParse(rawBody)
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid bundle data',
        details: validation.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      }
    }

    const bundleData = validation.data
    const supabase = serverSupabaseServiceRole(event)

    // 3. Generate and ensure unique slug
    if (!bundleData.slug) {
      bundleData.slug = bundleData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
    }

    // Check if slug already exists (ignore errors - slug might not exist)
    const { data: existingSlug, error: slugError } = await supabase
      .from('product_bundles')
      .select('id')
      .eq('slug', bundleData.slug)
      .single()

    // If slug exists, make it unique
    if (existingSlug && !slugError) {
      bundleData.slug = `${bundleData.slug}-${Date.now()}`
    }

    // 4. Validate products exist and are active
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, price, is_active')
      .in('id', bundleData.products)

    if (productsError) {
      throw productsError
    }

    // Check if all products were found
    if (products.length !== bundleData.products.length) {
      const foundIds = products.map(p => p.id)
      const missingIds = bundleData.products.filter(id => !foundIds.includes(id))
      return {
        success: false,
        error: `Products not found: ${missingIds.join(', ')}`
      }
    }

    // Note: Product status validation is now handled by database triggers
    // Bundles with inactive products will be automatically deactivated

    // 5. Validate pricing
    const calculatedPrice = products.reduce((sum, product) => sum + product.price, 0)

    // Set original_price if not provided
    if (!bundleData.original_price) {
      bundleData.original_price = calculatedPrice
    }

    // Validate pricing
    if (bundleData.bundle_price >= bundleData.original_price) {
      return {
        success: false,
        error: 'Bundle price must be less than original price'
      }
    }

    if (Math.abs(calculatedPrice - bundleData.original_price) > 0.01) {
      return {
        success: false,
        error: `Original price mismatch. Expected $${calculatedPrice}, got $${bundleData.original_price}`
      }
    }

    // Calculate discount fields
    const discountAmount = bundleData.original_price - bundleData.bundle_price
    const discountPercentage = Math.round((discountAmount / bundleData.original_price) * 100)

    const finalBundleData = {
      ...bundleData,
      discount_amount: discountAmount,
      discount_percentage: discountPercentage
    }

    // 6. Create the bundle
    const { data: newBundle, error: createError } = await supabase
      .from('product_bundles')
      .insert([finalBundleData])
      .select()
      .single()

    if (createError) {
      throw createError
    }

    return {
      success: true,
      data: newBundle,
      error: null
    }

  } catch (error: any) {
    console.error('Create bundle error:', error)
    return {
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }
  }
})