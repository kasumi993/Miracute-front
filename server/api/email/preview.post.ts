import { TemplateManager } from '../../utils/email/TemplateManager'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { templateName, data = {} } = body

    if (!templateName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Template name is required'
      })
    }

    const templateManager = new TemplateManager()

    // Get template metadata
    const templates = await templateManager.getAllTemplates()
    const template = templates.find(t => t.name === templateName)

    if (!template) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Template not found'
      })
    }

    // Render template with provided data or sample data
    const sampleData = getSampleDataForTemplate(templateName, data)
    const rendered = await templateManager.renderTemplate(templateName, sampleData)

    return {
      success: true,
      data: {
        templateName,
        subject: rendered.subject,
        html: rendered.html,
        sampleData,
        metadata: {
          variables: template.variables,
          subject: template.subject
        }
      }
    }
  } catch (error: any) {
    console.error('Template preview error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to preview template'
    })
  }
})

function getSampleDataForTemplate(templateName: string, providedData: any = {}) {
  const defaultData = {
    // Common variables
    recipientEmail: providedData.recipientEmail || 'test@example.com',
    recipientName: providedData.recipientName || 'John Doe',
    timestamp: new Date().toISOString(),
    provider: 'mock',

    // Order-related data
    orderId: 'TEST-' + Date.now().toString().slice(-6),
    customerName: providedData.customerName || 'John Doe',
    customerEmail: providedData.customerEmail || 'test@example.com',
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
    hasDownloads: true,

    // Status update data
    status: 'completed',
    message: 'Your order has been processed successfully!',
    updateDate: new Date().toISOString(),

    // Review data
    productName: 'Sample Website Template',
    productId: 'sample-template-001',
    rating: 5,
    title: 'Excellent template!',
    comment: 'This template exceeded my expectations. Great design and easy to customize.',
    reviewId: 'review-' + Date.now().toString().slice(-6),
    isVerifiedPurchase: true,
    productStats: {
      averageRating: 4.8,
      totalReviews: 127
    },

    // Welcome/Auth data
    verificationUrl: 'https://miracute.com/verify?token=sample-token',
    resetUrl: 'https://miracute.com/reset-password?token=sample-token',

    // Company info
    companyName: 'Miracute',
    supportEmail: 'support@miracute.com',
    websiteUrl: 'https://miracute.com'
  }

  // Merge with provided data
  return { ...defaultData, ...providedData }
}