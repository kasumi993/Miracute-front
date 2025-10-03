import type { Order, OrderStatus, ApiResponse, PaginatedResponse, PaginationParams, OrderFilters } from '@/types'
import { validateRequired, validatePositiveNumber, ValidationError } from '~/utils/errors'
import { BaseApiService } from '../BaseApiService'
import { handleStatusChangeActions } from './helpers' // Import de l'aide

const baseService = new BaseApiService({ baseUrl: '/api' })

/**
 * Get order by ID with proper authorization
 */
export const getOrder = async (orderId: string): Promise<ApiResponse<Order>> => {
  validateRequired(orderId, 'Order ID')
  return baseService.get<Order>(`/orders/${orderId}`)
}

/**
 * Get orders with filtering and pagination
 */
export const getOrders = async (
  filters: OrderFilters = {},
  pagination: PaginationParams = {}
): Promise<ApiResponse<PaginatedResponse<Order>>> => {
  const query = {
    ...filters,
    page: pagination.page || 1,
    limit: Math.min(pagination.limit || 20, 100)
  }
  return baseService.get<PaginatedResponse<Order>>('/orders', query)
}

/**
 * Update order status with validation
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  reason?: string
): Promise<ApiResponse<Order>> => {
  validateRequired(orderId, 'Order ID')
  validateRequired(status, 'Order status')

  const validStatuses: OrderStatus[] = [
    'pending', 'processing', 'completed', 'cancelled', 'refunded', 'failed'
  ]
  if (!validStatuses.includes(status)) {
    throw new ValidationError('Invalid order status', 'status', status)
  }

  const updateData = {
    status,
    ...(reason && { statusReason: reason.trim() })
  }

  const response = await baseService.patch<Order>(`/orders/${orderId}/status`, updateData)

  if (response.success && response.data) {
    // Action post-changement de statut (déplacée dans les helpers)
    await handleStatusChangeActions(response.data, status)
  }

  return response
}

/**
 * Cancel order with proper validation
 */
export const cancelOrder = async (
  orderId: string,
  reason: string,
  refundAmount?: number
): Promise<ApiResponse<Order>> => {
  validateRequired(orderId, 'Order ID')
  validateRequired(reason, 'Cancellation reason')

  if (refundAmount !== undefined) {
    validatePositiveNumber(refundAmount, 'Refund amount')
  }

  return baseService.post<Order>(`/orders/${orderId}/cancel`, {
    reason: reason.trim(),
    refundAmount
  })
}