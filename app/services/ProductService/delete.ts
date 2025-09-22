import type { ApiResponse } from '~/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

/**
 * Delete product
 */
export const deleteProduct = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  return baseService.delete<{ message: string }>(`/products/${id}`)
}

/**
 * Remove product from favorites
 */
export const removeFromFavorites = async (productId: string): Promise<ApiResponse<{ message: string }>> => {
  return baseService.delete<{ message: string }>(`/products/${productId}/favorites`)
}

/**
 * Remove product from cart
 */
export const removeFromCart = async (productId: string): Promise<ApiResponse<{ message: string }>> => {
  return baseService.delete<{ message: string }>(`/products/${productId}/cart`)
}

/**
 * Delete product image
 */
export const deleteProductImage = async (productId: string, imageId: string): Promise<ApiResponse<{ message: string }>> => {
  return baseService.delete<{ message: string }>(`/products/${productId}/images/${imageId}`)
}

/**
 * Delete product file
 */
export const deleteProductFile = async (productId: string, fileId: string): Promise<ApiResponse<{ message: string }>> => {
  return baseService.delete<{ message: string }>(`/products/${productId}/files/${fileId}`)
}

/**
 * Delete product variant
 */
export const deleteProductVariant = async (productId: string, variantId: string): Promise<ApiResponse<{ message: string }>> => {
  return baseService.delete<{ message: string }>(`/products/${productId}/variants/${variantId}`)
}

/**
 * Remove product from saved items
 */
export const removeFromSaved = async (productId: string): Promise<ApiResponse<{ message: string }>> => {
  return baseService.delete<{ message: string }>(`/products/${productId}/save`)
}

/**
 * Delete product review
 */
export const deleteProductReview = async (productId: string, reviewId: string): Promise<ApiResponse<{ message: string }>> => {
  return baseService.delete<{ message: string }>(`/products/${productId}/reviews/${reviewId}`)
}

/**
 * Unsubscribe from product updates
 */
export const unsubscribeFromProductUpdates = async (productId: string): Promise<ApiResponse<{ message: string }>> => {
  return baseService.delete<{ message: string }>(`/products/${productId}/subscribe`)
}

/**
 * Delete product comparison
 */
export const deleteProductComparison = async (comparisonId: string): Promise<ApiResponse<{ message: string }>> => {
  return baseService.delete<{ message: string }>(`/products/compare/${comparisonId}`)
}

/**
 * Delete product bundle
 */
export const deleteProductBundle = async (bundleId: string): Promise<ApiResponse<{ message: string }>> => {
  return baseService.delete<{ message: string }>(`/products/bundles/${bundleId}`)
}

/**
 * Remove product from bundle
 */
export const removeProductFromBundle = async (bundleId: string, productId: string): Promise<ApiResponse<{ message: string }>> => {
  return baseService.delete<{ message: string }>(`/products/bundles/${bundleId}/products/${productId}`)
}

/**
 * Delete product tag
 */
export const deleteProductTag = async (productId: string, tag: string): Promise<ApiResponse<{ message: string }>> => {
  return baseService.delete<{ message: string }>(`/products/${productId}/tags/${encodeURIComponent(tag)}`)
}

/**
 * Clear product cache
 */
export const clearProductCache = async (productId: string): Promise<ApiResponse<{ message: string }>> => {
  return baseService.delete<{ message: string }>(`/products/${productId}/cache`)
}

/**
 * Delete product suggestion
 */
export const deleteProductSuggestion = async (suggestionId: string): Promise<ApiResponse<{ message: string }>> => {
  return baseService.delete<{ message: string }>(`/products/suggestions/${suggestionId}`)
}

/**
 * Cancel product customization request
 */
export const cancelCustomizationRequest = async (requestId: string): Promise<ApiResponse<{ message: string }>> => {
  return baseService.delete<{ message: string }>(`/products/customization-requests/${requestId}`)
}

/**
 * Delete product attribute
 */
export const deleteProductAttribute = async (productId: string, attributeKey: string): Promise<ApiResponse<{ message: string }>> => {
  return baseService.delete<{ message: string }>(`/products/${productId}/attributes/${encodeURIComponent(attributeKey)}`)
}

/**
 * Bulk delete products
 */
export const bulkDeleteProducts = async (productIds: string[]): Promise<ApiResponse<{ deleted: number; failed: string[] }>> => {
  return baseService.request<{ deleted: number; failed: string[] }>('/products/bulk-delete', {
    method: 'DELETE',
    body: { product_ids: productIds }
  })
}

/**
 * Delete all product images
 */
export const deleteAllProductImages = async (productId: string): Promise<ApiResponse<{ message: string; deleted: number }>> => {
  return baseService.delete<{ message: string; deleted: number }>(`/products/${productId}/images`)
}

/**
 * Delete all product files
 */
export const deleteAllProductFiles = async (productId: string): Promise<ApiResponse<{ message: string; deleted: number }>> => {
  return baseService.delete<{ message: string; deleted: number }>(`/products/${productId}/files`)
}

/**
 * Archive product (soft delete)
 */
export const archiveProduct = async (productId: string): Promise<ApiResponse<{ message: string }>> => {
  return baseService.delete<{ message: string }>(`/products/${productId}/archive`)
}