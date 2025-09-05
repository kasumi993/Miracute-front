import * as brevo from '@getbrevo/brevo'

// Initialize Brevo API instance
function createBrevoClient() {
  const config = useRuntimeConfig()
  const apiInstance = new brevo.TransactionalEmailsApi()
  
  // Configure API key authorization
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, config.brevoApiKey)
  
  return apiInstance
}

// Initialize Brevo Contacts API instance
function createBrevoContactsClient() {
  const config = useRuntimeConfig()
  const apiInstance = new brevo.ContactsApi()
  
  // Configure API key authorization
  apiInstance.setApiKey(brevo.ContactsApiApiKeys.apiKey, config.brevoApiKey)
  
  return apiInstance
}

// Send transactional email via Brevo
export async function sendBrevoEmail(emailData: {
  to: { email: string; name?: string }[]
  subject: string
  htmlContent: string
  textContent?: string
  sender?: { email: string; name: string }
  templateId?: number
  params?: Record<string, any>
}) {
  try {
    const apiInstance = createBrevoClient()
    const config = useRuntimeConfig()
    
    const sendSmtpEmail = new brevo.SendSmtpEmail()
    sendSmtpEmail.to = emailData.to
    sendSmtpEmail.subject = emailData.subject
    sendSmtpEmail.htmlContent = emailData.htmlContent
    sendSmtpEmail.textContent = emailData.textContent
    sendSmtpEmail.sender = emailData.sender || {
      email: config.smtpUser || 'hello@miracute.com',
      name: 'Miracute'
    }
    
    if (emailData.templateId) {
      sendSmtpEmail.templateId = emailData.templateId
      sendSmtpEmail.params = emailData.params
    }
    
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    
    console.log('Email sent via Brevo:', result.body)
    return { success: true, messageId: result.body.messageId }
    
  } catch (error: any) {
    console.error('Failed to send email via Brevo:', error)
    return { success: false, error: error.message }
  }
}

// Add contact to Brevo newsletter list
export async function addToBrevoNewsletter(contactData: {
  email: string
  firstName?: string
  lastName?: string
  attributes?: Record<string, any>
}) {
  try {
    const apiInstance = createBrevoContactsClient()
    const config = useRuntimeConfig()
    
    const createContact = new brevo.CreateContact()
    createContact.email = contactData.email
    
    if (contactData.firstName || contactData.lastName) {
      createContact.attributes = {
        FIRSTNAME: contactData.firstName || '',
        LASTNAME: contactData.lastName || '',
        ...contactData.attributes
      }
    }
    
    // Add to newsletter list if list ID is configured
    if (config.brevoListId) {
      createContact.listIds = [parseInt(config.brevoListId)]
    }
    
    const result = await apiInstance.createContact(createContact)
    
    console.log('Contact added to Brevo:', result.body)
    return { success: true, contactId: result.body.id }
    
  } catch (error: any) {
    // Handle case where contact already exists
    if (error.status === 400 && error.message?.includes('Contact already exist')) {
      console.log('Contact already exists in Brevo')
      return { success: true, contactId: null, message: 'Contact already exists' }
    }
    
    console.error('Failed to add contact to Brevo:', error)
    return { success: false, error: error.message }
  }
}

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
    subject: `🎉 New Order #${orderData.order_number} - $${totalAmount}`,
    htmlContent,
    sender: { email: 'hello@miracute.com', name: 'Miracute Orders' }
  })
}

// Send review request email after purchase
export async function sendBrevoReviewRequestEmail(orderData: any) {
  const config = useRuntimeConfig()
  
  const itemsList = orderData.order_items
    .map((item: any) => `
      <div style="border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 16px; background: white;">
        <h3 style="margin: 0 0 10px 0; color: #8B4513; font-size: 16px;">${item.product?.name || item.product_name}</h3>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${config.public.siteUrl}/reviews/submit?product=${item.product_id}&order=${orderData.id}&token=${generateReviewToken(orderData.id, item.product_id)}"
             style="background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            ⭐ Write a Review
          </a>
        </div>
      </div>
    `).join('')
  
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
  
  return await sendBrevoEmail({
    to: [{ email: orderData.customer_email, name: orderData.customer_name }],
    subject: '⭐ How was your Miracute experience? Quick review request',
    htmlContent,
    sender: { email: 'hello@miracute.com', name: 'Miracute' }
  })
}

// Helper function to generate secure review tokens
function generateReviewToken(orderId: string, productId: string): string {
  // In production, use proper JWT or signed tokens
  // This is a simple hash for demo purposes
  const crypto = require('crypto')
  const data = `${orderId}-${productId}-${Date.now()}`
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16)
}

// Send welcome email for newsletter signup
export async function sendBrevoWelcomeEmail(contactData: {
  email: string
  firstName?: string
}) {
  const config = useRuntimeConfig()
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #8B4513, #A0522D); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">Welcome to Miracute!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thanks for joining our newsletter</p>
      </div>
      
      <div style="padding: 30px; background: #f9f9f9;">
        <div style="background: white; padding: 20px; border-radius: 8px;">
          <h2 style="color: #8B4513; margin-top: 0;">Hi ${contactData.firstName || 'there'}! 👋</h2>
          <p style="margin-bottom: 20px;">Welcome to the Miracute family! I'm so excited to have you here.</p>
          <p style="margin-bottom: 20px;">You'll be the first to know about:</p>
          <ul style="color: #666; margin-bottom: 20px;">
            <li>✨ New template releases</li>
            <li>🎨 Design tips and inspiration</li>
            <li>💝 Exclusive discounts and offers</li>
            <li>📖 Behind-the-scenes stories</li>
          </ul>
          <p style="margin-bottom: 20px;">In the meantime, feel free to browse our beautiful template collection!</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${config.public.siteUrl}/templates" 
               style="background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Browse Templates
            </a>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
        <p>Thank you for choosing Miracute! ✨</p>
        <p style="margin-top: 10px;">Need help? Reply to this email or contact hello@miracute.com</p>
      </div>
    </div>
  `
  
  return await sendBrevoEmail({
    to: [{ email: contactData.email, name: contactData.firstName }],
    subject: 'Welcome to Miracute! ✨',
    htmlContent,
    sender: { email: 'hello@miracute.com', name: 'Miracute' }
  })
}