import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService({ baseUrl: '/api' })

// Email sending methods for digital store
export const sendOrderConfirmation = async (orderId: string) => {
  return await baseService.post('/email/send/order-confirmation', { orderId })
}

export const sendReviewRequest = async (orderId: string) => {
  return await baseService.post('/email/send/review-request', { orderId })
}

export const sendAdminReviewNotification = async (data: {
  productId: string
  reviewId: string
  rating: number
  title?: string
  comment?: string
  customerName?: string
  customerEmail?: string
  isVerified?: boolean
}) => {
  return await baseService.post('/email/send/admin-review-notification', data)
}

// Email testing method
export const sendTestEmail = async (type: string, email: string) => {
  return await baseService.post('/email/test', { type, email })
}