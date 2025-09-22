import type { ApiResponse } from '~/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

export interface UserProfileUpdateData {
  name?: string
  email?: string
  phone?: string
  bio?: string
  avatar?: string
  preferences?: Record<string, any>
}

export interface UserAddressData {
  type: 'billing' | 'shipping'
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault?: boolean
}

export interface UserSettingsData {
  emailNotifications: boolean
  smsNotifications: boolean
  marketingEmails: boolean
  language: string
  timezone: string
  currency: string
  theme?: 'light' | 'dark' | 'auto'
}

export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/**
 * Update user profile information
 */
export const updateUserProfile = async (data: UserProfileUpdateData): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/users/profile', data)
}

/**
 * Update user settings
 */
export const updateUserSettings = async (data: UserSettingsData): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/users/settings', data)
}

/**
 * Change user password
 */
export const changePassword = async (data: PasswordChangeData): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>('/users/change-password', data)
}

/**
 * Add product to wishlist
 */
export const addToWishlist = async (productId: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>('/users/wishlist', { productId })
}

/**
 * Remove product from wishlist
 */
export const removeFromWishlist = async (productId: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>('/users/wishlist/remove', { productId })
}

/**
 * Add or update user address
 */
export const saveUserAddress = async (data: UserAddressData, addressId?: string): Promise<ApiResponse<any>> => {
  const endpoint = addressId ? `/users/addresses/${addressId}` : '/users/addresses'
  return baseService.post<any>(endpoint, data)
}

/**
 * Delete user address
 */
export const deleteUserAddress = async (addressId: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>(`/users/addresses/${addressId}/delete`, {})
}

/**
 * Set default address
 */
export const setDefaultAddress = async (addressId: string, type: 'billing' | 'shipping'): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>('/users/addresses/set-default', { addressId, type })
}

/**
 * Request account deletion
 */
export const requestAccountDeletion = async (reason?: string): Promise<ApiResponse<{ success: boolean; message: string; deletionId: string }>> => {
  return baseService.post<{ success: boolean; message: string; deletionId: string }>('/users/delete-account', { reason })
}

/**
 * Cancel account deletion request
 */
export const cancelAccountDeletion = async (deletionId: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>('/users/cancel-deletion', { deletionId })
}

/**
 * Upload user avatar
 */
export const uploadAvatar = async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
  const formData = new FormData()
  formData.append('avatar', file)
  return baseService.post<{ avatarUrl: string }>('/users/avatar', formData)
}

/**
 * Export user data (GDPR compliance)
 */
export const exportUserData = async (format: 'json' | 'csv' = 'json'): Promise<ApiResponse<{ downloadUrl: string; expiresAt: string }>> => {
  return baseService.post<{ downloadUrl: string; expiresAt: string }>('/users/export-data', { format })
}