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

  try {
    // Get all statistics in parallel
    const [
      ordersResult,
      productsResult,
      usersResult,
      revenueResult
    ] = await Promise.all([
      // Total and pending orders
      supabase
        .from('orders')
        .select('status', { count: 'exact' }),
      
      // Total products
      supabase
        .from('products')
        .select('id', { count: 'exact' })
        .eq('is_active', true),
      
      // Total customers
      supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('role', 'customer'),
      
      // Revenue calculation
      supabase
        .from('orders')
        .select('total_amount, status')
        .eq('payment_status', 'paid')
    ])

    // Process orders data
    const allOrders = ordersResult.data || []
    const totalOrders = ordersResult.count || 0
    const pendingOrders = allOrders.filter(order => order.status === 'pending').length
    const completedOrders = allOrders.filter(order => order.status === 'completed').length

    // Calculate revenue
    const revenueOrders = revenueResult.data || []
    const totalRevenue = revenueOrders.reduce((sum, order) => {
      return sum + parseFloat(order.total_amount || '0')
    }, 0)

    // Get monthly revenue for growth calculation
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: recentRevenue } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .eq('payment_status', 'paid')
      .gte('created_at', thirtyDaysAgo.toISOString())

    const monthlyRevenue = (recentRevenue || []).reduce((sum, order) => {
      return sum + parseFloat(order.total_amount || '0')
    }, 0)

    // Additional metrics
    const { data: topCategories } = await supabase
      .from('products')
      .select('category_id, categories(name)')
      .eq('is_active', true)
      .not('category_id', 'is', null)

    const categoryStats = {}
    topCategories?.forEach(product => {
      const categoryName = product.categories?.name
      if (categoryName) {
        categoryStats[categoryName] = (categoryStats[categoryName] || 0) + 1
      }
    })

    return {
      success: true,
      data: {
        // Main metrics
        totalRevenue: totalRevenue.toFixed(2),
        totalOrders,
        totalCustomers: usersResult.count || 0,
        totalProducts: productsResult.count || 0,
        
        // Order breakdown
        pendingOrders,
        completedOrders,
        orderCompletionRate: totalOrders > 0 ? 
          Math.round((completedOrders / totalOrders) * 100) : 0,
        
        // Revenue metrics
        monthlyRevenue: monthlyRevenue.toFixed(2),
        averageOrderValue: totalOrders > 0 ? 
          (totalRevenue / totalOrders).toFixed(2) : '0.00',
        
        // Growth indicators (you can enhance these with historical data)
        revenueGrowth: 0, // Calculate based on previous period
        orderGrowth: 0, // Calculate based on previous period
        customerGrowth: 0, // Calculate based on previous period
        
        // Category distribution
        topCategories: Object.entries(categoryStats)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }))
      }
    }

  } catch (error: any) {
    console.error('Error fetching admin stats:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch admin statistics'
    })
  }
})