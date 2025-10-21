import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '@/types/database'
import { isAdminUser } from '../../utils/security/auth'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  // Check if user is admin
  const isAdmin = await isAdminUser(user.id, event)

  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required for analytics'
    })
  }

  try {
    const query = getQuery(event)
    const { period = 'today', from, to, simple = false } = query

    const supabase = serverSupabaseServiceRole<Database>(event)

    // Handle simple stats request (legacy stats.get.ts functionality)
    if (simple === 'true' || simple === true) {
      const [ordersResult, productsResult, reviewsResult] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact' }),
        supabase.from('products').select('*', { count: 'exact' }),
        supabase.from('reviews').select('*', { count: 'exact' })
      ])

      const stats = {
        orders: ordersResult.count || 0,
        products: productsResult.count || 0,
        reviews: reviewsResult.count || 0,
        revenue: 0 // Placeholder for revenue calculation
      }

      return {
        success: true,
        data: stats
      }
    }

    // Calculate date range based on period for detailed analytics
    let startDate, endDate
    const now = new Date()

    if (from && to) {
      startDate = new Date(from as string)
      endDate = new Date(to as string)
      endDate.setHours(23, 59, 59, 999) // End of day
    } else {
      switch (period) {
        case 'today':
          startDate = new Date(now)
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(now)
          endDate.setHours(23, 59, 59, 999)
          break
        case 'yesterday':
          startDate = new Date(now)
          startDate.setDate(now.getDate() - 1)
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(now)
          endDate.setDate(now.getDate() - 1)
          endDate.setHours(23, 59, 59, 999)
          break
        case 'week':
          startDate = new Date(now)
          startDate.setDate(now.getDate() - 7)
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(now)
          endDate.setHours(23, 59, 59, 999)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
          break
        default:
          startDate = new Date(now)
          startDate.setHours(0, 0, 0, 0)
          endDate = new Date(now)
          endDate.setHours(23, 59, 59, 999)
      }
    }

    // Get detailed analytics data
    const [orders, products, users] = await Promise.all([
      // Orders analytics
      supabase
        .from('orders')
        .select('id, total_amount, created_at, status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),

      // Popular products
      supabase
        .from('products')
        .select('id, name, view_count, created_at')
        .order('view_count', { ascending: false })
        .limit(10),

      // User registrations
      supabase
        .from('profiles')
        .select('id, created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
    ])

    const analytics = {
      period: { startDate, endDate, period },
      orders: {
        total: orders.data?.length || 0,
        revenue: orders.data?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0,
        pending: orders.data?.filter(o => o.status === 'pending').length || 0,
        completed: orders.data?.filter(o => o.status === 'completed').length || 0,
      },
      products: {
        popular: products.data || [],
        totalViews: products.data?.reduce((sum, product) => sum + (product.view_count || 0), 0) || 0
      },
      users: {
        newRegistrations: users.data?.length || 0
      }
    }

    return {
      success: true,
      data: analytics
    }

  } catch (error: any) {
    console.error('Analytics error:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch analytics data'
    })
  }
})