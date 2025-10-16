import type { ProductWithCategory, ApiResponse } from '@/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

/**
 * Update product status (active/inactive)
 */
export const updateProductStatus = async (id: string, isActive: boolean): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.patch<ProductWithCategory>(`/products/${id}`, { is_active: isActive })
}

/**
 * Update product details
 */
export const updateProduct = async (id: string, updateData: any): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.patch<ProductWithCategory>(`/products/${id}`, updateData)
}

/**
 * Update order status
 */
export const updateOrderStatus = async (id: string, status: string): Promise<ApiResponse<any>> => {
  return baseService.patch<any>(`/orders/${id}`, { status })
}

/**
 * Update order details
 */
export const updateOrder = async (id: string, updateData: any): Promise<ApiResponse<any>> => {
  return baseService.patch<any>(`/orders/${id}`, updateData)
}

/**
 * Update customer details
 */
export const updateCustomer = async (id: string, updateData: any): Promise<ApiResponse<any>> => {
  return baseService.patch<any>(`/customers/${id}`, updateData)
}

/**
 * Update review details
 */
export const updateReview = async (id: string, updateData: {
  rating?: number
  title?: string
  comment?: string
  is_approved?: boolean
  is_featured?: boolean
}): Promise<ApiResponse<any>> => {
  return baseService.patch<any>(`/reviews/${id}`, updateData)
}

/**
 * Update category details
 */
export const updateCategory = async (id: string, updateData: {
  name?: string
  slug?: string
  description?: string
  parent_id?: string
  is_active?: boolean
  sort_order?: number
}): Promise<ApiResponse<any>> => {
  return baseService.patch<any>(`/categories/${id}`, updateData)
}

/**
 * Update admin settings
 */
export const updateSettings = async (settings: Record<string, any>): Promise<ApiResponse<any>> => {
  return baseService.patch<any>('/admin/settings', settings)
}

/**
 * Update user permissions
 */
export const updateUserPermissions = async (userId: string, permissions: string[]): Promise<ApiResponse<any>> => {
  return baseService.patch<any>(`/admin/users/${userId}/permissions`, { permissions })
}

/**
 * Update user role
 */
export const updateUserRole = async (userId: string, role: string): Promise<ApiResponse<any>> => {
  return baseService.patch<any>(`/admin/users/${userId}/role`, { role })
}

/**
 * Update product visibility
 */
export const updateProductVisibility = async (id: string, isVisible: boolean): Promise<ApiResponse<any>> => {
  return baseService.patch<any>(`/products/${id}`, { is_visible: isVisible })
}

/**
 * Update product featured status
 */
export const updateProductFeatured = async (id: string, isFeatured: boolean): Promise<ApiResponse<any>> => {
  return baseService.patch<any>(`/products/${id}`, { is_featured: isFeatured })
}

/**
 * Update category status
 */
export const updateCategoryStatus = async (id: string, isActive: boolean): Promise<ApiResponse<any>> => {
  return baseService.patch<any>(`/categories/${id}`, { is_active: isActive })
}

/**
 * Update review status (approve/reject)
 */
export const updateReviewStatus = async (id: string, isApproved: boolean): Promise<ApiResponse<any>> => {
  return baseService.patch<any>(`/reviews/${id}`, { is_approved: isApproved })
}

/**
 * Update order fulfillment status
 */
export const updateOrderFulfillment = async (id: string, fulfillmentData: {
  is_fulfilled?: boolean
  tracking_number?: string
  notes?: string
}): Promise<ApiResponse<any>> => {
  return baseService.patch<any>(`/orders/${id}/fulfillment`, fulfillmentData)
}

/**
 * Update customer status
 */
export const updateCustomerStatus = async (id: string, status: 'active' | 'suspended' | 'banned'): Promise<ApiResponse<any>> => {
  return baseService.patch<any>(`/customers/${id}/status`, { status })
}

/**
 * Bulk update products
 */
export const bulkUpdateProducts = async (updates: Array<{
  id: string
  data: any
}>): Promise<ApiResponse<any>> => {
  return baseService.patch<any>('/products/bulk-update', { updates })
}

/**
 * Update discount/coupon
 */
export const updateDiscount = async (id: string, updateData: any): Promise<ApiResponse<any>> => {
  return baseService.patch<any>(`/admin/discounts/${id}`, updateData)
}

/**
 * Update site configuration
 */
export const updateSiteConfig = async (configData: Record<string, any>): Promise<ApiResponse<any>> => {
  return baseService.patch<any>('/admin/config', configData)
}
