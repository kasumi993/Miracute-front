import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import Stripe from 'stripe'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  try {
    // Verify user authentication
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const { productId } = await readBody(event)
    if (!productId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product ID is required'
      })
    }

    const supabase = serverSupabaseServiceRole<Database>(event)
    const config = useRuntimeConfig()

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, price, download_files')
      .eq('id', productId)
      .eq('is_active', true)
      .single()

    if (productError || !product) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Product not found'
      })
    }

    // Check if user already owns this product
    const { data: existingPurchase } = await supabase
      .from('order_items')
      .select('id, orders!inner(user_id, status)')
      .eq('product_id', productId)
      .eq('orders.user_id', user.id)
      .eq('orders.status', 'completed')
      .single()

    if (existingPurchase) {
      throw createError({
        statusCode: 400,
        statusMessage: 'You already own this product'
      })
    }

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total_amount: product.price,
        currency: 'usd'
      })
      .select()
      .single()

    if (orderError || !order) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create order'
      })
    }

    // Create order item
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        download_files: product.download_files || []
      })

    if (itemError) {
      // Cleanup order if item creation fails
      await supabase.from('orders').delete().eq('id', order.id)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create order item'
      })
    }

    // Initialize Stripe
    const stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: '2024-06-20'
    })

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: product.name,
              description: `Digital download: ${product.name}`
            },
            unit_amount: Math.round(product.price * 100) // Convert to cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${getHeader(event, 'origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getHeader(event, 'origin')}/checkout/cancelled`,
      metadata: {
        order_id: order.id,
        user_id: user.id,
        product_id: product.id
      }
    })

    // Update order with payment intent ID
    await supabase
      .from('orders')
      .update({ stripe_payment_intent_id: session.payment_intent as string })
      .eq('id', order.id)

    return {
      success: true,
      data: {
        sessionId: session.id,
        url: session.url,
        orderId: order.id
      }
    }

  } catch (error: any) {
    console.error('Checkout error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to create checkout session'
    })
  }
})