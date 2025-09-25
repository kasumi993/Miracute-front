import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseServiceRole<Database>(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  try {
    // Get total orders count and amount
    const { data: orderStats, error: orderError } = await supabase
      .from('orders')
      .select('id, total_amount, status')
      .eq('user_id', user.id)

    if (orderError) {throw orderError}

    // Calculate statistics
    const totalOrders = orderStats?.length || 0
    const totalSpent = orderStats?.reduce((sum, order) => {
      return sum + parseFloat(order.total_amount || '0')
    }, 0) || 0

    // Get total downloads count
    const { data: downloadStats, error: downloadError } = await supabase
      .from('order_items')
      .select('download_count')
      .in('order_id',
        orderStats?.map(o => o.id) || []
      )

    const totalDownloads = downloadStats?.reduce((sum, item) => {
      return sum + (item.download_count || 0)
    }, 0) || 0

    return {
      success: true,
      data: {
        totalOrders,
        totalSpent: totalSpent.toFixed(2),
        totalDownloads,
        completedOrders: orderStats?.filter(o => o.status === 'completed').length || 0,
        pendingOrders: orderStats?.filter(o => o.status === 'pending').length || 0
      }
    }

  } catch (error: any) {
    console.error('Error fetching account stats:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch account statistics'
    })
  }
})
