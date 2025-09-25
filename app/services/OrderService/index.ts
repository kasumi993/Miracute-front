/**
 * Professional Order and Checkout Service
 * Handles order processing with proper transaction management and error handling
 */

import type {
  Order,
  OrderCreateInput,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  Cart,
  CartItem,
  DownloadToken,
  ApiResponse,
  PaginationParams,
  PaginatedResponse
} from '@/types'
import {
  validateRequired,
  validatePositiveNumber,
  BusinessLogicError,
  PaymentError,
  ValidationError,
  NotFoundError,
  ERROR_CODES
} from '~/utils/errors'
import { validateEmail } from '~/utils/validation'
import { BaseApiService } from '../BaseApiService'

export interface CheckoutData {
  items: CartItem[]
  customerEmail: string
  customerFirstName: string
  customerLastName: string
  customerPhone?: string
  billingAddress?: AddressInput
  paymentMethodId: string
  notes?: string
  couponCode?: string
}

export interface AddressInput {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  province: string
  postalCode: string
  country: string
  phone?: string
}

export interface OrderFilters {
  status?: OrderStatus[]
  paymentStatus?: PaymentStatus[]
  customerEmail?: string
  dateFrom?: string
  dateTo?: string
  minAmount?: number
  maxAmount?: number
  sortBy?: OrderSortOption
  sortOrder?: 'asc' | 'desc'
}

export type OrderSortOption =
  | 'created_at'
  | 'updated_at'
  | 'total_amount'
  | 'order_number'
  | 'customer_email'

export interface OrderSummary {
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  itemCount: number
}

export interface PaymentIntent {
  id: string
  clientSecret: string
  amount: number
  currency: string
  status: string
}

export class OrderService extends BaseApiService {
  private static instance: OrderService

  private constructor() {
    super({ baseUrl: '/api' })
  }

