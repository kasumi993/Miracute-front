import Stripe from 'stripe'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database'
import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2023-10-16'
  })

  // Use service role for webhook operations
  const supabase = serverSupabaseServiceRole<Database>(event)

  try {
    // Get the raw body
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
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid signature'
      })
    }

    console.log(`Processing webhook event: ${stripeEvent.type}`)

    // Handle different event types
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeEvent.data.object as Stripe.Checkout.Session)
        break

      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object as Stripe.PaymentIntent)
        break

      case 'customer.created':
        await handleCustomerCreated(stripeEvent.data.object as Stripe.Customer)
        break

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`)
    }

    return { success: true, received: true }

  } catch (error: any) {
    console.error('Webhook error:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Webhook processing failed'
    })
  }

  // Webhook event handlers
  async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    console.log('Processing checkout completion for session:', session.id)

    try {
      // Get the payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(
        session.payment_intent as string
      )

      // Update order status
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .update({
          status: 'completed',
          payment_status: 'paid',
          payment_method: paymentIntent.payment_method_types[0] || 'card',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', session.payment_intent)
        .select()
        .single()

      if (orderError) {
        // If order doesn't exist, create it from session metadata
        if (orderError.code === 'PGRST116') {
          const newOrder = await createOrderFromSession(session)
          if (newOrder) {
            await generateDownloadLinks(newOrder.id)
          }
        } else {
          throw orderError
        }
      } else if (order) {
        // Generate download links for existing order
        await generateDownloadLinks(order.id)
      }

      // Clear user's cart if they were logged in
      if (session.metadata?.user_id) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', session.metadata.user_id)
      }

      // Send email notifications for completed orders
      const finalOrder = order || await getOrderWithItems(session.payment_intent as string)
      if (finalOrder) {
        // Send notification email to admin
        try {
          await sendAdminOrderNotification(finalOrder)
        } catch (emailError) {
          console.error('Failed to send admin notification email:', emailError)
          // Don't throw error - order processing should continue even if email fails
        }

        // Send confirmation email to customer
        try {
          await sendCustomerOrderConfirmation(finalOrder)
        } catch (emailError) {
          console.error('Failed to send customer confirmation email:', emailError)
          // Don't throw error - order processing should continue even if email fails
        }
      }

      console.log('Checkout completion processed successfully')

    } catch (error) {
      console.error('Error processing checkout completion:', error)
      throw error
    }
  }

  async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    console.log('Payment succeeded for:', paymentIntent.id)

    try {
      // Update order payment status
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntent.id)

    } catch (error) {
      console.error('Error updating payment status:', error)
      throw error
    }
  }

  async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    console.log('Payment failed for:', paymentIntent.id)

    try {
      // Update order payment status
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntent.id)

    } catch (error) {
      console.error('Error updating failed payment:', error)
      throw error
    }
  }

  async function handleCustomerCreated(customer: Stripe.Customer) {
    console.log('Customer created:', customer.id)

    // If customer has user_id in metadata, link it to the user
    if (customer.metadata?.user_id) {
      try {
        await supabase
          .from('users')
          .update({ stripe_customer_id: customer.id })
          .eq('id', customer.metadata.user_id)
      } catch (error) {
        console.error('Error linking Stripe customer to user:', error)
      }
    }
  }

  async function createOrderFromSession(session: Stripe.Checkout.Session) {
    try {
      const metadata = session.metadata || {}
      const items = JSON.parse(metadata.items || '[]')

      if (!items.length) {
        console.error('No items found in session metadata')
        return null
      }

      // Fetch products
      const productIds = items.map((item: any) => item.product_id)
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds)

      if (!products?.length) {
        console.error('No products found for order creation')
        return null
      }

      // Calculate total
      const totalAmount = products.reduce((sum, product) => {
        const item = items.find((i: any) => i.product_id === product.id)
        const quantity = item?.quantity || 1
        return sum + (parseFloat(product.price) * quantity)
      }, 0)

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: metadata.user_id || null,
          subtotal: totalAmount.toString(),
          total_amount: totalAmount.toString(),
          customer_email: metadata.customer_email || session.customer_email,
          status: 'completed',
          payment_status: 'paid',
          stripe_payment_intent_id: session.payment_intent as string,
          payment_method: 'card'
        })
        .select()
        .single()

      if (orderError || !order) {
        throw orderError
      }

      // Create order items
      const orderItems = products.map(product => {
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

      return order

    } catch (error) {
      console.error('Error creating order from session:', error)
      return null
    }
  }

  async function generateDownloadLinks(orderId: string) {
    try {
      // Get order items
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

      // Generate secure download links for each item
      const updates = []
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + 30) // 30 days from now

      for (const item of orderItems) {
        if (item.product?.download_files?.length) {
          // For now, we'll use the first download file
          // In production, you'd create signed URLs for secure downloads
          const downloadUrl = item.product.download_files[0]
          
          updates.push({
            id: item.id,
            download_url: downloadUrl,
            download_expires_at: expiryDate.toISOString(),
            max_downloads: 5
          })
        }
      }

      if (updates.length > 0) {
        // Update order items with download links
        for (const update of updates) {
          await supabase
            .from('order_items')
            .update({
              download_url: update.download_url,
              download_expires_at: update.download_expires_at,
              max_downloads: update.max_downloads
            })
            .eq('id', update.id)
        }
      }

      console.log(`Generated download links for ${updates.length} items`)

    } catch (error) {
      console.error('Error generating download links:', error)
      throw error
    }
  }

  async function getOrderWithItems(paymentIntentId: string) {
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              name,
              slug
            )
          )
        `)
        .eq('stripe_payment_intent_id', paymentIntentId)
        .single()

      if (error || !order) {
        console.error('Error fetching order with items:', error)
        return null
      }

      return order
    } catch (error) {
      console.error('Error in getOrderWithItems:', error)
      return null
    }
  }

  // Email functions
  function createEmailTransporter() {
    const config = useRuntimeConfig()
    
    return nodemailer.createTransporter({
      host: config.smtpHost || 'smtp.gmail.com',
      port: parseInt(config.smtpPort || '587'),
      secure: false,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword
      }
    })
  }

  async function sendAdminOrderNotification(orderData: any) {
    try {
      const transporter = createEmailTransporter()
      const config = useRuntimeConfig()
      
      const itemsList = orderData.order_items
        .map((item: any) => `• ${item.product.name} (${item.quantity}x) - $${parseFloat(item.unit_price).toFixed(2)}`)
        .join('\n')
      
      const totalAmount = parseFloat(orderData.total_amount).toFixed(2)
      const orderDate = new Date(orderData.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      const subject = `🎉 New Order #${orderData.order_number} - $${totalAmount}`
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B4513, #A0522D); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎉 New Order Received!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">You have a new order on Miracute</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #8B4513; margin-top: 0;">Order Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Order Number:</td>
                  <td style="padding: 8px 0;">#${orderData.order_number}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Date:</td>
                  <td style="padding: 8px 0;">${orderDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Customer:</td>
                  <td style="padding: 8px 0;">${orderData.customer_name || 'Guest'} (${orderData.customer_email})</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Total Amount:</td>
                  <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #8B4513;">$${totalAmount}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h2 style="color: #8B4513; margin-top: 0;">Order Items</h2>
              <div style="font-family: monospace; background: #f5f5f5; padding: 15px; border-radius: 4px; white-space: pre-line;">${itemsList}</div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${config.public.siteUrl}/dashboard/orders/${orderData.id}" 
                 style="background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Order in Dashboard
              </a>
            </div>
          </div>
        </div>
      `
      
      await transporter.sendMail({
        from: `"Miracute Orders" <${config.smtpUser}>`,
        to: 'hello@miracute.com',
        subject,
        html: htmlContent
      })
      
      console.log('Admin order notification sent successfully')
      
    } catch (error) {
      console.error('Failed to send admin notification:', error)
      throw error
    }
  }

  async function sendCustomerOrderConfirmation(orderData: any) {
    try {
      const transporter = createEmailTransporter()
      const config = useRuntimeConfig()
      
      const itemsList = orderData.order_items
        .map((item: any) => `• ${item.product.name} (${item.quantity}x) - $${parseFloat(item.unit_price).toFixed(2)}`)
        .join('\n')
      
      const totalAmount = parseFloat(orderData.total_amount).toFixed(2)
      const orderDate = new Date(orderData.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
      
      const subject = `Order Confirmation #${orderData.order_number} - Thank you for your purchase!`
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B4513, #A0522D); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Thank you for your order!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your templates are ready for download</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #8B4513; margin-top: 0;">Order Summary</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Order Number:</td>
                  <td style="padding: 8px 0;">#${orderData.order_number}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Date:</td>
                  <td style="padding: 8px 0;">${orderDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Total Amount:</td>
                  <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #8B4513;">$${totalAmount}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h2 style="color: #8B4513; margin-top: 0;">Your Items</h2>
              <div style="font-family: monospace; background: #f5f5f5; padding: 15px; border-radius: 4px; white-space: pre-line;">${itemsList}</div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="margin-bottom: 20px; font-size: 16px;">Your download links will be available in your account dashboard.</p>
              <a href="${config.public.siteUrl}/account/orders" 
                 style="background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Access Your Downloads
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
            <p>Need help? Contact us at hello@miracute.com</p>
            <p style="margin-top: 10px;">Thank you for choosing Miracute! ✨</p>
          </div>
        </div>
      `
      
      await transporter.sendMail({
        from: `"Miracute" <${config.smtpUser}>`,
        to: orderData.customer_email,
        subject,
        html: htmlContent
      })
      
      console.log('Customer order confirmation sent successfully')
      
    } catch (error) {
      console.error('Failed to send customer confirmation:', error)
      throw error
    }
  }
})