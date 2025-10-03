import { addToBrevoNewsletter } from '../../utils/email'

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
    // Extract name from email or use provided name
    const firstName = body.firstName || body.name || body.email.split('@')[0]
    const lastName = body.lastName

    // Add to Brevo newsletter list
    const brevoResult = await addToBrevoNewsletter({
      email: body.email,
      firstName,
      lastName,
      attributes: {
        SUBSCRIPTION_SOURCE: body.source || 'website',
        SUBSCRIPTION_DATE: new Date().toISOString()
      }
    })

    if (!brevoResult.success) {
      // If it's not a "contact already exists" error, throw it
      if (!brevoResult.message?.includes('already exist')) {
        throw new Error(brevoResult.error)
      }
    }

    return {
      success: true,
      message: brevoResult.message?.includes('already exist')
        ? 'You are already subscribed to our newsletter!'
        : 'Successfully subscribed to newsletter!',
      isNewSubscription: !brevoResult.message?.includes('already exist')
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
