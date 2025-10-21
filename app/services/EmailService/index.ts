import * as postMethods from './post'
import * as sendMethods from './send'

// Client-side email service for digital store and testing
export const EmailService = {
  // Email sending for store operations
  sendOrderConfirmation: sendMethods.sendOrderConfirmation,
  sendReviewRequest: sendMethods.sendReviewRequest,
  sendAdminReviewNotification: sendMethods.sendAdminReviewNotification,
  sendTestEmail: sendMethods.sendTestEmail,

  // Actions
  unsubscribeFromEmails: postMethods.unsubscribeFromEmails,
  verifyReviewToken: postMethods.verifyReviewToken
}

// For compatibility with existing code, export individual methods
export const {
  sendOrderConfirmation,
  sendReviewRequest,
  sendAdminReviewNotification,
  sendTestEmail,
  unsubscribeFromEmails,
  verifyReviewToken
} = EmailService

