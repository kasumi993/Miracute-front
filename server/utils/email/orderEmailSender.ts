import { sendBrevoEmail } from './brevoClient'

// Send order confirmation email via Brevo
export async function sendBrevoOrderConfirmation(orderData: any) {
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

  const config = useRuntimeConfig()

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

  return await sendBrevoEmail({
    to: [{ email: orderData.customer_email, name: orderData.customer_name }],
    subject: `Order Confirmation #${orderData.order_number} - Thank you for your purchase!`,
    htmlContent,
    sender: { email: 'hello@miracute.com', name: 'Miracute' }
  })
}

// Send admin order notification via Brevo
export async function sendBrevoAdminOrderNotification(orderData: any) {
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

  const config = useRuntimeConfig()

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

  return await sendBrevoEmail({
    to: [{ email: 'hello@miracute.com', name: 'Miracute Admin' }],
    subject: `🎉 Cha-ching! New Order #${orderData.order_number} - $${totalAmount}`,
    htmlContent,
    sender: { email: 'hello@miracute.com', name: 'Miracute Orders' }
  })
}
