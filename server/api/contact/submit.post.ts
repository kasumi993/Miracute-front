import * as brevo from '@getbrevo/brevo'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Validate required fields
  if (!body.name || !body.email || !body.message) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name, email, and message are required'
    })
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email format'
    })
  }

  try {
    // Send notification email to admin
    const adminNotification = await sendContactNotificationEmail(body)

    // Send confirmation email to customer
    const customerConfirmation = await sendContactConfirmationEmail(body)

    console.log('Contact form submission processed successfully')

    return {
      success: true,
      message: 'Your message has been sent successfully! We\'ll get back to you soon.',
      adminEmailSent: adminNotification.success,
      confirmationEmailSent: customerConfirmation.success
    }

  } catch (error: any) {
    console.error('Contact form submission error:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to send your message. Please try again.',
      data: error.message
    })
  }

  // Inline email functions
  async function sendContactNotificationEmail(formData: any) {
    try {
      const config = useRuntimeConfig()
      const apiInstance = new brevo.TransactionalEmailsApi()
      apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, config.brevoApiKey)

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B4513, #A0522D); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">💌 New Contact Message</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Someone reached out via your contact form</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #8B4513; margin-top: 0;">Contact Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Name:</td>
                  <td style="padding: 8px 0;">${formData.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0;">${formData.email}</td>
                </tr>
                ${formData.phone ? `<tr><td style="padding: 8px 0; font-weight: bold;">Phone:</td><td style="padding: 8px 0;">${formData.phone}</td></tr>` : ''}
                ${formData.subject ? `<tr><td style="padding: 8px 0; font-weight: bold;">Subject:</td><td style="padding: 8px 0;">${formData.subject}</td></tr>` : ''}
              </table>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h2 style="color: #8B4513; margin-top: 0;">Message</h2>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; white-space: pre-wrap;">${formData.message}</div>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
            <p>Reply directly to this email to respond to ${formData.name}</p>
          </div>
        </div>
      `

      const sendSmtpEmail = new brevo.SendSmtpEmail()
      sendSmtpEmail.to = [{ email: 'hello@miracute.com', name: 'Miracute Admin' }]
      sendSmtpEmail.subject = `💌 New Contact Form Submission from ${formData.name}`
      sendSmtpEmail.htmlContent = htmlContent
      sendSmtpEmail.sender = { email: formData.email, name: formData.name }

      await apiInstance.sendTransacEmail(sendSmtpEmail)
      return { success: true }

    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async function sendContactConfirmationEmail(formData: any) {
    try {
      const config = useRuntimeConfig()
      const apiInstance = new brevo.TransactionalEmailsApi()
      apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, config.brevoApiKey)

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #8B4513, #A0522D); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Thank you for reaching out!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We've received your message</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h2 style="color: #8B4513; margin-top: 0;">Hi ${formData.name}! 👋</h2>
              <p style="margin-bottom: 20px;">Thank you for contacting Miracute! I've received your message and I'll get back to you as soon as possible.</p>
              <p style="margin-bottom: 20px;">Here's a copy of what you sent:</p>
              
              <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
${formData.subject ? `<strong>Subject:</strong> ${formData.subject}<br><br>` : ''}
                <strong>Message:</strong><br>
                <span style="white-space: pre-wrap;">${formData.message}</span>
              </div>
              
              <p style="margin-top: 20px;">I typically respond within a few hours during business days. In the meantime, feel free to browse our beautiful template collection!</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${config.public.siteUrl}/listings"
                   style="background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Browse Templates
                </a>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
            <p>Thank you for choosing Miracute! ✨</p>
            <p style="margin-top: 10px;">This email was sent from hello@miracute.com</p>
          </div>
        </div>
      `

      const sendSmtpEmail = new brevo.SendSmtpEmail()
      sendSmtpEmail.to = [{ email: formData.email, name: formData.name }]
      sendSmtpEmail.subject = 'Thank you for contacting Miracute!'
      sendSmtpEmail.htmlContent = htmlContent
      sendSmtpEmail.sender = { email: 'hello@miracute.com', name: 'Miracute' }

      await apiInstance.sendTransacEmail(sendSmtpEmail)
      return { success: true }

    } catch (error) {
      return { success: false, error: error.message }
    }
  }
})
