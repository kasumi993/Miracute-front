import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  try {
    // Verify user authentication
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const supabase = serverSupabaseServiceRole<Database>(event)

    // Get user's completed orders with items
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        total_amount,
        currency,
        created_at,
        order_items (
          product_name,
          download_files
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch orders'
      })
    }

    // Transform the data to match our UserOrder type
    const userOrders = orders?.map(order => ({
      id: order.id,
      status: order.status,
      total_amount: order.total_amount,
      currency: order.currency,
      created_at: order.created_at,
      items: order.order_items.map(item => ({
        product_name: item.product_name,
        download_files: item.download_files || []
      }))
    })) || []

    return {
      success: true,
      data: userOrders
    }

  } catch (error: any) {
    console.error('Get user orders error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to fetch orders'
    })
  }
})