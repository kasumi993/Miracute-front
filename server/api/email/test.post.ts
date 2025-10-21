import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import { ServerEmailService } from '../../utils/email/ServerEmailService'
import { isAdminUser } from '../../utils/security/auth'

export default defineEventHandler(async (event) => {
  try {
    // Simple admin check
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

    const body = await readBody(event)
    const { type, email, data = {} } = body

    if (!type || !email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email type and recipient email are required'
      })
    }

    // Create email service instance with explicit config
    const runtimeConfig = useRuntimeConfig()
    const emailService = new ServerEmailService({
      brevo: {
        apiKey: runtimeConfig.brevoApiKey,
        listId: runtimeConfig.brevoListId
      }
    })

    // Get sample data for the email type
    const sampleData = getSampleDataForEmailType(type, email, data)

    let result

    // Send appropriate email based on type
    switch (type) {
      case 'order-confirmation':
        result = await emailService.sendOrderConfirmation(sampleData)
        break

      case 'review-request':
        result = await emailService.sendReviewRequest(sampleData)
        break


      case 'admin-review-notification':
        result = await emailService.sendAdminReviewNotification({
          ...sampleData,
          customerEmail: email
        })
        break

      case 'welcome':
        result = await emailService.sendWelcomeEmail({
          email,
          name: sampleData.customerName || 'Test User',
          verificationUrl: 'https://miracute.com/verify?token=test-token'
        })
        break

      case 'password-reset':
        result = await emailService.sendPasswordReset({
          email,
          name: sampleData.customerName || 'Test User',
          resetUrl: 'https://miracute.com/reset-password?token=test-token'
        })
        break

      case 'test':
        result = await emailService.sendTestEmail(email)
        break

      default:
        // For custom templates, use the generic method
        result = await emailService.sendCustomEmail(
          type,
          { email, name: sampleData.customerName || 'Test User' },
          sampleData
        )
    }

    if (!result.success) {
      throw createError({
        statusCode: 500,
        statusMessage: result.error || 'Failed to send test email'
      })
    }

    return {
      success: true,
      message: `Test ${type} email sent successfully`,
      data: {
        messageId: result.messageId,
        provider: emailService.getProviderName(),
        type,
        recipient: email,
        sampleData
      }
    }

  } catch (error: any) {
    console.error('Test email error:', error)

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to send test email',
      data: error
    })
  }
})

function getSampleDataForEmailType(type: string, email: string, providedData: any = {}) {
  const baseData = {
    customerName: providedData.customerName || 'John Doe',
    customerEmail: email,
    orderId: 'TEST-' + Date.now().toString().slice(-6),
    orderDate: new Date().toISOString(),
    totalAmount: '$99.99',
    items: [
      {
        productName: 'Sample Website Template',
        quantity: 1,
        unitPrice: '$99.99',
        productId: 'sample-template-001'
      }
    ],
    hasDownloads: true
  }

  const typeSpecificData = {
    'order-confirmation': baseData,
    'review-request': {
      ...baseData,
      items: baseData.items.map(item => ({
        productId: item.productId,
        productName: item.productName
      }))
    },
    'admin-review-notification': {
      productName: 'Sample Website Template',
      productId: 'sample-template-001',
      rating: 5,
      title: 'Excellent template!',
      comment: 'This template exceeded my expectations. Great design and easy to customize.',
      customerName: baseData.customerName,
      reviewId: 'review-' + Date.now().toString().slice(-6),
      isVerifiedPurchase: true,
      productStats: {
        averageRating: 4.8,
        totalReviews: 127
      }
    }
  }

  return { ...typeSpecificData[type] || baseData, ...providedData }
}