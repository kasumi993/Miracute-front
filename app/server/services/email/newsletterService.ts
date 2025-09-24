import * as brevo from '@getbrevo/brevo'
import { createBrevoContactsClient, sendBrevoEmail } from './brevoClient'

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