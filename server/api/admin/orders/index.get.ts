import { requireAdminAuthentication } from "../../../utils/auth"
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdminAuthentication(event)
  const query = getQuery(event)

  // Parse query parameters
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20
  const search = query.search as string
  const status = query.status as string
  const paymentStatus = query.payment_status as string
  const dateFrom = query.date_from as string

  try {
    // Build base query
    let ordersQuery = supabase
      .from('orders')
      .select('*', { count: 'exact' })

    // Apply filters
    if (search) {
      ordersQuery = ordersQuery.or(`order_number.ilike.%${search}%,customer_email.ilike.%${search}%,customer_name.ilike.%${search}%`)
    }

    if (status) {
      ordersQuery = ordersQuery.eq('status', status)
    }

    if (paymentStatus) {
      ordersQuery = ordersQuery.eq('payment_status', paymentStatus)
    }

    if (dateFrom) {
      ordersQuery = ordersQuery.gte('created_at', dateFrom)
    }

    // Apply pagination and sorting
    const from = (page - 1) * limit
    const to = from + limit - 1

    ordersQuery = ordersQuery
      .order('created_at', { ascending: false })
      .range(from, to)

    const { data: orders, error, count } = await ordersQuery

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch orders',
        data: error
      })
    }

    // Calculate pagination info
    const total = count || 0
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return {
      data: orders || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    }

  } catch (error: any) {
    console.error('Error fetching orders:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch orders',
      data: error
    })
  }
})
