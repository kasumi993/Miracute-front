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

  try {
    // Get all orders for the user with detailed info
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        customer_email,
        status,
        payment_status,
        total_amount,
        stripe_payment_intent_id,
        order_number,
        created_at,
        order_items(
          id,
          product_id,
          product_name,
          unit_price,
          quantity,
          download_url,
          product:products(
            id,
            name,
            slug
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {throw error}

    return {
      success: true,
      user_id: user.id,
      user_email: user.email,
      orders_count: orders?.length || 0,
      orders: orders || [],
      debug_info: {
        timestamp: new Date().toISOString(),
        query_ran: true
      }
    }

  } catch (error: any) {
    console.error('Debug orders error:', error)
    return {
      success: false,
      error: error.message,
      user_id: user.id,
      user_email: user.email,
      orders_count: 0,
      orders: [],
      debug_info: {
        timestamp: new Date().toISOString(),
        error_occurred: true
      }
    }
  }
})
