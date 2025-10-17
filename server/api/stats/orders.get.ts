import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '@/types/database'
import { createApiResponse } from '../../utils/apiResponse'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  try {
    const query = getQuery(event)
    const startDate = (query.startDate as string) || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const endDate = (query.endDate as string) || new Date().toISOString().split('T')[0]

    // Get recent orders with product details
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        *,
        order_items(
          *,
          product:products(
            id,
            name,
            preview_images
          )
        ),
        user:users(
          email,
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get order stats by status
    const { data: orderStatusData } = await supabase
      .from('orders')
      .select('payment_status')
      .gte('created_at', `${startDate}T00:00:00.000Z`)
      .lte('created_at', `${endDate}T23:59:59.999Z`)

    const orderStats = {
      totalOrders: (orderStatusData as any[])?.length || 0,
      pendingOrders: (orderStatusData as any[])?.filter((o: any) => o.payment_status === 'pending').length || 0,
      processingOrders: (orderStatusData as any[])?.filter((o: any) => o.payment_status === 'processing').length || 0,
      paidOrders: (orderStatusData as any[])?.filter((o: any) => o.payment_status === 'paid').length || 0,
      failedOrders: (orderStatusData as any[])?.filter((o: any) => o.payment_status === 'failed').length || 0,
      cancelledOrders: (orderStatusData as any[])?.filter((o: any) => o.payment_status === 'cancelled').length || 0
    }

    return createApiResponse({
      recentOrders: recentOrders || [],
      orderStats
    })

  } catch (error: any) {
    console.error('Order stats API error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch order stats'
    })
  }
})