import { sendBrevoEmail } from './brevoClient'

// Helper function to generate secure review tokens
function generateReviewToken(orderId: string, productId: string): string {
  // In production, use proper JWT or signed tokens
  // This is a simple hash for demo purposes
  const crypto = require('crypto')
  const data = `${orderId}-${productId}-${Date.now()}`
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16)
}

// Send review request email after purchase
export async function sendBrevoReviewRequestEmail(orderData: any) {
  const config = useRuntimeConfig()

  const itemsList = orderData.order_items
    .map((item: any) => `
      <div style="border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 16px; background: white;">
        <h3 style="margin: 0 0 10px 0; color: #8B4513; font-size: 16px;">${item.product?.name || item.product_name}</h3>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${config.public.siteUrl}/reviews/submit?product=${item.product_id}&order=${orderData.id}&token=${generateReviewToken(orderData.id, item.product_id)}"
             style="background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            ⭐ Write a Review
          </a>
        </div>
      </div>
    `).join('')

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #8B4513, #A0522D); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">How was your experience? ⭐</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We'd love to hear your thoughts!</p>
      </div>

      <div style="padding: 30px; background: #f9f9f9;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #8B4513; margin-top: 0;">Hi ${orderData.customer_name?.split(' ')[0] || 'there'}! 👋</h2>
          <p style="margin-bottom: 20px;">Thank you for your recent purchase from Miracute! I hope you're loving your new templates.</p>
          <p style="margin-bottom: 20px;">As a small business, your feedback means the world to me. Would you take a moment to share your experience with others?</p>
          <p style="margin-bottom: 20px;"><strong>Your honest review helps other customers find the perfect templates and helps me improve my designs.</strong></p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #8B4513; margin-bottom: 16px;">Please review your templates:</h3>
          ${itemsList}
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #8B4513;">
          <p style="margin: 0; font-style: italic; color: #666;">
            "Every review, whether it's 5 stars or suggestions for improvement, helps me create better templates for amazing customers like you!" - The Designer
          </p>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; color: #666; font-size: 14px;">
        <p>Thank you for choosing Miracute! ✨</p>
        <p style="margin-top: 10px;">Questions? Reply to this email - I read every message personally!</p>
      </div>
    </div>
  `

  return await sendBrevoEmail({
    to: [{ email: orderData.customer_email, name: orderData.customer_name }],
    subject: '⭐ How was your Miracute experience? Quick review request',
    htmlContent,
    sender: { email: 'hello@miracute.com', name: 'Miracute' }
  })
}

// Send admin notification about new review
export async function sendBrevoNewReviewNotification(reviewData: {
  productId: string
  productName?: string
  rating: number
  title?: string
  comment?: string
  userName?: string
  userEmail?: string
  isVerifiedPurchase: boolean
}) {
  const config = useRuntimeConfig()

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #8B4513, #A0522D); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">⭐ New Review Submitted!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Someone left a review on your product</p>
      </div>

      <div style="padding: 30px; background: #f9f9f9;">
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #8B4513; margin-top: 0;">Review Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Product:</td>
              <td style="padding: 8px 0;">${reviewData.productName || reviewData.productId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Rating:</td>
              <td style="padding: 8px 0;">
                <span style="color: #FFD700; font-size: 18px;">${'⭐'.repeat(reviewData.rating)}</span>
                <span style="color: #DDD; font-size: 18px;">${'⭐'.repeat(5 - reviewData.rating)}</span>
                (${reviewData.rating}/5)
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Customer:</td>
              <td style="padding: 8px 0;">${reviewData.userName || 'Anonymous'} ${reviewData.userEmail ? `(${reviewData.userEmail})` : ''}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Verified Purchase:</td>
              <td style="padding: 8px 0;">${reviewData.isVerifiedPurchase ? '✅ Yes' : '❌ No'}</td>
            </tr>
          </table>
        </div>

        ${reviewData.title ? `
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #8B4513; margin-top: 0;">Review Title</h3>
          <p style="margin: 0; font-size: 16px; font-weight: bold;">"${reviewData.title}"</p>
        </div>
        ` : ''}

        ${reviewData.comment ? `
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #8B4513; margin-top: 0;">Review Comment</h3>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 4px; font-style: italic;">
            "${reviewData.comment}"
          </div>
        </div>
        ` : ''}

        <div style="text-align: center; margin-top: 30px;">
          <a href="${config.public.siteUrl}/dashboard/reviews"
             style="background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            View All Reviews
          </a>
        </div>
      </div>
    </div>
  `

  return await sendBrevoEmail({
    to: [{ email: 'hello@miracute.com', name: 'Miracute Admin' }],
    subject: `⭐ New ${reviewData.rating}-star review for ${reviewData.productName || 'Product'}`,
    htmlContent,
    sender: { email: 'hello@miracute.com', name: 'Miracute Reviews' }
  })
}