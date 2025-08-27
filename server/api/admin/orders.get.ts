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