import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database'
import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)
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
    await sendCustomerOrderConfirmation(order)
    
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

  async function sendCustomerOrderConfirmation(orderData: any) {
    const config = useRuntimeConfig()
    
    const transporter = nodemailer.createTransporter({
      host: config.smtpHost || 'smtp.gmail.com',
      port: parseInt(config.smtpPort || '587'),
      secure: false,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword
      }
    })
    
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
  }
})