  static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService()
    }
    return OrderService.instance
  }

  // ==========================================
  // Order Management
  // ==========================================

  /**
   * Get order by ID with proper authorization
   */
  async getOrder(orderId: string): Promise<ApiResponse<Order>> {
    try {
      validateRequired(orderId, 'Order ID')

      return await this.get<Order>(`/orders/${orderId}`)

    } catch (error) {
      console.error('Failed to fetch order:', error)
      throw error
    }
  }

  /**
   * Get orders with filtering and pagination
   */
  async getOrders(
    filters: OrderFilters = {},
    pagination: PaginationParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Order>>> {
    try {
      const query = {
        ...filters,
        page: pagination.page || 1,
        limit: Math.min(pagination.limit || 20, 100)
      }

      return await this.get<PaginatedResponse<Order>>('/orders', query)

    } catch (error) {
      console.error('Failed to fetch orders:', error)
      throw error
    }
  }

  /**
   * Update order status with validation
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    reason?: string
  ): Promise<ApiResponse<Order>> {
    try {
      validateRequired(orderId, 'Order ID')
      validateRequired(status, 'Order status')

      // Validate status transitions
      this.validateStatusTransition(status)

      const updateData = {
        status,
        ...(reason && { statusReason: reason.trim() })
      }

      const response = await this.patch<Order>(`/orders/${orderId}/status`, updateData)

      if (response.success && response.data) {
        // Handle post-status-change actions
        await this.handleStatusChangeActions(response.data, status)
      }

      return response

    } catch (error) {
      console.error('Failed to update order status:', error)
      throw error
    }
  }

  /**
   * Cancel order with proper validation
   */
  async cancelOrder(
    orderId: string,
    reason: string,
    refundAmount?: number
  ): Promise<ApiResponse<Order>> {
    try {
      validateRequired(orderId, 'Order ID')
      validateRequired(reason, 'Cancellation reason')

      if (refundAmount !== undefined) {
        validatePositiveNumber(refundAmount, 'Refund amount')
      }

      return await this.post<Order>(`/orders/${orderId}/cancel`, {
        reason: reason.trim(),
        refundAmount
      })

    } catch (error) {
      console.error('Failed to cancel order:', error)
      throw error
    }
  }

  // ==========================================
  // Checkout Process
  // ==========================================

  /**
   * Calculate order summary from cart items
   */
  calculateOrderSummary(items: CartItem[], couponCode?: string): OrderSummary {
    try {
      if (!items || items.length === 0) {
        return {
          subtotal: 0,
          taxAmount: 0,
          discountAmount: 0,
          totalAmount: 0,
          itemCount: 0
        }
      }

      const subtotal = items.reduce((sum, item) => {
        validatePositiveNumber(item.quantity, 'Item quantity')
        validatePositiveNumber(item.unitPrice, 'Item price')
        return sum + (item.quantity * item.unitPrice)
      }, 0)

      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

      // Calculate tax (simplified - in production, use proper tax calculation service)
      const taxRate = 0.0825 // 8.25% example
      const taxAmount = Math.round(subtotal * taxRate * 100) / 100

      // Calculate discount (simplified - in production, validate coupon codes)
      let discountAmount = 0
      if (couponCode) {
        // TODO: Implement proper coupon validation
        discountAmount = 0
      }

      const totalAmount = Math.max(0, subtotal + taxAmount - discountAmount)

      return {
        subtotal: Math.round(subtotal * 100) / 100,
        taxAmount: Math.round(taxAmount * 100) / 100,
        discountAmount: Math.round(discountAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        itemCount
      }

    } catch (error) {
      console.error('Failed to calculate order summary:', error)
      throw error
    }
  }

  /**
   * Create payment intent for checkout
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'USD',
    orderData?: Partial<OrderCreateInput>
  ): Promise<ApiResponse<PaymentIntent>> {
    try {
      validatePositiveNumber(amount, 'Payment amount')
      validateRequired(currency, 'Currency')

      if (amount < 0.50) {
        throw new ValidationError('Payment amount must be at least $0.50', 'amount', amount)
      }

      const paymentData = {
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toUpperCase(),
        ...(orderData && { orderData })
      }

      return await this.post<PaymentIntent>('/payments/create-intent', paymentData)

    } catch (error) {
      console.error('Failed to create payment intent:', error)
      throw error
    }
  }

  /**
   * Process checkout with comprehensive validation and transaction handling
   */
  async processCheckout(checkoutData: CheckoutData): Promise<ApiResponse<{ order: Order; paymentIntent: PaymentIntent }>> {
    try {
      // Comprehensive validation
      this.validateCheckoutData(checkoutData)

      // Calculate order summary
      const summary = this.calculateOrderSummary(checkoutData.items, checkoutData.couponCode)

      if (summary.totalAmount <= 0) {
        throw new BusinessLogicError('Order total must be greater than $0', 'INVALID_ORDER_TOTAL')
      }

      // Prepare order data
      const orderData: OrderCreateInput = {
        customerEmail: checkoutData.customerEmail.toLowerCase().trim(),
        customerFirstName: checkoutData.customerFirstName.trim(),
        customerLastName: checkoutData.customerLastName.trim(),
        customerPhone: checkoutData.customerPhone?.trim(),
        items: checkoutData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        })),
        billingAddress: checkoutData.billingAddress,
        notes: checkoutData.notes?.trim()
      }

      // Process checkout (this handles order creation and payment processing atomically)
      const response = await this.post<{ order: Order; paymentIntent: PaymentIntent }>(
        '/checkout/process',
        {
          orderData,
          paymentMethodId: checkoutData.paymentMethodId,
          summary,
          couponCode: checkoutData.couponCode
        }
      )

      if (response.success && response.data) {
        // Send confirmation email
        await this.sendOrderConfirmation(response.data.order)
      }

      return response

    } catch (error) {
      console.error('Checkout failed:', error)
      throw error
    }
  }

  /**
   * Confirm payment and fulfill order
   */
  async confirmPayment(
    paymentIntentId: string,
    orderId: string
  ): Promise<ApiResponse<Order>> {
    try {
      validateRequired(paymentIntentId, 'Payment Intent ID')
      validateRequired(orderId, 'Order ID')

      const response = await this.post<Order>('/checkout/confirm-payment', {
        paymentIntentId,
        orderId
      })

      if (response.success && response.data) {
        // Generate download tokens for digital products
        if (response.data.status === 'completed') {
          await this.generateDownloadTokens(response.data)
        }
      }

      return response

    } catch (error) {
      console.error('Payment confirmation failed:', error)
      throw error
    }
  }

  // ==========================================
  // Download Management
  // ==========================================

  /**
   * Get download tokens for an order
   */
  async getDownloadTokens(orderId: string): Promise<ApiResponse<DownloadToken[]>> {
    try {
      validateRequired(orderId, 'Order ID')

      return await this.get<DownloadToken[]>(`/orders/${orderId}/downloads`)

    } catch (error) {
      console.error('Failed to fetch download tokens:', error)
      throw error
    }
  }

  /**
   * Generate new download token (if existing token is expired/exhausted)
   */
  async regenerateDownloadToken(
    orderId: string,
    productId: string
  ): Promise<ApiResponse<DownloadToken>> {
    try {
      validateRequired(orderId, 'Order ID')
      validateRequired(productId, 'Product ID')

      return await this.post<DownloadToken>(`/orders/${orderId}/regenerate-token`, {
        productId
      })

    } catch (error) {
      console.error('Failed to regenerate download token:', error)
      throw error
    }
  }

  /**
   * Track download usage
   */
  async trackDownload(token: string): Promise<ApiResponse<{ downloadUrl: string; remainingDownloads: number }>> {
    try {
      validateRequired(token, 'Download token')

      return await this.post<{ downloadUrl: string; remainingDownloads: number }>(
        '/downloads/track',
        { token }
      )

    } catch (error) {
      console.error('Failed to track download:', error)
      throw error
    }
  }

  // ==========================================
  // Order Analytics
  // ==========================================

  /**
   * Get order analytics for admin dashboard
   */
  async getOrderAnalytics(
    dateFrom?: string,
    dateTo?: string
  ): Promise<ApiResponse<OrderAnalytics>> {
    try {
      const query: Record<string, string> = {}

      if (dateFrom) {query.dateFrom = dateFrom}
      if (dateTo) {query.dateTo = dateTo}

      return await this.get<OrderAnalytics>('/admin/orders/analytics', query)

    } catch (error) {
      console.error('Failed to fetch order analytics:', error)
      throw error
    }
  }

  // ==========================================
  // Private Helper Methods
  // ==========================================

  private validateCheckoutData(data: CheckoutData): void {
    // Customer information validation
    validateRequired(data.customerEmail, 'Customer email')
    validateRequired(data.customerFirstName, 'Customer first name')
    validateRequired(data.customerLastName, 'Customer last name')
    validateRequired(data.paymentMethodId, 'Payment method')

    validateEmail(data.customerEmail)

    if (data.customerFirstName.trim().length < 2) {
      throw new ValidationError('First name must be at least 2 characters', 'customerFirstName')
    }

    if (data.customerLastName.trim().length < 2) {
      throw new ValidationError('Last name must be at least 2 characters', 'customerLastName')
    }

    // Items validation
    if (!data.items || data.items.length === 0) {
      throw new ValidationError('Cart cannot be empty', 'items')
    }

    data.items.forEach((item, index) => {
      if (!item.productId) {
        throw new ValidationError(`Item ${index + 1} missing product ID`, 'items')
      }
      if (item.quantity <= 0) {
        throw new ValidationError(`Item ${index + 1} quantity must be positive`, 'items')
      }
      if (item.unitPrice <= 0) {
        throw new ValidationError(`Item ${index + 1} price must be positive`, 'items')
      }
    })

    // Billing address validation (if provided)
    if (data.billingAddress) {
      this.validateAddress(data.billingAddress)
    }

    // Notes validation (if provided)
    if (data.notes && data.notes.length > 500) {
      throw new ValidationError('Notes cannot exceed 500 characters', 'notes')
    }
  }

  private validateAddress(address: AddressInput): void {
    validateRequired(address.firstName, 'Address first name')
    validateRequired(address.lastName, 'Address last name')
    validateRequired(address.address1, 'Street address')
    validateRequired(address.city, 'City')
    validateRequired(address.province, 'Province/State')
    validateRequired(address.postalCode, 'Postal code')
    validateRequired(address.country, 'Country')

    if (address.firstName.trim().length < 2) {
      throw new ValidationError('Address first name must be at least 2 characters', 'billingAddress.firstName')
    }

    if (address.lastName.trim().length < 2) {
      throw new ValidationError('Address last name must be at least 2 characters', 'billingAddress.lastName')
    }
  }

  private validateStatusTransition(newStatus: OrderStatus): void {
    const validStatuses: OrderStatus[] = [
      'pending',
      'processing',
      'completed',
      'cancelled',
      'refunded',
      'failed'
    ]

    if (!validStatuses.includes(newStatus)) {
      throw new ValidationError('Invalid order status', 'status', newStatus)
    }

    // TODO: Add more sophisticated status transition validation
    // e.g., can't go from 'completed' to 'pending'
  }

  private async handleStatusChangeActions(order: Order, newStatus: OrderStatus): Promise<void> {
    try {
      switch (newStatus) {
        case 'completed':
          await this.generateDownloadTokens(order)
          await this.sendOrderFulfillmentEmail(order)
          break

        case 'cancelled':
          await this.sendOrderCancellationEmail(order)
          break

        case 'refunded':
          await this.sendOrderRefundEmail(order)
          break
      }
    } catch (error) {
      console.warn('Post-status-change actions failed:', error)
      // Don't throw - the status change itself was successful
    }
  }

  private async generateDownloadTokens(order: Order): Promise<void> {
    try {
      await this.post('/orders/generate-downloads', { orderId: order.id })
    } catch (error) {
      console.warn('Failed to generate download tokens:', error)
    }
  }

  private async sendOrderConfirmation(order: Order): Promise<void> {
    try {
      await this.post('/notifications/order-confirmation', { orderId: order.id })
    } catch (error) {
      console.warn('Failed to send order confirmation:', error)
    }
  }

  private async sendOrderFulfillmentEmail(order: Order): Promise<void> {
    try {
      await this.post('/notifications/order-fulfillment', { orderId: order.id })
    } catch (error) {
      console.warn('Failed to send fulfillment email:', error)
    }
  }

  private async sendOrderCancellationEmail(order: Order): Promise<void> {
    try {
      await this.post('/notifications/order-cancellation', { orderId: order.id })
    } catch (error) {
      console.warn('Failed to send cancellation email:', error)
    }
  }

  private async sendOrderRefundEmail(order: Order): Promise<void> {
    try {
      await this.post('/notifications/order-refund', { orderId: order.id })
    } catch (error) {
      console.warn('Failed to send refund email:', error)
    }
  }
}

export interface OrderAnalytics {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  ordersByStatus: Record<OrderStatus, number>
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>
  topProducts: Array<{ productId: string; productName: string; sales: number; revenue: number }>
}

// Export singleton instance
export const orderService = OrderService.getInstance()
