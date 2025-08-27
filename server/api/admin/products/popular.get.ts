import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  // Check admin role
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || userData?.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }

  const query = getQuery(event)
  const limit = parseInt(query.limit as string) || 10
  const sortBy = query.sortBy as string || 'view_count'

  try {
    // Get popular products based on different metrics
    let orderColumn: string
    let ascending = false

    switch (sortBy) {
      case 'downloads':
        orderColumn = 'download_count'
        break
      case 'recent':
        orderColumn = 'created_at'
        break
      case 'price_high':
        orderColumn = 'price'
        break
      case 'price_low':
        orderColumn = 'price'
        ascending = true
        break
      case 'views':
      default:
        orderColumn = 'view_count'
        break
    }

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(
          name,
          slug
        )
      `)
      .eq('is_active', true)
      .order(orderColumn, { ascending })
      .limit(limit)

    if (error) throw error

    // Get additional metrics for each product
    const productIds = (products || []).map(p => p.id)
    
    if (productIds.length > 0) {
      // Get order count for each product (sales data)
      const { data: salesData } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .in('product_id', productIds)

      // Calculate sales for each product
      const salesByProduct = {}
      salesData?.forEach(item => {
        salesByProduct[item.product_id] = (salesByProduct[item.product_id] || 0) + (item.quantity || 0)
      })

      // Add sales data to products
      const enrichedProducts = (products || []).map(product => ({
        ...product,
        sales_count: salesByProduct[product.id] || 0,
        revenue: (salesByProduct[product.id] || 0) * parseFloat(product.price || '0')
      }))

      return {
        success: true,
        data: enrichedProducts
      }
    }

    return {
      success: true,
      data: products || []
    }

  } catch (error: any) {
    console.error('Error fetching popular products:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch popular products'
    })
  }
})