import nodemailer from 'nodemailer'
import type { Order, OrderItem } from '~/types/database'

interface EmailOrderData extends Order {
  order_items: (OrderItem & {
    product: {
      name: string
      slug: string
    }
  })[]
}

// Create email transporter
function createTransporter() {
  const config = useRuntimeConfig()

  // For development, you can use Gmail SMTP or other providers
  // In production, use a proper email service like SendGrid, Mailgun, etc.
  return nodemailer.createTransport({
    host: config.smtpHost || 'smtp.gmail.com',
    port: parseInt(config.smtpPort || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword
    }
  })
}

// Send new order notification email to admin
export async function sendNewOrderNotification(orderData: EmailOrderData) {
  try {
    const transporter = createTransporter()
    const config = useRuntimeConfig()

    // Format order items for email
    const itemsList = orderData.order_items
      .map(item => `• ${item.product.name} (${item.quantity}x) - $${parseFloat(item.unit_price).toFixed(2)}`)
      .join('\n')

    const totalAmount = parseFloat(orderData.total_amount).toFixed(2)
    const orderDate = new Date(orderData.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Email content
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
                <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                <td style="padding: 8px 0; text-transform: capitalize;">${orderData.status}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Payment Status:</td>
                <td style="padding: 8px 0; text-transform: capitalize;">${orderData.payment_status}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Total Amount:</td>
                <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #8B4513;">$${totalAmount}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #8B4513; margin-top: 0;">Customer Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Name:</td>
                <td style="padding: 8px 0;">${orderData.customer_name || 'Guest'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0;">${orderData.customer_email}</td>
              </tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #8B4513; margin-top: 0;">Order Items</h2>
            <div style="font-family: monospace; background: #f5f5f5; padding: 15px; border-radius: 4px; white-space: pre-line;">${itemsList}</div>
            <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #8B4513; text-align: right;">
              <strong style="font-size: 18px;">Total: $${totalAmount}</strong>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${config.public.siteUrl}/dashboard/orders/${orderData.id}" 
               style="background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Order in Dashboard
            </a>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
          <p>This email was sent automatically when a new order was placed on Miracute.</p>
        </div>
      </div>
    `

    // Plain text version
    const textContent = `
New Order Received! 🎉

Order Details:
- Order Number: #${orderData.order_number}
- Date: ${orderDate}
- Status: ${orderData.status}
- Payment Status: ${orderData.payment_status}
- Total Amount: $${totalAmount}

Customer Information:
- Name: ${orderData.customer_name || 'Guest'}
- Email: ${orderData.customer_email}

Order Items:
${itemsList}

Total: $${totalAmount}

View this order in your dashboard: ${config.public.siteUrl}/dashboard/orders/${orderData.id}
`

    // Send email
    const info = await transporter.sendMail({
      from: `"Miracute Orders" <${config.smtpUser}>`,
      to: 'hello@miracute.com',
      subject,
      text: textContent,
      html: htmlContent
    })

    console.log('New order notification email sent:', info.messageId)
    return { success: true, messageId: info.messageId }

  } catch (error) {
    console.error('Failed to send new order notification:', error)
    return { success: false, error: (error as Error).message }
  }
}

// Send order confirmation email to customer
export async function sendOrderConfirmation(orderData: EmailOrderData) {
  try {
    const transporter = createTransporter()
    const config = useRuntimeConfig()

    // Format order items for email
    const itemsList = orderData.order_items
      .map(item => `• ${item.product.name} (${item.quantity}x) - $${parseFloat(item.unit_price).toFixed(2)}`)
      .join('\n')

    const totalAmount = parseFloat(orderData.total_amount).toFixed(2)
    const orderDate = new Date(orderData.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    // Email content
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

    // Send email
    const info = await transporter.sendMail({
      from: `"Miracute" <${config.smtpUser}>`,
      to: orderData.customer_email,
      subject,
      html: htmlContent
    })

    console.log('Order confirmation email sent:', info.messageId)
    return { success: true, messageId: info.messageId }

  } catch (error) {
    console.error('Failed to send order confirmation:', error)
    return { success: false, error: (error as Error).message }
  }
}
