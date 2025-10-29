import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { rateLimit } from '../../utils/security/rateLimit'
import { isAdminUser } from '../../utils/security/auth'
import { z } from 'zod'


export default defineEventHandler(async (event) => {
  await rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 30
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

    // 2. Validate bundle ID
    const bundleId = getRouterParam(event, 'id')
    if (!bundleId) {
      return {
        success: false,
        error: 'Bundle ID is required'
      }
    }

    const idValidation = z.string().uuid().safeParse(bundleId)
    if (!idValidation.success) {
      return {
        success: false,
        error: 'Invalid bundle ID format'
      }
    }

    // 3. Validate request body as complete bundle data
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

    // 4. Validate products and calculate original_price
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

    // Calculate original price based on products
    const calculatedPrice = products.reduce((sum, product) => sum + product.price, 0)
    bundleData.original_price = calculatedPrice

    // 4. Validate pricing
    if (bundleData.bundle_price >= bundleData.original_price) {
      return {
        success: false,
        error: 'Bundle price must be less than original price'
      }
    }

    // 5. Replace the bundle completely - ensure undefined fields are set to null/default
    const completeData = {
      ...bundleData,
      description: bundleData.description ?? null,
      meta_title: bundleData.meta_title ?? null,
      meta_description: bundleData.meta_description ?? null,
      featured_image: bundleData.featured_image ?? null,
      gallery_images: bundleData.gallery_images ?? null,
      slug: bundleData.slug ?? null,
      is_active: bundleData.is_active ?? true,
      featured: bundleData.featured ?? false,
      display_order: bundleData.display_order ?? 0
    }

    // 6. Update the bundle
    const { data: updatedBundle, error: updateError } = await supabase
      .from('product_bundles')
      .update(completeData)
      .eq('id', bundleId)
      .select()
      .single()

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return {
          success: false,
          error: 'Bundle not found'
        }
      }
      throw updateError
    }

    return {
      success: true,
      data: updatedBundle,
      error: null
    }

  } catch (error: any) {
    console.error('Replace bundle error:', error)
    return {
      success: false,
      error: 'Failed to replace bundle',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }
  }
})