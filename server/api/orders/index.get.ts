import { serverSupabaseClient, serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '@/types/database'
import { isAdminUser } from '../../utils/security/auth'

export default defineEventHandler(async (event) => {
  // Check if user is admin
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

  // Use service role for admin access
  const supabase = serverSupabaseServiceRole<Database>(event)

  // Get query parameters
  const query = getQuery(event)
  const {
    page = 1,
    limit = 20,
    search,
    status,
    payment_status,
    date_from,
    date_to
  } = query

  try {
    // Build the query
    let ordersQuery = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_name,
          product_slug,
          unit_price,
          total_price,
          quantity
        )
      `, { count: 'exact' })

    // Apply filters
    if (search) {
      ordersQuery = ordersQuery.or(`order_number.ilike.%${search}%,customer_email.ilike.%${search}%,customer_name.ilike.%${search}%`)
    }

    if (status) {
      ordersQuery = ordersQuery.eq('status', status)
    }

    if (payment_status) {
      ordersQuery = ordersQuery.eq('payment_status', payment_status)
    }

    if (date_from) {
      ordersQuery = ordersQuery.gte('created_at', date_from)
    }

    if (date_to) {
      ordersQuery = ordersQuery.lte('created_at', date_to)
    }

    // Apply pagination
    const offset = (Number(page) - 1) * Number(limit)
    ordersQuery = ordersQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1)

    const { data: orders, error, count } = await ordersQuery

    if (error) {
      throw error
    }

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / Number(limit))

    return {
      success: true,
      data: {
        data: orders || [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          totalPages,
          hasNextPage: Number(page) < totalPages,
          hasPreviousPage: Number(page) > 1
        }
      }
    }

  } catch (error: any) {
    console.error('Error fetching orders:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch orders',
      data: error
    })
  }
})