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
            id,
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

    // Check if order is completed and paid
    if (order.status !== 'completed' || order.payment_status !== 'paid') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Order must be completed and paid to request reviews'
      })
    }

    // Send review request email
    await sendReviewRequestEmail(order)

    return {
      success: true,
      message: 'Review request email sent successfully'
    }

  } catch (error: any) {
    console.error('Error sending review request email:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send review request email',
      data: error
    })
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
      throw error
    }
  }
})
