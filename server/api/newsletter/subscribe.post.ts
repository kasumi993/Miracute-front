import * as brevo from '@getbrevo/brevo'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is required'
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
    const config = useRuntimeConfig()

    // Extract name from email or use provided name
    const firstName = body.firstName || body.name || body.email.split('@')[0]
    const lastName = body.lastName

    // Initialize Brevo API
    const apiInstance = new brevo.ContactsApi()
    apiInstance.setApiKey(brevo.ContactsApiApiKeys.apiKey, config.brevoApiKey)

    // Add to Brevo newsletter list
    const createContact = new brevo.CreateContact()
    createContact.email = body.email
    createContact.attributes = {
      FIRSTNAME: firstName,
      LASTNAME: lastName,
      SUBSCRIPTION_SOURCE: body.source || 'website',
      SUBSCRIPTION_DATE: new Date().toISOString()
    }
    createContact.listIds = [parseInt(config.brevoListId)]

    let isNewSubscription = true
    let message = 'Successfully subscribed to newsletter!'

    try {
      await apiInstance.createContact(createContact)
    } catch (brevoError: any) {
      // Check if contact already exists
      if (brevoError.response?.status === 400 && brevoError.response?.data?.message?.includes('already exist')) {
        isNewSubscription = false
        message = 'You are already subscribed to our newsletter!'
      } else {
        throw brevoError
      }
    }

    return {
      success: true,
      message,
      isNewSubscription
    }

  } catch (error: any) {
    console.error('Newsletter subscription error:', error)

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to subscribe to newsletter',
      data: error.message
    })
  }

})
