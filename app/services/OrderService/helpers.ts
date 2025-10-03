import type { Order, OrderStatus, CartItem, OrderSummary, AddressInput, CheckoutData } from '@/types'
import { validateRequired, validatePositiveNumber, ValidationError } from '~/utils/errors'
import { validateEmail } from '~/utils/validation'
import { BaseApiService } from '../BaseApiService' // Nécessaire pour les envois d'e-mail

const baseService = new BaseApiService({ baseUrl: '/api' })

// --- Validation ---

export const validateCheckoutData = (data: CheckoutData): void => {
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
        validateAddress(data.billingAddress)
    }

    // Notes validation (if provided)
    if (data.notes && data.notes.length > 500) {
        throw new ValidationError('Notes cannot exceed 500 characters', 'notes')
    }
}

export const validateAddress = (address: AddressInput): void => {
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

// --- Calculs ---

export const calculateOrderSummary = (items: CartItem[], couponCode?: string): OrderSummary => {
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
        } as OrderSummary
  
    } catch (error) {
        console.error('Failed to calculate order summary:', error)
        throw error
    }
}

// --- Actions Post-Commande (Notifications/Fulfillment) ---

export const generateDownloadTokens = async (order: Order): Promise<void> => {
  await baseService.post('/orders/generate-downloads', { orderId: order.id })
}

export const sendOrderConfirmation = async (order: Order): Promise<void> => {
  await baseService.post('/notifications/order-confirmation', { orderId: order.id })
}

export const handleStatusChangeActions = async (order: Order, newStatus: OrderStatus): Promise<void> => {
    try {
      switch (newStatus) {
        case 'completed':
          await generateDownloadTokens(order)
          await sendOrderFulfillmentEmail(order)
          break

        case 'cancelled':
          await sendOrderCancellationEmail(order)
          break

        case 'refunded':
          await sendOrderRefundEmail(order)
          break
      }
    } catch (error) {
      console.warn('Post-status-change actions failed:', error)
      // Don't throw - the status change itself was successful
    }
}


// Email functions 

export const sendOrderFulfillmentEmail = async (order: Order): Promise<void> => {
  await baseService.post('/notifications/order-fulfillment', { orderId: order.id })
}

export const sendOrderCancellationEmail = async (order: Order): Promise<void> => {
  await baseService.post('/notifications/order-cancellation', { orderId: order.id })
}
export const sendOrderRefundEmail = async (order: Order): Promise<void> => {
  await baseService.post('/notifications/order-refund', { orderId: order.id })
}