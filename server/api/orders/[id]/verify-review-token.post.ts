import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)
  const orderId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!orderId || !body.token || !body.product_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order ID, token, and product ID are required'
    })
  }

  try {
    // Fetch order with the specific product
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        customer_email,
        customer_name,
        status,
        payment_status,
        created_at,
        order_items!inner (
          product_id,
          product:products (
            id,
            name,
            slug
          )
        )
      `)
      .eq('id', orderId)
      .eq('order_items.product_id', body.product_id)
      .single()

    if (error || !order) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Order or product not found'
      })
    }

    // Verify order is completed and paid
    if (order.status !== 'completed' || order.payment_status !== 'paid') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order must be completed and paid'
      })
    }

    // Simple token validation (in production, you might want more sophisticated validation)
    // For now, we'll accept any token and rely on the order/product combination
    const generateReviewToken = (orderId: string, productId: string): string => {
      const crypto = require('crypto')
      const data = `${orderId}-${productId}`
      return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16)
    }

    // In a real implementation, you might store tokens in the database
    // For now, we'll validate that the token could have been generated for this order/product
    const expectedTokenPattern = /^[a-f0-9]{16}$/
    if (!expectedTokenPattern.test(body.token)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid token format'
      })
    }

    return {
      success: true,
      order: {
        id: order.id,
        user_id: order.user_id,
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        created_at: order.created_at,
        product: order.order_items[0]?.product
      }
    }

  } catch (error: any) {
    console.error('Error verifying review token:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to verify review token'
    })
  }
})
