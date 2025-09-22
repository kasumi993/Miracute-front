import type { ProductWithCategory, ApiResponse } from '~/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

/**
 * Create a new product (for authenticated users)
 */
export const createProduct = async (productData: {
  name: string
  description: string
  price: number
  category_id: string
  template_type?: string
  tags?: string[]
  images?: string[]
  files?: string[]
  is_active?: boolean
  is_featured?: boolean
}): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.post<ProductWithCategory>('/products', productData)
}

/**
 * Add product to favorites
 */
export const addToFavorites = async (productId: string): Promise<ApiResponse<{ message: string }>> => {
  return baseService.post<{ message: string }>(`/products/${productId}/favorites`)
}

/**
 * Add product to cart
 */
export const addToCart = async (productId: string, quantity = 1): Promise<ApiResponse<{ message: string }>> => {
  return baseService.post<{ message: string }>(`/products/${productId}/cart`, { quantity })
}

/**
 * Track product view
 */
export const trackProductView = async (productId: string, metadata?: Record<string, any>): Promise<ApiResponse<{ message: string }>> => {
  return baseService.post<{ message: string }>(`/products/${productId}/view`, { metadata })
}

/**
 * Report product issue
 */
export const reportProduct = async (
  productId: string,
  reason: 'copyright' | 'inappropriate' | 'broken' | 'spam' | 'other',
  description?: string
): Promise<ApiResponse<{ message: string }>> => {
  return baseService.post<{ message: string }>(`/products/${productId}/report`, {
    reason,
    description
  })
}

/**
 * Request product customization
 */
export const requestCustomization = async (
  productId: string,
  customizationData: {
    type: string
    description: string
    contact_email: string
    budget?: number
  }
): Promise<ApiResponse<{ message: string; request_id: string }>> => {
  return baseService.post<{ message: string; request_id: string }>(`/products/${productId}/customize`, customizationData)
}

/**
 * Submit product suggestion
 */
export const submitProductSuggestion = async (suggestionData: {
  title: string
  description: string
  category?: string
  contact_email: string
  priority?: 'low' | 'medium' | 'high'
}): Promise<ApiResponse<{ message: string; suggestion_id: string }>> => {
  return baseService.post<{ message: string; suggestion_id: string }>('/products/suggest', suggestionData)
}

/**
 * Create product variant
 */
export const createProductVariant = async (
  productId: string,
  variantData: {
    name: string
    price: number
    sku?: string
    attributes?: Record<string, any>
  }
): Promise<ApiResponse<any>> => {
  return baseService.post<any>(`/products/${productId}/variants`, variantData)
}

/**
 * Upload product images
 */
export const uploadProductImages = async (productId: string, formData: FormData): Promise<ApiResponse<{ images: string[] }>> => {
  return baseService.request<{ images: string[] }>(`/products/${productId}/images`, {
    method: 'POST',
    body: formData,
    headers: {} // Remove Content-Type to let browser set it for FormData
  })
}

/**
 * Upload product files
 */
export const uploadProductFiles = async (productId: string, formData: FormData): Promise<ApiResponse<{ files: string[] }>> => {
  return baseService.request<{ files: string[] }>(`/products/${productId}/files`, {
    method: 'POST',
    body: formData,
    headers: {} // Remove Content-Type to let browser set it for FormData
  })
}

/**
 * Create product review
 */
export const createProductReview = async (
  productId: string,
  reviewData: {
    rating: number
    title?: string
    comment?: string
    order_id?: string
  }
): Promise<ApiResponse<any>> => {
  return baseService.post<any>(`/products/${productId}/reviews`, reviewData)
}

/**
 * Subscribe to product updates
 */
export const subscribeToProductUpdates = async (
  productId: string,
  email: string
): Promise<ApiResponse<{ message: string }>> => {
  return baseService.post<{ message: string }>(`/products/${productId}/subscribe`, { email })
}

/**
 * Request product demo
 */
export const requestProductDemo = async (
  productId: string,
  contactData: {
    name: string
    email: string
    company?: string
    message?: string
  }
): Promise<ApiResponse<{ message: string; request_id: string }>> => {
  return baseService.post<{ message: string; request_id: string }>(`/products/${productId}/demo`, contactData)
}

/**
 * Clone/duplicate product (for sellers)
 */
export const cloneProduct = async (
  productId: string,
  modifications?: {
    name?: string
    price?: number
    description?: string
  }
): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.post<ProductWithCategory>(`/products/${productId}/clone`, modifications)
}

/**
 * Create product comparison
 */
export const createProductComparison = async (productIds: string[]): Promise<ApiResponse<{ comparison_id: string; url: string }>> => {
  return baseService.post<{ comparison_id: string; url: string }>('/products/compare', { product_ids: productIds })
}

/**
 * Save product for later
 */
export const saveForLater = async (productId: string): Promise<ApiResponse<{ message: string }>> => {
  return baseService.post<{ message: string }>(`/products/${productId}/save`)
}

/**
 * Share product
 */
export const shareProduct = async (
  productId: string,
  shareData: {
    method: 'email' | 'social' | 'link'
    recipient?: string
    message?: string
  }
): Promise<ApiResponse<{ message: string; share_url?: string }>> => {
  return baseService.post<{ message: string; share_url?: string }>(`/products/${productId}/share`, shareData)
}

/**
 * Create product bundle
 */
export const createProductBundle = async (bundleData: {
  name: string
  description: string
  product_ids: string[]
  discount_percentage?: number
  discount_amount?: number
}): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.post<ProductWithCategory>('/products/bundles', bundleData)
}