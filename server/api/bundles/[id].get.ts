import { serverSupabaseServiceRole } from '#supabase/server'
import { rateLimit } from '../../utils/security/rateLimit'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  await rateLimit({
    windowMs: 60 * 1000,
    maxRequests: 60
  })(event)

  try {
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

    const supabase = serverSupabaseServiceRole(event)

    // Get bundle details
    const { data: bundle, error: bundleError } = await supabase
      .from('product_bundles')
      .select('*')
      .eq('id', bundleId)
      .single()

    if (bundleError) {
      if (bundleError.code === 'PGRST116') {
        return {
          success: false,
          error: 'Bundle not found'
        }
      }
      throw bundleError
    }

    // Get bundle products with details
    if (bundle.products && Array.isArray(bundle.products) && bundle.products.length > 0) {
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .in('id', bundle.products)

      if (productsError) {
        throw productsError
      }

      if (products && Array.isArray(products)) {
        // Sort products by the order they appear in the bundle.products array
        const sortedProducts = (bundle.products || [])
          .map(productId => products.find(p => p.id === productId))
          .filter(Boolean)

        bundle.product_details = sortedProducts
      } else {
        bundle.product_details = []
      }
    } else {
      bundle.product_details = []
    }

    // Get bundle sales analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('bundle_sales')
      .select('bundle_price, savings_amount, sold_at')
      .eq('bundle_id', bundleId)

    if (!analyticsError && analytics) {
      bundle.analytics = {
        total_sales: analytics.length,
        total_revenue: analytics.reduce((sum, sale) => sum + sale.bundle_price, 0),
        total_savings_given: analytics.reduce((sum, sale) => sum + sale.savings_amount, 0),
        recent_sales: analytics
          .sort((a, b) => new Date(b.sold_at).getTime() - new Date(a.sold_at).getTime())
          .slice(0, 10)
      }
    }

    return {
      success: true,
      data: bundle,
      error: null
    }

  } catch (error: any) {
    console.error('Get bundle error:', error)
    return {
      success: false,
      error: 'Failed to get bundle',
      details: error.message
    }
  }
})