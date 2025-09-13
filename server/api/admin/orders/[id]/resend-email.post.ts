import { validateAdminAccess } from '../../../../utils/adminAuth'
import type { Database } from '~/types/database'
import * as brevo from '@getbrevo/brevo'

export default defineEventHandler(async (event) => {
  const { supabase } = await validateAdminAccess(event)
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

    // Send confirmation email
    await sendOrderConfirmationEmail(order)

    return {
      success: true,
      message: 'Confirmation email sent successfully'
    }

  } catch (error: any) {
    console.error('Error resending confirmation email:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to resend confirmation email',
      data: error
    })
  }

  // Inline email function
  async function sendOrderConfirmationEmail(order: any) {
    try {
      const config = useRuntimeConfig()
      const apiInstance = new brevo.TransactionalEmailsApi()
      apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, config.brevoApiKey)

      const itemsHtml = order.order_items?.map((item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${item.product?.name || 'Product'}</strong><br>
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
            <h1 style="margin: 0; font-size: 28px;">Order Confirmation</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thank you for your purchase!</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #8B4513; margin-top: 0;">Order Details</h2>
              <p><strong>Order ID:</strong> ${order.id}</p>
              <p><strong>Total:</strong> $${parseFloat(order.total_amount).toFixed(2)}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h2 style="color: #8B4513; margin-top: 0;">Items</h2>
              <table style="width: 100%; border-collapse: collapse;">
                ${itemsHtml}
              </table>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
            <p>Thank you for choosing Miracute! ✨</p>
          </div>
        </div>
      `

      const sendSmtpEmail = new brevo.SendSmtpEmail()
      sendSmtpEmail.to = [{ email: order.customer_email, name: order.customer_name }]
      sendSmtpEmail.subject = `Order Confirmation - ${order.id}`
      sendSmtpEmail.htmlContent = htmlContent
      sendSmtpEmail.sender = { email: 'hello@miracute.com', name: 'Miracute' }

      await apiInstance.sendTransacEmail(sendSmtpEmail)
      return { success: true }

    } catch (error: any) {
      console.error('Failed to send order confirmation email:', error)
      throw error
    }
  }

})
