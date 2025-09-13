import Stripe from 'stripe'
import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const sessionId = getRouterParam(event, 'sessionId')

  if (!sessionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Session ID is required'
    })
  }

  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2023-10-16'
  })

  const supabase = await serverSupabaseClient<Database>(event)

  try {
    // Retrieve the Stripe checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent']
    })

    if (!session) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Checkout session not found'
      })
    }

    // Get the order from our database using the payment intent ID
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_payment_intent_id', session.payment_intent?.id || session.payment_intent)
      .single()

    if (orderError || !order) {
      // If no order found, it might still be processing
      if (session.payment_status === 'paid') {
        throw createError({
          statusCode: 202, // Accepted - still processing
          statusMessage: 'Order is still being processed. Please check back in a moment.'
        })
      } else {
        throw createError({
          statusCode: 404,
          statusMessage: 'Order not found'
        })
      }
    }

    // Get order items with product details
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products(
          name,
          slug,
          preview_images
        )
      `)
      .eq('order_id', order.id)

    if (itemsError) {
      console.error('Error fetching order items:', itemsError)
    }

    // Return the order data
    return {
      success: true,
      data: {
        session: {
          id: session.id,
          status: session.status,
          payment_status: session.payment_status,
          amount_total: session.amount_total,
          currency: session.currency,
          customer_email: session.customer_email
        },
        order: {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          payment_status: order.payment_status,
          total_amount: order.total_amount,
          customer_email: order.customer_email,
          customer_name: order.customer_name,
          created_at: order.created_at
        },
        items: orderItems || []
      }
    }

  } catch (error: any) {
    console.error('Error retrieving checkout session:', error)

    // Handle Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Checkout session not found'
      })
    }

    // Re-throw our custom errors
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve order information'
    })
  }
})
