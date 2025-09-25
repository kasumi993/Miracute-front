import { requireAdminAuthentication } from '../../utils/auth'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const { supabase } = await requireAdminAuthentication(event)

    // Get the most recent paid order for testing
    const { data: orders, error } = await supabase
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
      .eq('payment_status', 'paid')
      .order('created_at', { ascending: false })
      .limit(1)

    if (error || !orders?.length) {
      return {
        success: false,
        error: 'No paid orders found to test with',
        hasOrders: false
      }
    }

    const testOrder = orders[0]
    console.log('Testing with order:', testOrder.id)

    // Test both customer and admin emails
    const results = {
      customerEmail: null as any,
      adminEmail: null as any,
      orderData: {
        id: testOrder.id,
        total: testOrder.total_amount,
        items: testOrder.order_items?.length || 0
      }
    }

    try {
      // Test customer confirmation email
      results.customerEmail = await sendTestOrderConfirmation(testOrder)
      console.log('Customer email result:', results.customerEmail)
    } catch (error: any) {
      results.customerEmail = { success: false, error: error.message }
    }

    try {
      // Test admin notification email
      results.adminEmail = await sendTestAdminNotification(testOrder)
      console.log('Admin email result:', results.adminEmail)
    } catch (error: any) {
      results.adminEmail = { success: false, error: error.message }
    }

    return {
      success: true,
      results,
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    console.error('Purchase email test failed:', error)
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
})

// Test functions
async function sendTestOrderConfirmation(order: any) {
  const config = useRuntimeConfig()
  const brevo = await import('@getbrevo/brevo')
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
        <h1 style="margin: 0; font-size: 28px;">Order Confirmation ✨ [TEST EMAIL]</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for your purchase!</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #8B4513; margin-top: 0;">Order Details</h2>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Total:</strong> $${parseFloat(order.total_amount).toFixed(2)}</p>
          <p><strong>Test Email Sent:</strong> ${new Date().toISOString()}</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px;">
          <h2 style="color: #8B4513; margin-top: 0;">Your Templates</h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
          </table>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
        <p>This is a test email to verify email delivery</p>
        <p>Thank you for choosing Miracute! ✨</p>
      </div>
    </div>
  `

  const sendSmtpEmail = new brevo.SendSmtpEmail()
  sendSmtpEmail.to = [{ email: 'hello@miracute.com', name: 'Test Customer' }]
  sendSmtpEmail.subject = `[TEST] Order Confirmation - ${order.id}`
  sendSmtpEmail.htmlContent = htmlContent
  sendSmtpEmail.sender = { email: 'hello@miracute.com', name: 'Miracute' }

  const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
  return { success: true, messageId: result.body.messageId }
}

async function sendTestAdminNotification(order: any) {
  const config = useRuntimeConfig()
  const brevo = await import('@getbrevo/brevo')
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
        <h1 style="margin: 0; font-size: 28px;">🎉 New Order! [TEST EMAIL]</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Test purchase notification</p>
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
              <td style="padding: 8px 0; font-weight: bold;">Test Sent:</td>
              <td style="padding: 8px 0;">${new Date().toISOString()}</td>
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
        <p>🧪 This is a test email to verify purchase notifications</p>
      </div>
    </div>
  `

  const sendSmtpEmail = new brevo.SendSmtpEmail()
  sendSmtpEmail.to = [{ email: 'hello@miracute.com', name: 'Miracute Admin' }]
  sendSmtpEmail.subject = `[TEST] 💰 New Order: $${parseFloat(order.total_amount).toFixed(2)} - ${order.id}`
  sendSmtpEmail.htmlContent = htmlContent
  sendSmtpEmail.sender = { email: 'orders@miracute.com', name: 'Miracute Orders' }

  const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
  return { success: true, messageId: result.body.messageId }
}
