import type { Order, OrderCreateInput, ApiResponse, CartItem, OrderSummary, PaymentIntent, CheckoutData } from '@/types'
import { BusinessLogicError, ValidationError } from '~/utils/errors'
import { BaseApiService } from '../BaseApiService'
import { calculateOrderSummary, validateCheckoutData, sendOrderConfirmation } from './helpers'

const baseService = new BaseApiService({ baseUrl: '/api' })

/**
 * Recalculate order summary from cart items (client-side calculation)
 */
export const getOrderSummary = (items: CartItem[], couponCode?: string): OrderSummary => {
  return calculateOrderSummary(items, couponCode)
}

/**
 * Create payment intent for checkout
 */
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'USD',
  orderData?: Partial<OrderCreateInput>
): Promise<ApiResponse<PaymentIntent>> => {
    validatePositiveNumber(amount, 'Payment amount')
    validateRequired(currency, 'Currency')
    
  const paymentData = {
    amount: Math.round(amount * 100), // Convert to cents
    currency: currency.toUpperCase(),
    ...(orderData && { orderData })
  }

  return baseService.post<PaymentIntent>('/payments/create-intent', paymentData)
}

/**
 * Process checkout with comprehensive validation and transaction handling
 */
export const processCheckout = async (checkoutData: CheckoutData): Promise<ApiResponse<{ order: Order; paymentIntent: PaymentIntent }>> => {
  // Comprehensive validation (déplacée dans les helpers)
  validateCheckoutData(checkoutData)

  const summary = calculateOrderSummary(checkoutData.items, checkoutData.couponCode)

  if (summary.totalAmount <= 0) {
    throw new BusinessLogicError('Order total must be greater than $0', 'INVALID_ORDER_TOTAL')
  }

  // Préparation des données (simplifiée ici, elle pourrait être un helper)
  const orderData: OrderCreateInput = {
    customerEmail: checkoutData.customerEmail.toLowerCase().trim(),
    customerFirstName: checkoutData.customerFirstName.trim(),
    customerLastName: checkoutData.customerLastName.trim(),
    // ... autres champs
    items: checkoutData.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    })),
  }

  const response = await baseService.post<{ order: Order; paymentIntent: PaymentIntent }>(
    '/checkout/process',
    { orderData, paymentMethodId: checkoutData.paymentMethodId, summary, couponCode: checkoutData.couponCode }
  )

  if (response.success && response.data) {
    await sendOrderConfirmation(response.data.order)
  }

  return response
}

/**
 * Confirm payment and fulfill order
 */
export const confirmPayment = async (
  paymentIntentId: string,
  orderId: string
): Promise<ApiResponse<Order>> => {
  const response = await baseService.post<Order>('/checkout/confirm-payment', { paymentIntentId, orderId })

  return response
}