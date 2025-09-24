import { requireAdminAuthentication } from "../../../../utils/auth"
import type { Database } from '~/types/database'
import * as brevo from '@getbrevo/brevo'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdminAuthentication(event)
  const customerId = getRouterParam(event, 'id')

  if (!customerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Customer ID is required'
    })
  }

  try {
    // Get customer details
    const { data: customer, error: customerError } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Customer not found'
      })
    }

    // Add customer to Brevo newsletter list
    const firstName = customer.full_name ? customer.full_name.split(' ')[0] : customer.email.split('@')[0]
    const lastName = customer.full_name ? customer.full_name.split(' ').slice(1).join(' ') : undefined

    const brevoResult = await addToNewsletterList(customer.email, firstName, lastName)

    if (!brevoResult.success && !brevoResult.message?.includes('already exist')) {
      throw new Error(brevoResult.error || 'Failed to add customer to newsletter')
    }

    // Send welcome email if this is a new subscription
    if (brevoResult.success && brevoResult.contactId) {
      try {
        await sendWelcomeEmail(customer.email, firstName)
      } catch (welcomeError) {
        console.error('Failed to send welcome email:', welcomeError)
        // Don't fail the subscription if welcome email fails
      }
    }

    console.log(`Customer ${customer.email} subscribed to newsletter via admin panel`)

    return {
      success: true,
      message: brevoResult.message?.includes('already exist')
        ? 'Customer was already subscribed to newsletter'
        : 'Customer subscribed to newsletter successfully',
      isNewSubscription: !brevoResult.message?.includes('already exist')
    }

  } catch (error: any) {
    console.error('Error subscribing customer to newsletter:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to subscribe customer to newsletter',
      data: error
    })
  }

  // Inline Brevo functions
  async function addToNewsletterList(email: string, firstName?: string, lastName?: string) {
    try {
      const config = useRuntimeConfig()
      const apiInstance = new brevo.ContactsApi()
      apiInstance.setApiKey(brevo.ContactsApiApiKeys.apiKey, config.brevoApiKey)

      const createContact = new brevo.CreateContact()
      createContact.email = email

      if (firstName || lastName) {
        createContact.attributes = {
          FIRSTNAME: firstName || '',
          LASTNAME: lastName || '',
          SUBSCRIPTION_SOURCE: 'admin_panel',
          SUBSCRIPTION_DATE: new Date().toISOString()
        }
      }

      if (config.brevoListId) {
        createContact.listIds = [parseInt(config.brevoListId)]
      }

      const result = await apiInstance.createContact(createContact)
      return { success: true, contactId: result.body.id }

    } catch (error: any) {
      if (error.status === 400 && error.message?.includes('Contact already exist')) {
        return { success: true, contactId: null, message: 'Contact already exists' }
      }
      return { success: false, error: error.message }
    }
  }

  async function sendWelcomeEmail(email: string, firstName?: string) {
    const config = useRuntimeConfig()
    const apiInstance = new brevo.TransactionalEmailsApi()
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, config.brevoApiKey)

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8B4513, #A0522D); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to Miracute!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Thanks for joining our newsletter</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #8B4513; margin-top: 0;">Hi ${firstName || 'there'}! 👋</h2>
            <p style="margin-bottom: 20px;">Welcome to the Miracute family! I'm so excited to have you here.</p>
            <p style="margin-bottom: 20px;">You'll be the first to know about:</p>
            <ul style="color: #666; margin-bottom: 20px;">
              <li>✨ New template releases</li>
              <li>🎨 Design tips and inspiration</li>
              <li>💝 Exclusive discounts and offers</li>
              <li>📖 Behind-the-scenes stories</li>
            </ul>
            
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

    const sendSmtpEmail = new brevo.SendSmtpEmail()
    sendSmtpEmail.to = [{ email, name: firstName }]
    sendSmtpEmail.subject = 'Welcome to Miracute! ✨'
    sendSmtpEmail.htmlContent = htmlContent
    sendSmtpEmail.sender = { email: 'hello@miracute.com', name: 'Miracute' }

    await apiInstance.sendTransacEmail(sendSmtpEmail)
  }
})
