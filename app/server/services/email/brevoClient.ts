import * as brevo from '@getbrevo/brevo'

// Initialize Brevo API instance
export function createBrevoClient() {
  const config = useRuntimeConfig()
  const apiInstance = new brevo.TransactionalEmailsApi()

  // Configure API key authorization
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, config.brevoApiKey)

  return apiInstance
}

// Initialize Brevo Contacts API instance
export function createBrevoContactsClient() {
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