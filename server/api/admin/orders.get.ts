import { validateAdminAccess } from '../../utils/adminAuth'
import { createBusinessMetricsCalculator } from '../../utils/businessMetrics'

export default defineEventHandler(async (event) => {
  // Validate admin access and get authenticated supabase client
  const { supabase } = await validateAdminAccess(event)

  const query = getQuery(event)
  const limit = parseInt(query.limit as string) || 20
  const offset = parseInt(query.offset as string) || 0
  const status = query.status as string
  const search = query.search as string

  try {
    // Build query
    let ordersQuery = supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          product:products(
            name,
            slug
          )
        )
      `, { count: 'exact' })

    // Apply filters
    if (status) {
      ordersQuery = ordersQuery.eq('status', status)
    }

    if (search) {
      ordersQuery = ordersQuery.or(`order_number.ilike.%${search}%,customer_email.ilike.%${search}%`)
    }

    // Apply pagination and sorting
    const { data: orders, count, error } = await ordersQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      success: true,
      data: orders || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    }

  } catch (error: any) {
    console.error('Error fetching admin orders:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch orders'
    })
  }
})