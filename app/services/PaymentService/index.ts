import { BaseApiService } from '../BaseApiService'
import type { CheckoutSession } from '@/types/order'
import type { ApiResponse } from '@/types'

const baseService = new BaseApiService()

  /**
   * Create an order and get Stripe checkout session
   */
  const createCheckoutSession = async (productId: string): Promise<ApiResponse<CheckoutSession>> => {
    try {
      const response = await baseService.post<CheckoutSession>('/payments/checkout', { productId })
      return response
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.message || 'Failed to create checkout session'
      }
    }
  }


  /**
   * Process payment webhook for checkout session
   */
  const processPaymentWebhook = async (sessionId: string): Promise<ApiResponse<{ order_id: string }>> => {
    try {
      const response = await baseService.post<{ order_id: string }>('/payments/webhook', { session_id: sessionId })
      return response
    } catch (error: any) {
      return {
        success: false,
        data: null,
        error: error.message || 'Failed to process payment webhook'
      }
    }
  }


export const PaymentService = {
  processPaymentWebhook,
  createCheckoutSession
}