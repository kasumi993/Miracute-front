import type { ApiResponse } from '~/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

/**
 * Get checkout session status by session ID
 */
export const getCheckoutSession = async (sessionId: string): Promise<ApiResponse<any>> => {
  return baseService.get<any>(`/orders/checkout-session/${sessionId}`)
}

/**
 * Verify payment status
 */
export const verifyPayment = async (paymentId: string): Promise<ApiResponse<{ status: string; orderId?: string }>> => {
  return baseService.get<{ status: string; orderId?: string }>(`/payments/verify/${paymentId}`)
}

/**
 * Get payment methods for user
 */
export const getPaymentMethods = async (customerId?: string): Promise<ApiResponse<any[]>> => {
  const query = customerId ? { customerId } : undefined
  return baseService.get<any[]>('/payments/methods', query)
}

/**
 * Get payment history for user
 */
export const getPaymentHistory = async (page = 1, limit = 20): Promise<ApiResponse<{ payments: any[]; pagination: any }>> => {
  return baseService.get<{ payments: any[]; pagination: any }>('/payments/history', { page, limit })
}

/**
 * Get supported currencies
 */
export const getSupportedCurrencies = async (): Promise<ApiResponse<Array<{ code: string; name: string; symbol: string }>>> => {
  return baseService.get<Array<{ code: string; name: string; symbol: string }>>('/payments/currencies')
}

/**
 * Get tax rates by country
 */
export const getTaxRates = async (country: string): Promise<ApiResponse<{ country: string; rate: number; name: string }>> => {
  return baseService.get<{ country: string; rate: number; name: string }>('/payments/tax-rates', { country })
}