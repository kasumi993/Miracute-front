import * as brevo from '@getbrevo/brevo'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    console.log('Brevo API Key configured:', !!config.brevoApiKey)

    // Test email sending
    const apiInstance = new brevo.TransactionalEmailsApi()
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, config.brevoApiKey)

    const testEmailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8B4513, #A0522D); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Email Test ✨</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">This is a test email from Miracute</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #8B4513; margin-top: 0;">Email Configuration Test</h2>
            <p>This email was sent at: ${new Date().toISOString()}</p>
            <p>If you received this email, the Brevo integration is working correctly!</p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
          <p>Test sent from Miracute email system</p>
        </div>
      </div>
    `

    const sendSmtpEmail = new brevo.SendSmtpEmail()
    sendSmtpEmail.to = [{ email: 'hello@miracute.com', name: 'Miracute Admin' }]
    sendSmtpEmail.subject = `Test Email from Miracute - ${  new Date().toISOString()}`
    sendSmtpEmail.htmlContent = testEmailContent
    sendSmtpEmail.sender = { email: 'hello@miracute.com', name: 'Miracute Test' }

    console.log('Attempting to send test email...')
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log('Test email sent successfully:', result.body)

    return {
      success: true,
      messageId: result.body.messageId,
      timestamp: new Date().toISOString(),
      apiKeyConfigured: !!config.brevoApiKey
    }

  } catch (error: any) {
    console.error('Test email failed:', error)

    return {
      success: false,
      error: error.message,
      errorDetails: error.body || error,
      timestamp: new Date().toISOString()
    }
  }
})
