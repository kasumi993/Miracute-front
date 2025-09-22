// User statistics API endpoint
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

    const supabase = serverSupabaseServiceRole(event)

    // Get user orders count and total spent
    const { data: orderStats } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .eq('user_id', user.id)
      .eq('payment_status', 'paid')

    // Get user downloads count
    const { data: downloadStats } = await supabase
      .from('order_items')
      .select(`
        id,
        download_count,
        orders!inner(user_id, payment_status)
      `)
      .eq('orders.user_id', user.id)
      .eq('orders.payment_status', 'paid')

    // Calculate statistics
    const totalOrders = orderStats?.length || 0
    const totalSpent = orderStats?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0
    const totalDownloads = downloadStats?.reduce((sum, item) => sum + (item.download_count || 0), 0) || 0

    // Calculate account age in days
    const accountCreated = new Date(user.created_at)
    const accountAge = Math.floor((Date.now() - accountCreated.getTime()) / (1000 * 60 * 60 * 24))

    return {
      success: true,
      data: {
        totalOrders,
        totalSpent: totalSpent.toFixed(2),
        totalDownloads,
        accountAge,
        favoriteProducts: [] // TODO: Implement favorites/wishlist
      }
    }

  } catch (error: any) {
    console.error('User stats error:', error)
    return {
      success: false,
      error: 'Failed to fetch user statistics',
      details: error.message
    }
  }
})