import { validateAdminAccess } from '../../../utils/adminAuth'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const { supabase } = await validateAdminAccess(event)
  const orderId = getRouterParam(event, 'id')
  
  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order ID is required'
    })
  }
  
  try {
    // Fetch order with items and product details
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (
            name,
            slug,
            preview_images
          )
        )
      `)
      .eq('id', orderId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Order not found'
        })
      }
      
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch order',
        data: error
      })
    }
    
    return {
      data: order
    }
    
  } catch (error: any) {
    console.error('Error fetching order details:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch order details',
      data: error
    })
  }
})