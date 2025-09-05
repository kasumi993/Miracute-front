import * as brevo from '@getbrevo/brevo'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    if (!config.brevoApiKey) {
      return {
        success: false,
        error: 'BREVO_API_KEY not configured'
      }
    }

    console.log('Testing simple email send...')

    const apiInstance = new brevo.TransactionalEmailsApi()
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, config.brevoApiKey)
    
    const sendSmtpEmail = new brevo.SendSmtpEmail()
    sendSmtpEmail.to = [{ email: 'hello@miracute.com', name: 'Test Recipient' }]
    sendSmtpEmail.subject = 'Simple Test Email - ' + new Date().toISOString()
    sendSmtpEmail.htmlContent = `
      <h1>Simple Email Test</h1>
      <p>This is a basic test email sent at: ${new Date().toISOString()}</p>
      <p>If you receive this, the email configuration is working!</p>
    `
    sendSmtpEmail.sender = { email: 'hello@miracute.com', name: 'Miracute Test' }
    
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail)
    
    console.log('Simple email sent successfully:', result.body)
    
    return {
      success: true,
      messageId: result.body.messageId,
      timestamp: new Date().toISOString(),
      message: 'Simple test email sent successfully'
    }
    
  } catch (error: any) {
    console.error('Simple email test failed:', error)
    
    return {
      success: false,
      error: error.message,
      errorBody: error.body,
      timestamp: new Date().toISOString()
    }
  }
})