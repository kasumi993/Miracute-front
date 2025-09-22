// User orders API endpoint
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event)

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = Math.min(parseInt(query.limit as string) || 20, 100)
    const status = query.status as string

    const supabase = serverSupabaseServiceRole(event)

    // Build query
    let dbQuery = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total_amount,
        payment_status,
        created_at,
        order_items (
          id,
          product_id,
          quantity,
          unit_price,
          products (
            name,
            featured_image_url
          )
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)

    // Apply status filter if provided
    if (status) {
      dbQuery = dbQuery.eq('payment_status', status)
    }

    // Apply pagination
    const offset = (page - 1) * limit
    dbQuery = dbQuery
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    const { data: orders, error, count } = await dbQuery

    if (error) {
      console.error('Orders query error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch orders'
      })
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return {
      success: true,
      data: orders || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages
      }
    }

  } catch (error: any) {
    console.error('User orders error:', error)
    return {
      success: false,
      error: 'Failed to fetch user orders',
      details: error.message
    }
  }
})