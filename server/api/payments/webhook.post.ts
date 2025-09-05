import Stripe from 'stripe'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database'
import * as brevo from '@getbrevo/brevo'
// import { sendBrevoReviewRequestEmail } from '~/server/utils/brevoService'

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
          await sendOrderConfirmation(finalOrder)
        } catch (emailError) {
          console.error('Failed to send customer confirmation email:', emailError)
          // Don't throw error - order processing should continue even if email fails
        }

        // Schedule review request email (send after 3 days)
        try {
          setTimeout(async () => {
            try {
              await sendReviewRequestEmail(finalOrder)
            } catch (reviewEmailError) {
              console.error('Failed to send review request email:', reviewEmailError)
            }
          }, 3 * 24 * 60 * 60 * 1000) // 3 days in milliseconds
        } catch (error) {
          console.error('Failed to schedule review request email:', error)
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

  // Inline email functions
  async function sendOrderConfirmation(order: any) {
    try {
      const config = useRuntimeConfig()
      const apiInstance = new brevo.TransactionalEmailsApi()
      apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, config.brevoApiKey)
      
      const itemsHtml = order.order_items?.map((item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${item.product?.name || item.product_name || 'Product'}</strong><br>
            <small style="color: #666;">Quantity: ${item.quantity}</small>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            $${parseFloat(item.unit_price).toFixed(2)}
          </td>
        </tr>
      `).join('') || ''
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B4513, #A0522D); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Order Confirmation ✨</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for your purchase!</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #8B4513; margin-top: 0;">Order Details</h2>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Total:</strong> $${parseFloat(order.total_amount).toFixed(2)}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h2 style="color: #8B4513; margin-top: 0;">Your Templates</h2>
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
              </table>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
            <p>Download your templates from your account dashboard</p>
            <p>Thank you for choosing Miracute! ✨</p>
          </div>
        </div>
      `
      
      const sendSmtpEmail = new brevo.SendSmtpEmail()
      sendSmtpEmail.to = [{ email: order.customer_email, name: order.customer_name || order.customer_email.split('@')[0] }]
      sendSmtpEmail.subject = `Your Miracute Templates are Ready! - Order ${order.id}`
      sendSmtpEmail.htmlContent = htmlContent
      sendSmtpEmail.sender = { email: 'hello@miracute.com', name: 'Miracute' }
      
      await apiInstance.sendTransacEmail(sendSmtpEmail)
      return { success: true }
      
    } catch (error: any) {
      console.error('Failed to send order confirmation email:', error)
      return { success: false, error: error.message }
    }
  }

  async function sendAdminOrderNotification(order: any) {
    try {
      const config = useRuntimeConfig()
      const apiInstance = new brevo.TransactionalEmailsApi()
      apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, config.brevoApiKey)
      
      const itemsHtml = order.order_items?.map((item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${item.product?.name || item.product_name || 'Product'}</strong><br>
            <small style="color: #666;">Qty: ${item.quantity} × $${parseFloat(item.unit_price).toFixed(2)}</small>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            $${parseFloat(item.total_price || item.unit_price).toFixed(2)}
          </td>
        </tr>
      `).join('') || ''
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B4513, #A0522D); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎉 New Order!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Someone just purchased your templates</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #8B4513; margin-top: 0;">Order Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Order ID:</td>
                  <td style="padding: 8px 0;">${order.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Customer:</td>
                  <td style="padding: 8px 0;">${order.customer_email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Total:</td>
                  <td style="padding: 8px 0; color: #28a745; font-weight: bold;">$${parseFloat(order.total_amount).toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                  <td style="padding: 8px 0;">
                    <span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                      ${order.status?.toUpperCase() || 'COMPLETED'}
                    </span>
                  </td>
                </tr>
              </table>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h2 style="color: #8B4513; margin-top: 0;">Items Purchased</h2>
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
              </table>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
            <p>🎨 Another happy customer with your amazing templates!</p>
          </div>
        </div>
      `
      
      const sendSmtpEmail = new brevo.SendSmtpEmail()
      sendSmtpEmail.to = [{ email: 'hello@miracute.com', name: 'Miracute Admin' }]
      sendSmtpEmail.subject = `💰 New Order: $${parseFloat(order.total_amount).toFixed(2)} - ${order.id}`
      sendSmtpEmail.htmlContent = htmlContent
      sendSmtpEmail.sender = { email: 'orders@miracute.com', name: 'Miracute Orders' }
      
      await apiInstance.sendTransacEmail(sendSmtpEmail)
      return { success: true }
      
    } catch (error: any) {
      console.error('Failed to send admin order notification:', error)
      return { success: false, error: error.message }
    }
  }

  // Inline review request email function
  async function sendReviewRequestEmail(orderData: any) {
    try {
      const config = useRuntimeConfig()
      const apiInstance = new brevo.TransactionalEmailsApi()
      apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, config.brevoApiKey)
      
      // Generate review token helper function
      const generateReviewToken = (orderId: string, productId: string): string => {
        const crypto = require('crypto')
        const data = `${orderId}-${productId}-${Date.now()}`
        return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16)
      }
      
      const itemsList = orderData.order_items
        ?.map((item: any) => `
          <div style="border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 16px; background: white;">
            <h3 style="margin: 0 0 10px 0; color: #8B4513; font-size: 16px;">${item.product?.name || item.product_name}</h3>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${config.public.siteUrl}/reviews/submit?product=${item.product_id}&order=${orderData.id}&token=${generateReviewToken(orderData.id, item.product_id)}"
                 style="background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                ⭐ Write a Review
              </a>
            </div>
          </div>
        `).join('') || ''
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B4513, #A0522D); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">How was your experience? ⭐</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We'd love to hear your thoughts!</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #8B4513; margin-top: 0;">Hi ${orderData.customer_name?.split(' ')[0] || 'there'}! 👋</h2>
              <p style="margin-bottom: 20px;">Thank you for your recent purchase from Miracute! I hope you're loving your new templates.</p>
              <p style="margin-bottom: 20px;">As a small business, your feedback means the world to me. Would you take a moment to share your experience with others?</p>
              <p style="margin-bottom: 20px;"><strong>Your honest review helps other customers find the perfect templates and helps me improve my designs.</strong></p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3 style="color: #8B4513; margin-bottom: 16px;">Please review your templates:</h3>
              ${itemsList}
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #8B4513;">
              <p style="margin: 0; font-style: italic; color: #666;">
                "Every review, whether it's 5 stars or suggestions for improvement, helps me create better templates for amazing customers like you!" - The Designer
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
            <p>Thank you for choosing Miracute! ✨</p>
            <p style="margin-top: 10px;">Questions? Reply to this email - I read every message personally!</p>
          </div>
        </div>
      `
      
      const sendSmtpEmail = new brevo.SendSmtpEmail()
      sendSmtpEmail.to = [{ email: orderData.customer_email, name: orderData.customer_name }]
      sendSmtpEmail.subject = '⭐ How was your Miracute experience? Quick review request'
      sendSmtpEmail.htmlContent = htmlContent
      sendSmtpEmail.sender = { email: 'hello@miracute.com', name: 'Miracute' }
      
      await apiInstance.sendTransacEmail(sendSmtpEmail)
      return { success: true }
      
    } catch (error: any) {
      console.error('Failed to send review request email:', error)
      return { success: false, error: error.message }
    }
  }

})