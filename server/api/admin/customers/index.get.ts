import { validateAdminAccess } from '../../../utils/adminAuth'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const { supabase } = await validateAdminAccess(event)
  const query = getQuery(event)
  
  // Parse query parameters
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20
  const search = query.search as string
  const type = query.type as string
  const dateFrom = query.date_from as string
  
  try {
    // Build base query with customer stats
    let customersQuery = supabase
      .from('users')
      .select(`
        *,
        orders!left(id, total_amount, created_at)
      `, { count: 'exact' })
    
    // Apply filters
    if (search) {
      customersQuery = customersQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }
    
    if (type === 'registered') {
      customersQuery = customersQuery.not('id', 'is', null)
    } else if (type === 'purchased') {
      customersQuery = customersQuery.not('stripe_customer_id', 'is', null)
    }
    
    if (dateFrom) {
      customersQuery = customersQuery.gte('created_at', dateFrom)
    }
    
    // Apply pagination and sorting
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    customersQuery = customersQuery
      .order('created_at', { ascending: false })
      .range(from, to)
    
    const { data: users, error, count } = await customersQuery
    
    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch customers',
        data: error
      })
    }
    
    // Process customers data to include calculated fields
    const customers = users?.map(user => {
      const orders = user.orders || []
      const orderCount = orders.length
      const totalSpent = orders.reduce((sum, order) => {
        return sum + parseFloat(order.total_amount || '0')
      }, 0)
      
      const lastOrderDate = orders.length > 0 
        ? orders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        : null
      
      return {
        ...user,
        order_count: orderCount,
        total_spent: totalSpent.toString(),
        last_order_date: lastOrderDate,
        // TODO: These will come from separate tables once implemented
        newsletter_subscribed: false,
        contacted_at: null
      }
    }) || []
    
    // Calculate pagination info
    const total = count || 0
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1
    
    return {
      data: customers,
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
    console.error('Error fetching customers:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch customers',
      data: error
    })
  }
})