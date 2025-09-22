import type { ApiResponse } from '~/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

/**
 * Get user profile information
 */
export const getUserProfile = async (userId?: string): Promise<ApiResponse<any>> => {
  const endpoint = userId ? `/users/${userId}` : '/users/profile'
  return baseService.get<any>(endpoint)
}

/**
 * Get user orders with pagination
 */
export const getUserOrders = async (page = 1, limit = 20, status?: string): Promise<ApiResponse<{ orders: any[]; pagination: any }>> => {
  const query: any = { page, limit }
  if (status) query.status = status
  return baseService.get<{ orders: any[]; pagination: any }>('/users/orders', query)
}

/**
 * Get user downloads
 */
export const getUserDownloads = async (page = 1, limit = 20): Promise<ApiResponse<{ downloads: any[]; pagination: any }>> => {
  return baseService.get<{ downloads: any[]; pagination: any }>('/users/downloads', { page, limit })
}

/**
 * Get user settings
 */
export const getUserSettings = async (): Promise<ApiResponse<any>> => {
  return baseService.get<any>('/users/settings')
}

/**
 * Get user statistics
 */
export const getUserStats = async (): Promise<ApiResponse<{
  totalOrders: number
  totalSpent: number
  totalDownloads: number
  accountAge: number
  favoriteProducts: any[]
}>> => {
  return baseService.get<{
    totalOrders: number
    totalSpent: number
    totalDownloads: number
    accountAge: number
    favoriteProducts: any[]
  }>('/users/stats')
}

/**
 * Get user wishlist
 */
export const getUserWishlist = async (page = 1, limit = 20): Promise<ApiResponse<{ items: any[]; pagination: any }>> => {
  return baseService.get<{ items: any[]; pagination: any }>('/users/wishlist', { page, limit })
}

/**
 * Get user addresses
 */
export const getUserAddresses = async (): Promise<ApiResponse<any[]>> => {
  return baseService.get<any[]>('/users/addresses')
}

/**
 * Get specific order details
 */
export const getOrderDetails = async (orderId: string): Promise<ApiResponse<any>> => {
  return baseService.get<any>(`/users/orders/${orderId}`)
}

/**
 * Get download link for purchased product
 */
export const getDownloadLink = async (productId: string, orderId: string): Promise<ApiResponse<{ downloadUrl: string; expiresAt: string }>> => {
  return baseService.get<{ downloadUrl: string; expiresAt: string }>(`/users/downloads/${productId}`, { orderId })
}

/**
 * Get account activity log
 */
export const getActivityLog = async (page = 1, limit = 20): Promise<ApiResponse<{ activities: any[]; pagination: any }>> => {
  return baseService.get<{ activities: any[]; pagination: any }>('/users/activity', { page, limit })
}