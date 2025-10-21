import type { ApiResponse } from '@/types/database'
import { BaseApiService } from '../BaseApiService/index'

const baseService = new BaseApiService()

/**
 * Get specific user by ID
 */
export const getUser = async (id: string): Promise<ApiResponse<any>> => {
  return baseService.get<any>(`/users/${id}`)
}

/**
 * Get current user's profile
 */
export const getUserProfile = async (): Promise<ApiResponse<any>> => {
  return baseService.get<any>('/users/profile')
}

/**
 * Update specific user by ID (admin use)
 */
export const updateUser = async (id: string, userData: any): Promise<ApiResponse<any>> => {
  return baseService.patch<any>(`/users/${id}`, userData)
}

/**
 * Update current user's profile
 */
export const updateUserProfile = async (userData: any): Promise<ApiResponse<any>> => {
  return baseService.patch<any>('/users/profile', userData)
}

/**
 * Delete user account
 */
export const deleteUser = async (id: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/users/${id}`)
}

/**
 * Get user stats
 */
export const getUserStats = async (): Promise<ApiResponse<any>> => {
  return baseService.get<any>('/users/stats')
}

/**
 * Get user downloads
 */
export const getUserDownloads = async (): Promise<ApiResponse<any>> => {
  return baseService.get<any>('/users/downloads')
}

/**
 * Get specific user's orders (admin use)
 */
export const getUserOrders = async (id: string): Promise<ApiResponse<any>> => {
  return baseService.get<any>(`/users/${id}/orders`)
}

/**
 * Get current user's orders
 */
export const getCurrentUserOrders = async (): Promise<ApiResponse<any>> => {
  return baseService.get<any>('/users/orders')
}

/**
 * Get all users/customers with pagination and filters (admin use)
 */
export const getUsers = async (params?: {
  page?: number
  limit?: number
  search?: string
  type?: string
  date_from?: string
}): Promise<ApiResponse<any>> => {
  const query = params ? `?${new URLSearchParams(params as any).toString()}` : ''
  return baseService.get<any>(`/users${query}`)
}

/**
 * Get customer statistics (admin use)
 */
export const getCustomerStats = async (): Promise<ApiResponse<any>> => {
  return baseService.get<any>('/users/stats')
}

/**
 * Subscribe customer to newsletter (admin use)
 */
export const subscribeCustomerToNewsletter = async (id: string): Promise<ApiResponse<any>> => {
  return baseService.post<any>(`/users/${id}/subscribe`)
}

// Create a unified UserService object for easier usage
export const UserService = {
  // GET methods - Individual Users
  getUser: (id: string) => getUser(id), // Admin: Get any user by ID
  getUserProfile: () => getUserProfile(), // User: Get current user's profile
  getUserStats: () => getUserStats(),
  getUserDownloads: () => getUserDownloads(),
  getUserOrders: (id: string) => getUserOrders(id), // Admin: Get any user's orders
  getCurrentUserOrders: () => getCurrentUserOrders(), // User: Get current user's orders

  // GET methods - Collections & Admin
  getUsers: (params?: any) => getUsers(params), // Admin: Get all users/customers
  getCustomerStats: () => getCustomerStats(), // Admin: Get customer statistics

  // PATCH methods
  updateUser: (id: string, userData: any) => updateUser(id, userData), // Admin: Update any user
  updateUserProfile: (userData: any) => updateUserProfile(userData), // User: Update own profile

  // POST methods
  subscribeCustomerToNewsletter: (id: string) => subscribeCustomerToNewsletter(id), // Admin: Subscribe customer

  // DELETE methods
  deleteUser: (id: string) => deleteUser(id) // Admin: Delete any user
}