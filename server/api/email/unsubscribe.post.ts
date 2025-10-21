import { serverSupabaseUser } from '#supabase/server'
import { ServerEmailService } from '../../utils/email/ServerEmailService'

export default defineEventHandler(async (event) => {
  try {
    // Authentication required
    const user = await serverSupabaseUser(event)
    if (!user?.email) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const emailService = new ServerEmailService()
    await emailService.unsubscribeFromAll(user.email)

    return {
      success: true,
      message: 'Successfully unsubscribed from all emails'
    }

  } catch (error: any) {
    console.error('Error unsubscribing from emails:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to unsubscribe from emails',
      data: error
    })
  }
})