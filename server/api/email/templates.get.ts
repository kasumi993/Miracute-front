import { serverSupabaseUser } from '#supabase/server'
import { isAdminUser } from '../../utils/security/auth'

export default defineEventHandler(async (event) => {
  // Check if user is admin
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  const isAdmin = await isAdminUser(user.id, event)
  if (!isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }

  try {
    // Return available email templates
    const templates = [
      {
        name: 'welcome',
        title: 'Welcome Email',
        description: 'Welcome new users to the platform',
        subject: 'Welcome to Miracute!'
      },
      {
        name: 'order-confirmation',
        title: 'Order Confirmation',
        description: 'Confirm order and provide download links',
        subject: 'Your order is confirmed!'
      },
      {
        name: 'download-ready',
        title: 'Download Ready',
        description: 'Notify when downloads are available',
        subject: 'Your downloads are ready!'
      },
      {
        name: 'password-reset',
        title: 'Password Reset',
        description: 'Password reset instructions',
        subject: 'Reset your password'
      },
      {
        name: 'account-verification',
        title: 'Account Verification',
        description: 'Verify email address',
        subject: 'Please verify your email'
      }
    ]

    return {
      success: true,
      data: templates
    }

  } catch (error: any) {
    console.error('Error fetching email templates:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch email templates',
      data: error
    })
  }
})