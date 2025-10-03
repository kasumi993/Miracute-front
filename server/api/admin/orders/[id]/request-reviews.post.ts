import { requireAdminAuthentication } from '../../../../utils/auth'
import { sendBrevoReviewRequestEmail } from '../../../../utils/email'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdminAuthentication(event)
  const orderId = getRouterParam(event, 'id')

  if (!orderId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order ID is required'
    })
  }

  try {
    // Fetch order with items for email
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (
            id,
            name,
            slug
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

    // Check if order is completed and paid
    if (order.status !== 'completed' || order.payment_status !== 'paid') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order must be completed and paid to request reviews'
      })
    }

    // Send review request email
    await sendBrevoReviewRequestEmail(order)

    return {
      success: true,
      message: 'Review request email sent successfully'
    }

  } catch (error: any) {
    console.error('Error sending review request email:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send review request email',
      data: error
    })
  }

})
