import type { ApiResponse } from '@/types/database'
import type { Order } from '@/types/commerce/order'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

/**
 * OrderService
 */

/**
 * Get current user's orders
 */
export const getOrders = async (filters?: any, pagination?: any): Promise<ApiResponse<Order[]>> => {
  // If no filters/pagination provided, use user orders endpoint
  if (!filters && !pagination) {
    return baseService.get<Order[]>('/orders/user')
  }

  // Admin call with filters and pagination - use admin orders endpoint
  const params = {
    ...filters,
    ...pagination
  }
  return baseService.get<Order[]>('/orders', params)
}

/**
 * Get specific order by ID (for current user)
 */
export const getOrder = async (orderId: string): Promise<ApiResponse<Order>> => {
  return baseService.get<Order>(`/orders/${orderId}`)
}

/**
 * Get orders for specific user (admin only)
 */
export const getUserOrders = async (userId: string): Promise<ApiResponse<any>> => {
  return baseService.get(`/users/${userId}/orders`)
}

/**
 * Get order statistics (admin only)
 */
export const getOrderStats = async (period?: string): Promise<ApiResponse<any>> => {
  const query = period ? { period } : undefined
  return baseService.get('/stats/orders', query)
}

/**
 * Update order status (admin only)
 */
export const updateOrder = async (orderId: string, data: any): Promise<ApiResponse<Order>> => {
  return baseService.patch<Order>(`/orders/${orderId}`, data)
}

/**
 * Resend order email
 */
export const resendOrderEmail = async (orderId: string): Promise<ApiResponse<any>> => {
  return baseService.post(`/orders/${orderId}/resend-email`)
}

export const OrderService = {
  getOrders,
  getOrder,
  getUserOrders,
  getOrderStats,
  updateOrder,
  resendOrderEmail
}