import Stripe from 'stripe'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database'
import { sendBrevoOrderConfirmation, sendBrevoAdminOrderNotification } from '~/server/services/email/orderService'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2023-10-16'
  })

  // Use service role for payment operations
  const supabase = serverSupabaseServiceRole<Database>(event)

  try {
    const body = await readBody(event)
    const { session_id } = body

    if (!session_id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Session ID is required'
      })
    }

    console.log('=== PAYMENT SUCCESS DEBUG ===')
    console.log('Processing payment success for session:', session_id)
    console.log('Request body:', body)

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['payment_intent', 'line_items']
    })

    console.log('Retrieved Stripe session:', {
      id: session.id,
      payment_status: session.payment_status,
      payment_intent_id: session.payment_intent,
      customer_email: session.customer_email,
      metadata: session.metadata
    })

    if (!session) {
      console.error('Session not found in Stripe')
      throw createError({
        statusCode: 404,
        statusMessage: 'Session not found'
      })
    }

    // Check if payment was successful
    const paymentIntent = session.payment_intent as Stripe.PaymentIntent
    console.log('Payment intent details:', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount
    })

    if (session.payment_status !== 'paid' || paymentIntent.status !== 'succeeded') {
      console.log('Payment not completed:', {
        session_payment_status: session.payment_status,
        payment_intent_status: paymentIntent.status
      })
      return {
        success: false,
        error: 'Payment not completed',
        payment_status: session.payment_status,
        payment_intent_status: paymentIntent.status
      }
    }

    console.log('Payment confirmed successful, processing order...')

    // Find the order by payment intent ID
    console.log('Looking for existing order with payment_intent_id:', paymentIntent.id)

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (
            id,
            name,
            slug,
            download_files,
            file_size,
            file_formats
          )
        )
      `)
      .eq('stripe_payment_intent_id', paymentIntent.id)
      .single()

    console.log('Order query result:', {
      found: !!order,
      error: orderError?.message,
      orderId: order?.id
    })

    if (orderError || !order) {
      console.log('Order not found by payment_intent_id, looking for pending order from session...')

      // Try to find pending order created during checkout
      const { data: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              id,
              name,
              slug,
              download_files,
              file_size,
              file_formats
            )
          )
        `)
        .eq('status', 'pending')
        .eq('payment_status', 'pending')
        .eq('customer_email', session.customer_email || session.metadata?.customer_email)
        .order('created_at', { ascending: false })
        .limit(1)

      console.log('Pending order search result:', {
        found: !!pendingOrders?.length,
        error: pendingError?.message,
        orderId: pendingOrders?.[0]?.id
      })

      if (pendingOrders && pendingOrders.length > 0) {
        const pendingOrder = pendingOrders[0]
        console.log('Found pending order, updating with payment_intent_id:', pendingOrder.id)

        // Update the pending order with payment intent ID and mark as paid
        const { data: updatedOrder, error: updateError } = await supabase
          .from('orders')
          .update({
            stripe_payment_intent_id: paymentIntent.id,
            status: 'completed',
            payment_status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('id', pendingOrder.id)
          .select(`
            *,
            order_items (
              *,
              product:products (
                id,
                name,
                slug,
                download_files,
                file_size,
                file_formats
              )
            )
          `)
          .single()

        if (updateError) {
          console.error('Failed to update pending order:', updateError)
          throw createError({
            statusCode: 500,
            statusMessage: 'Failed to update order'
          })
        }

        console.log('Successfully updated pending order to completed')
        await processSuccessfulOrder(updatedOrder, supabase)
        return { success: true, order_id: updatedOrder.id, updated: true }
      }

      // If no pending order found, create from session as fallback
      console.log('No pending order found, creating from session...')
      const newOrder = await createOrderFromSession(session, supabase)

      if (newOrder) {
        console.log('Successfully created new order:', newOrder.id)
        await processSuccessfulOrder(newOrder, supabase)
        return { success: true, order_id: newOrder.id, created: true }
      } else {
        console.error('Failed to create order from session')
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to process order'
        })
      }
    }

    // Update existing order found by payment_intent_id
    console.log('Found existing order by payment_intent_id, processing:', order.id)
    await processSuccessfulOrder(order, supabase)

    return {
      success: true,
      order_id: order.id,
      message: 'Order processed and emails sent successfully'
    }

  } catch (error: any) {
    console.error('Payment success processing error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process payment success'
    })
  }
})

