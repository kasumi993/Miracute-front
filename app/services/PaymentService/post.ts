import type { ApiResponse } from '@/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

export interface CheckoutSessionData {
  items: Array<{ productId: string; quantity: number; price?: number }>
  customerEmail?: string
  customerName?: string
  successUrl?: string
  cancelUrl?: string
  metadata?: Record<string, string>
}

export interface PaymentIntentData {
  amount: number
  currency?: string
  productId?: string
  metadata?: Record<string, string>
}

/**
 * Create a Stripe checkout session
 */
export const createCheckoutSession = async (data: CheckoutSessionData): Promise<ApiResponse<{ id: string; url: string; sessionId: string }>> => {
  return baseService.post<{ id: string; url: string; sessionId: string }>('/payments/create-checkout-session', data)
}

/**
 * Create a payment intent for direct payment
 */
export const createPaymentIntent = async (data: PaymentIntentData): Promise<ApiResponse<{ id: string; clientSecret: string; amount: number; currency: string; status: string }>> => {
  return baseService.post<{ id: string; clientSecret: string; amount: number; currency: string; status: string }>('/payments/create-intent', data)
}

/**
 * Handle payment success callback
 */
export const handlePaymentSuccess = async (data: { sessionId?: string; paymentIntentId?: string; orderId?: string }): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/payments/success', data)
}

/**
 * Process refund for an order
 */
export const processRefund = async (orderId: string, amount?: number, reason?: string): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/payments/refund', { orderId, amount, reason })
}

/**
 * Calculate order total with taxes and discounts
 */
export const calculateOrderTotal = async (data: {
  items: Array<{ productId: string; quantity: number }>
  couponCode?: string
  country?: string
}): Promise<ApiResponse<{ subtotal: number; tax: number; discount: number; total: number; currency: string }>> => {
  return baseService.post<{ subtotal: number; tax: number; discount: number; total: number; currency: string }>('/payments/calculate-total', data)
}

/**
 * Validate coupon code
 */
export const validateCoupon = async (code: string, items?: Array<{ productId: string; quantity: number }>): Promise<ApiResponse<{
  valid: boolean
  discount: number
  discountType: 'percentage' | 'fixed'
  message?: string
}>> => {
  return baseService.post<{
    valid: boolean
    discount: number
    discountType: 'percentage' | 'fixed'
    message?: string
  }>('/payments/validate-coupon', { code, items })
}
