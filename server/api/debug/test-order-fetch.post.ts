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

  const body = await readBody(event)
  const { order_id } = body

  try {
    const results = {
      user_id: user.id,
      user_email: user.email,
      test_order_id: order_id,
      timestamp: new Date().toISOString(),
      tests: {} as any
    }

    // Test 1: Direct order fetch by ID
    if (order_id) {
      try {
        const { data: directOrder, error: directError } = await supabase
          .from('orders')
          .select(`
            *,
            order_items(
              *,
              product:products(
                id,
                name,
                slug,
                description,
                short_description,
                file_size,
                file_formats,
                download_files
              )
            )
          `)
          .eq('id', order_id)
          .eq('user_id', user.id)
          .single()

        results.tests.direct_order_fetch = {
          success: !!directOrder,
          error: directError?.message,
          order_found: !!directOrder,
          items_count: directOrder?.order_items?.length || 0
        }
      } catch (error: any) {
        results.tests.direct_order_fetch = {
          success: false,
          error: error.message
        }
      }
    }

    // Test 2: Account orders endpoint simulation
    try {
      const query = order_id ? { order_id } : {}
      console.log('Testing with query:', query)

      let queryBuilder = supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            product:products(
              id,
              name,
              slug,
              description,
              short_description,
              file_size,
              file_formats,
              download_files
            )
          )
        `, { count: 'exact' })
        .eq('user_id', user.id)

      if (order_id) {
        queryBuilder = queryBuilder.eq('id', order_id)
      }

      const { data: orders, count, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .range(0, 4)

      results.tests.account_orders_simulation = {
        success: !!orders,
        error: error?.message,
        orders_count: orders?.length || 0,
        total_count: count || 0,
        orders: orders?.map((o: any) => ({
          id: o.id,
          payment_status: o.payment_status,
          items_count: o.order_items?.length || 0
        }))
      }
    } catch (error: any) {
      results.tests.account_orders_simulation = {
        success: false,
        error: error.message
      }
    }

    // Test 3: Check for paid orders
    try {
      const { data: paidOrders, error: paidError } = await supabase
        .from('orders')
        .select(`
          id,
          payment_status,
          created_at,
          order_items(count)
        `)
        .eq('user_id', user.id)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false })

      results.tests.paid_orders_check = {
        success: !!paidOrders,
        error: paidError?.message,
        paid_orders_count: paidOrders?.length || 0,
        paid_orders: paidOrders?.map((o: any) => ({
          id: o.id,
          payment_status: o.payment_status,
          created_at: o.created_at
        }))
      }
    } catch (error: any) {
      results.tests.paid_orders_check = {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      results
    }

  } catch (error: any) {
    console.error('Test order fetch error:', error)
    return {
      success: false,
      error: error.message,
      user_id: user.id
    }
  }
})