// Process successful order - update status, generate downloads, send emails
async function processSuccessfulOrder(order: any, supabase: any) {
  try {
    console.log('Processing successful order:', order.id)

    // Update order status
    await supabase
      .from('orders')
      .update({
        status: 'completed',
        payment_status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id)

    // Generate download links for order items
    await generateDownloadLinks(order.id, supabase)

    // Clear user's cart if they were logged in
    if (order.user_id) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', order.user_id)
    }

    // Send emails
    await sendOrderEmails(order)

    console.log('Order processing completed successfully')

  } catch (error) {
    console.error('Error processing successful order:', error)
    throw error
  }
}

// Create order from Stripe session
async function createOrderFromSession(session: Stripe.Checkout.Session, supabase: any) {
  try {
    console.log('=== CREATING ORDER FROM SESSION ===')
    const metadata = session.metadata || {}
    console.log('Session metadata:', metadata)

    const items = JSON.parse(metadata.items || '[]')
    console.log('Parsed items:', items)

    const paymentIntent = session.payment_intent as Stripe.PaymentIntent

    if (!items.length) {
      console.error('No items found in session metadata')
      return null
    }

    // Fetch products
    const productIds = items.map((item: any) => item.product_id)
    console.log('Looking for products with IDs:', productIds)

    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)

    console.log('Products query result:', {
      found: products?.length || 0,
      error: productsError?.message,
      products: products?.map(p => ({ id: p.id, name: p.name }))
    })

    if (productsError || !products?.length) {
      console.error('No products found for order creation:', productsError?.message)
      return null
    }

    // Calculate total
    const totalAmount = products.reduce((sum: number, product: any) => {
      const item = items.find((i: any) => i.product_id === product.id)
      const quantity = item?.quantity || 1
      return sum + (parseFloat(product.price) * quantity)
    }, 0)

    // Create order
    const orderData = {
      user_id: metadata.user_id || null,
      subtotal: totalAmount.toString(),
      total_amount: totalAmount.toString(),
      customer_email: metadata.customer_email || session.customer_email,
      customer_name: session.customer_details?.name,
      status: 'completed',
      payment_status: 'paid',
      stripe_payment_intent_id: paymentIntent.id,
      payment_method: 'card',
      order_number: generateOrderNumber()
    }

    console.log('Creating order with data:', orderData)

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    console.log('Order creation result:', {
      success: !!order,
      orderId: order?.id,
      error: orderError?.message
    })

    if (orderError || !order) {
      console.error('Order creation failed:', orderError)
      throw orderError
    }

    // Create order items
    const orderItems = products.map((product: any) => {
      const item = items.find((i: any) => i.product_id === product.id)
      const quantity = item?.quantity || 1
      const unitPrice = parseFloat(product.price)

      return {
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        product_slug: product.slug,
        unit_price: unitPrice.toString(),
        quantity,
        total_price: (unitPrice * quantity).toString()
      }
    })

    await supabase
      .from('order_items')
      .insert(orderItems)

    // Fetch the complete order with items
    const { data: completeOrder } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          product:products (
            id,
            name,
            slug,
            download_files,
            file_size,
            file_formats
          )
        )
      `)
      .eq('id', order.id)
      .single()

    return completeOrder

  } catch (error) {
    console.error('Error creating order from session:', error)
    return null
  }
}

// Generate download links
async function generateDownloadLinks(orderId: string, supabase: any) {
  try {
    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select(`
        *,
        product:products(download_files)
      `)
      .eq('order_id', orderId)

    if (error || !orderItems) {
      throw error
    }

    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30) // 30 days from now

    for (const item of orderItems) {
      if (item.product?.download_files?.length) {
        const downloadUrl = item.product.download_files[0]

        await supabase
          .from('order_items')
          .update({
            download_url: downloadUrl,
            download_expires_at: expiryDate.toISOString(),
            max_downloads: 5
          })
          .eq('id', item.id)
      }
    }

    console.log(`Generated download links for ${orderItems.length} items`)

  } catch (error) {
    console.error('Error generating download links:', error)
    throw error
  }
}

// Send order confirmation and admin notification emails
async function sendOrderEmails(order: any) {
  try {
    console.log('Sending order emails for order:', order.id)

    // Send customer confirmation email
    try {
      await sendBrevoOrderConfirmation(order)
      console.log('Customer confirmation email sent successfully')
    } catch (emailError) {
      console.error('Failed to send customer confirmation email:', emailError)
    }

    // Send admin notification email
    try {
      await sendBrevoAdminOrderNotification(order)
      console.log('Admin notification email sent successfully')
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError)
    }

  } catch (error) {
    console.error('Error sending order emails:', error)
    // Don't throw error - order processing should continue even if emails fail
  }
}


// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `MIR${timestamp.slice(-6)}${random}`
}
