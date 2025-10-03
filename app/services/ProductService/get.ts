import type { ProductWithCategory, ApiResponse, SearchResponse } from '@/types'
import { BaseApiService } from '../BaseApiService'

export interface ProductFilters {
  search?: string
  category?: string
  tags?: string[]
  min_price?: number
  max_price?: number
  template_type?: string
  sort?: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'popular'
  featured?: boolean // Ajouté pour le support des filtres
  on_sale?: boolean
}

export interface ProductPaginationParams {
  page?: number
  limit?: number
}

const baseService = new BaseApiService()

/**
 * Get paginated list of products with filters
 */
export const getProducts = async (
  filters: ProductFilters = {},
  pagination: ProductPaginationParams = {}
): Promise<ApiResponse<SearchResponse<ProductWithCategory>>> => {

  const query = {
    ...filters,
    page: pagination.page || 1,
    limit: pagination.limit || 12
  }
 
  return baseService.get<SearchResponse<ProductWithCategory>>('/products', query)
}

/**
 * Get single product by ID
 */
export const getProduct = async (id: string): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.get<ProductWithCategory>(`/products/${id}`)
}

/**
 * Get single product by slug
 */
export const getProductBySlug = async (slug: string): Promise<ApiResponse<ProductWithCategory>> => {
  return baseService.get<ProductWithCategory>(`/products/${slug}`)
}

/**
 * Search products
 */
export const searchProducts = async (
  query: string,
  filters: Omit<ProductFilters, 'search'> = {},
  pagination: ProductPaginationParams = {}
): Promise<ApiResponse<SearchResponse<ProductWithCategory>>> => {
  return getProducts({ ...filters, search: query }, pagination)
}

/**
 * Get products by category
 */
export const getProductsByCategory = async (
  categoryId: string,
  filters: Omit<ProductFilters, 'category'> = {},
  pagination: ProductPaginationParams = {}
): Promise<ApiResponse<SearchResponse<ProductWithCategory>>> => {
  return getProducts({ ...filters, category: categoryId }, pagination)
}

/**
 * Get products by template type
 */
export const getProductsByTemplateType = async (
  templateType: string,
  filters: Omit<ProductFilters, 'template_type'> = {},
  pagination: ProductPaginationParams = {}
): Promise<ApiResponse<SearchResponse<ProductWithCategory>>> => {
  return getProducts({ ...filters, template_type: templateType }, pagination)
}

/**
 * Get products by price range
 */
export const getProductsByPriceRange = async (
  minPrice: number,
  maxPrice: number,
  filters: Omit<ProductFilters, 'min_price' | 'max_price'> = {},
  pagination: ProductPaginationParams = {}
): Promise<ApiResponse<SearchResponse<ProductWithCategory>>> => {
  return getProducts({ ...filters, min_price: minPrice, max_price: maxPrice }, pagination)
}

/**
 * Get products on sale
 */
export const getSaleProducts = async (
  filters: ProductFilters = {},
  pagination: ProductPaginationParams = {}
): Promise<ApiResponse<SearchResponse<ProductWithCategory>>> => {
  return getProducts({ ...filters, on_sale: true }, pagination)
}

/**
 * Get product recommendations based on user behavior
 */
export const getRecommendedProducts = async (limit = 6): Promise<ApiResponse<ProductWithCategory[]>> => {
  return baseService.get<ProductWithCategory[]>('/products/recommendations', { limit })
}

/**
 * Get popular products
 */
export const getPopularProducts = async (limit = 8): Promise<ApiResponse<ProductWithCategory[]>> => {
  const response = await baseService.get<SearchResponse<ProductWithCategory>>('/products', {
    sort: 'popular',
    limit
  })

  if (response.success && response.data?.data) {
    return {
      success: true,
      data: response.data.data
    }
  }

  return response as any
}

/**
 * Get featured products
 */
export const getFeaturedProducts = async (limit = 6): Promise<ApiResponse<ProductWithCategory[]>> => {
  const response = await baseService.get<SearchResponse<ProductWithCategory>>('/products', {
    featured: true,
    limit
  })
  console.log('getFeaturedProducts response:', response)

  if (response.success && response.data?.data) {
    return {
      success: true,
      data: response.data.data
    }
  }

  return response as any
}


/**
 * Get related products (products in same category)
 */
export const getRelatedProducts = async (
  productId: string,
  categoryId?: string,
  limit = 4
): Promise<ApiResponse<ProductWithCategory[]>> => {
  const filters: any = { limit }
  if (categoryId) {
    filters.category = categoryId
  }

  const response = await getProducts(filters)
  console.log('getRelatedProducts response:', response)

  if (response.success && response.data?.data) {
    // Filter out the current product and limit results
    const related = response.data.data
      .filter(product => product.id !== productId)
      .slice(0, limit)

    return {
      success: true,
      data: related
    }
  }

  return response as any
}





/**
 * Get product variants
 */
export const getProductVariants = async (productId: string): Promise<ApiResponse<any[]>> => {
  return baseService.get<any[]>(`/products/${productId}/variants`)
}

