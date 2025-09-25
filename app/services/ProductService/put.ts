import type { ProductWithCategory, ApiResponse } from '@/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

/**
 * Update a product (for authenticated users)
 */
export const updateProduct = async (
  id: string,
  productData: {
    name?: string
    description?: string
    price?: number
    category_id?: string
    template_type?: string
    tags?: string[]
    images?: string[]
    files?: string[]
    is_active?: boolean
    is_featured?: boolean
    meta_title?: string
    meta_description?: string
  }
): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.put<ProductWithCategory>(`/products/${id}`, productData)
}

/**
 * Update product images
 */
export const updateProductImages = async (
  id: string,
  imageData: {
    images: string[]
    primary_image?: string
  }
): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.put<ProductWithCategory>(`/products/${id}/images`, imageData)
}

/**
 * Update product files
 */
export const updateProductFiles = async (
  id: string,
  fileData: {
    files: Array<{
      id?: string
      name: string
      url: string
      size?: number
      type?: string
    }>
  }
): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.put<ProductWithCategory>(`/products/${id}/files`, fileData)
}

/**
 * Update product pricing
 */
export const updateProductPricing = async (
  id: string,
  pricingData: {
    price: number
    sale_price?: number
    discount_percentage?: number
    currency?: string
  }
): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.put<ProductWithCategory>(`/products/${id}/pricing`, pricingData)
}

/**
 * Update product SEO
 */
export const updateProductSEO = async (
  id: string,
  seoData: {
    meta_title?: string
    meta_description?: string
    slug?: string
    canonical_url?: string
    og_title?: string
    og_description?: string
    og_image?: string
  }
): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.put<ProductWithCategory>(`/products/${id}/seo`, seoData)
}

/**
 * Update product variant
 */
export const updateProductVariant = async (
  productId: string,
  variantId: string,
  variantData: {
    name?: string
    price?: number
    sku?: string
    attributes?: Record<string, any>
    is_active?: boolean
  }
): Promise<ApiResponse<any>> => {
  return baseService.put<any>(`/products/${productId}/variants/${variantId}`, variantData)
}

/**
 * Update product status
 */
export const updateProductStatus = async (
  id: string,
  status: 'active' | 'inactive' | 'draft' | 'archived'
): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.put<ProductWithCategory>(`/products/${id}/status`, { status })
}

/**
 * Update product visibility
 */
export const updateProductVisibility = async (
  id: string,
  visibility: 'public' | 'private' | 'hidden'
): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.put<ProductWithCategory>(`/products/${id}/visibility`, { visibility })
}

/**
 * Update product category
 */
export const updateProductCategory = async (
  id: string,
  categoryId: string
): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.put<ProductWithCategory>(`/products/${id}/category`, { category_id: categoryId })
}

/**
 * Update product tags
 */
export const updateProductTags = async (
  id: string,
  tags: string[]
): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.put<ProductWithCategory>(`/products/${id}/tags`, { tags })
}

/**
 * Update product inventory
 */
export const updateProductInventory = async (
  id: string,
  inventoryData: {
    track_inventory?: boolean
    stock_quantity?: number
    low_stock_threshold?: number
    allow_backorders?: boolean
  }
): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.put<ProductWithCategory>(`/products/${id}/inventory`, inventoryData)
}

/**
 * Update product shipping
 */
export const updateProductShipping = async (
  id: string,
  shippingData: {
    requires_shipping?: boolean
    weight?: number
    dimensions?: {
      length: number
      width: number
      height: number
    }
    shipping_class?: string
  }
): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.put<ProductWithCategory>(`/products/${id}/shipping`, shippingData)
}

/**
 * Reorder product images
 */
export const reorderProductImages = async (
  id: string,
  imageOrder: Array<{
    id: string
    order: number
  }>
): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.put<ProductWithCategory>(`/products/${id}/images/reorder`, { image_order: imageOrder })
}

/**
 * Update product attributes
 */
export const updateProductAttributes = async (
  id: string,
  attributes: Record<string, any>
): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.put<ProductWithCategory>(`/products/${id}/attributes`, { attributes })
}

/**
 * Update product bundle
 */
export const updateProductBundle = async (
  id: string,
  bundleData: {
    name?: string
    description?: string
    product_ids?: string[]
    discount_percentage?: number
    discount_amount?: number
  }
): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.put<ProductWithCategory>(`/products/${id}/bundle`, bundleData)
}

/**
 * Replace product completely
 */
export const replaceProduct = async (
  id: string,
  productData: {
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
  }
): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.put<ProductWithCategory>(`/products/${id}`, productData)
}
