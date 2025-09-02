import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)
  const orderId = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order ID is required'
    })
  }
  
  try {
    // Validate the status if provided
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled', 'refunded']
    if (body.status && !validStatuses.includes(body.status)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid order status'
      })
    }
    
    // Update the order
    const { data, error } = await supabase
      .from('orders')
      .update({
        status: body.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()
    
    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update order',
        data: error
      })
    }
    
    return {
      success: true,
      data,
      message: 'Order updated successfully'
    }
    
  } catch (error: any) {
    console.error('Error updating order:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update order',
      data: error
    })
  }
})