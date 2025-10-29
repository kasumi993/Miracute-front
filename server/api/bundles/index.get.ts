import { serverSupabaseServiceRole } from '#supabase/server'
import { rateLimit } from '../../utils/security/rateLimit'
import { createValidator, schemas } from '../../utils/api/validation'
import { z } from 'zod'

const validateBundleQuery = createValidator(z.object({
  page: schemas.positiveInteger.optional(),
  limit: schemas.positiveInteger.optional(),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'all']).optional(),
  featured: z.string().transform(val => val === 'true').optional(),
  product_id: z.string().uuid().optional()
}))

export default defineEventHandler(async (event) => {
  await rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 100
  })(event)

  try {
    const query = getQuery(event)
    const { page = 1, limit = 20, search, status = 'all', featured, product_id } = validateBundleQuery(query)

    const supabase = serverSupabaseServiceRole(event)

    // Build the query
    let bundleQuery = supabase
      .from('product_bundles')
      .select('*')

    // Apply filters
    if (status !== 'all') {
      bundleQuery = bundleQuery.eq('is_active', status === 'active')
    }

    if (featured !== undefined) {
      bundleQuery = bundleQuery.eq('featured', featured)
    }

    if (search) {
      bundleQuery = bundleQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (product_id) {
      bundleQuery = bundleQuery.contains('products', [product_id])
    }

    // Add pagination
    const offset = (page - 1) * limit
    bundleQuery = bundleQuery
      .order('featured', { ascending: false })
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: rawBundles, error: bundlesError, count } = await bundleQuery

    if (bundlesError) {
      throw bundlesError
    }

    // Ensure bundles is always an array
    const bundles = Array.isArray(rawBundles) ? rawBundles : []


    // Fetch product details for each bundle
    if (bundles.length > 0) {
      for (const bundle of bundles) {
        if (bundle.products && Array.isArray(bundle.products) && bundle.products.length > 0) {
          const { data: products, error: productsError } = await supabase
            .from('products')
            .select(`
              *,
              category:categories(*)
            `)
            .in('id', bundle.products)

          if (!productsError && products && Array.isArray(products)) {
            // Sort products by the order they appear in the bundle.products array
            const sortedProducts = (bundle.products || [])
              .map(productId => products.find(p => p.id === productId))
              .filter(Boolean)

            bundle.product_details = sortedProducts
          } else {
            // Set empty array if no products found
            bundle.product_details = []
          }
        } else {
          // Set empty array if no products in bundle
          bundle.product_details = []
        }
      }
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('product_bundles')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Count query error:', countError)
      throw countError
    }

    // Get bundle statistics
    let bundleStats = {
      total_bundles: 0,
      active_bundles: 0,
      total_savings: 0,
      total_sales: 0
    }

    try {
      const { data: stats, error: statsError } = await supabase
        .rpc('get_bundle_stats')

      if (statsError) {
        console.warn('Bundle stats error:', statsError)
      } else if (stats && Array.isArray(stats) && stats.length > 0) {
        bundleStats = stats[0]
      }
    } catch (error) {
      console.warn('Bundle stats RPC failed:', error)
    }

    const result = {
      success: true,
      data: {
        bundles: bundles,
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit)
        },
        stats: bundleStats
      },
      error: null
    }

    return result

  } catch (error: any) {
    console.error('Get bundles error:', error)
    console.error('Error stack:', error.stack)
    return {
      success: false,
      error: 'Failed to get bundles',
      details: error.message
    }
  }
})