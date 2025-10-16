import type { ApiResponse } from '@/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

/**
 * Delete product
 */
export const deleteProduct = async (id: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/products/${id}`)
}

/**
 * Delete category
 */
export const deleteCategory = async (id: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/categories/${id}`)
}

/**
 * Delete review
 */
export const deleteReview = async (id: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/reviews/${id}`)
}

/**
 * Delete order (soft delete)
 */
export const deleteOrder = async (id: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/orders/${id}`)
}

/**
 * Delete customer account
 */
export const deleteCustomer = async (id: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/customers/${id}`)
}

/**
 * Delete user account
 */
export const deleteUser = async (id: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/admin/users/${id}`)
}

/**
 * Delete discount/coupon
 */
export const deleteDiscount = async (id: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/admin/discounts/${id}`)
}

/**
 * Delete uploaded image
 */
export const deleteImage = async (imageId: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/admin/images/${imageId}`)
}

/**
 * Bulk delete products
 */
export const bulkDeleteProducts = async (productIds: string[]): Promise<ApiResponse<{ deleted: number }>> => {
  return baseService.request<{ deleted: number }>('/products/bulk-delete', {
    method: 'DELETE',
    body: { ids: productIds }
  })
}

/**
 * Bulk delete categories
 */
export const bulkDeleteCategories = async (categoryIds: string[]): Promise<ApiResponse<{ deleted: number }>> => {
  return baseService.request<{ deleted: number }>('/categories/bulk-delete', {
    method: 'DELETE',
    body: { ids: categoryIds }
  })
}

/**
 * Bulk delete reviews
 */
export const bulkDeleteReviews = async (reviewIds: string[]): Promise<ApiResponse<{ deleted: number }>> => {
  return baseService.request<{ deleted: number }>('/reviews/bulk-delete', {
    method: 'DELETE',
    body: { ids: reviewIds }
  })
}

/**
 * Delete product variant
 */
export const deleteProductVariant = async (productId: string, variantId: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/products/${productId}/variants/${variantId}`)
}

/**
 * Delete product image
 */
export const deleteProductImage = async (productId: string, imageId: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/products/${productId}/images/${imageId}`)
}

/**
 * Delete category image
 */
export const deleteCategoryImage = async (categoryId: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/admin/categories/${categoryId}/image`)
}

/**
 * Delete admin session (logout admin user)
 */
export const deleteAdminSession = async (sessionId: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/admin/sessions/${sessionId}`)
}

/**
 * Delete notification
 */
export const deleteNotification = async (id: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/admin/notifications/${id}`)
}

/**
 * Delete log entry
 */
export const deleteLogEntry = async (id: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/admin/logs/${id}`)
}

/**
 * Clear all logs (with confirmation)
 */
export const clearAllLogs = async (confirm: boolean = false): Promise<ApiResponse<{ cleared: number }>> => {
  return baseService.request<{ cleared: number }>('/admin/logs/clear-all', {
    method: 'DELETE',
    body: { confirm }
  })
}

/**
 * Delete backup file
 */
export const deleteBackup = async (backupId: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/admin/backups/${backupId}`)
}

/**
 * Delete cache entry
 */
export const deleteCacheEntry = async (key: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/admin/cache/${encodeURIComponent(key)}`)
}

/**
 * Clear all cache
 */
export const clearAllCache = async (): Promise<ApiResponse<{ message: string }>> => {
  return baseService.delete<{ message: string }>('/admin/cache/clear-all')
}
