import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)
  const orderId = getRouterParam(event, 'id')

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order ID is required'
    })
  }

  try {
    // Fetch specific order with order items and product details
    const { data: order, error } = await supabase
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
            preview_images,
            file_size,
            file_formats,
            download_files
          )
        )
      `)
      .eq('id', orderId)
      .eq('user_id', user.id) // Ensure user can only access their own orders
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Order not found'
        })
      }
      throw error
    }

    if (!order) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Order not found'
      })
    }

    return {
      success: true,
      data: order
    }

  } catch (error: any) {
    console.error('Error fetching order:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch order'
    })
  }
})