import { serverSupabaseServiceRole } from '#supabase/server'
import Stripe from 'stripe'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: '2024-06-20'
    })

    const body = await readRawBody(event)
    const signature = getHeader(event, 'stripe-signature')

    if (!signature || !body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing signature or body'
      })
    }

    // Verify webhook signature
    let stripeEvent: Stripe.Event
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        body,
        signature,
        config.stripeWebhookSecret
      )
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message)
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid signature'
      })
    }

    const supabase = serverSupabaseServiceRole<Database>(event)

    // Handle the event
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object as Stripe.Checkout.Session
        const orderId = session.metadata?.order_id

        if (!orderId) {
          console.error('No order_id in session metadata')
          break
        }

        // Update order status to completed
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)

        if (updateError) {
          console.error('Failed to update order status:', updateError)
        } else {
          console.log('Order completed:', orderId)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = stripeEvent.data.object as Stripe.PaymentIntent

        // Find order by payment intent ID
        const { data: order } = await supabase
          .from('orders')
          .select('id')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single()

        if (order) {
          // Update order status to failed
          await supabase
            .from('orders')
            .update({
              status: 'failed',
              updated_at: new Date().toISOString()
            })
            .eq('id', order.id)

          console.log('Order failed:', order.id)
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`)
    }

    return { received: true }

  } catch (error: any) {
    console.error('Webhook error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Webhook processing failed'
    })
  }
})