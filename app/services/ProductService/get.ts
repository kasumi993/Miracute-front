import type { ProductWithCategory, ProductWithReviewStats, ApiResponse, SearchResponse } from '@/types/database'
import { BaseApiService } from '../BaseApiService'

export interface ProductFilters {
  search?: string
  category?: string
  tags?: string[]
  min_price?: number
  max_price?: number
  template_type?: string
  sort?: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'popular'
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
  console.log('ProductService.getProducts called with:', { filters, pagination })

  // Check if we're running on the client side
  if (process.server) {
    console.log('ProductService.getProducts: Running on server side, using $fetch directly')

    const query = new URLSearchParams()
    Object.entries({
      ...filters,
      page: (pagination.page || 1).toString(),
      limit: (pagination.limit || 12).toString()
    }).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })

    const url = `/api/products?${query.toString()}`
    console.log('ProductService.getProducts: Making server-side request to:', url)

    try {
      const response = await $fetch<ApiResponse<SearchResponse<ProductWithCategory>>>(url)
      console.log('ProductService.getProducts: Server-side response:', response)
      return response
    } catch (error) {
      console.error('ProductService.getProducts: Server-side error:', error)
      return {
        success: false,
        error: 'Failed to fetch products on server',
        data: null as any
      }
    }
  }

  const query = {
    ...filters,
    page: pagination.page || 1,
    limit: pagination.limit || 12
  }

  const result = await baseService.get<SearchResponse<ProductWithCategory>>('/products', query)
  return result
}

/**
 * Get paginated list of products with review statistics
 */
export const getProductsWithReviews = async (
  filters: ProductFilters = {},
  pagination: ProductPaginationParams = {}
): Promise<ApiResponse<SearchResponse<ProductWithReviewStats>>> => {
  console.log('ProductService.getProductsWithReviews called with:', { filters, pagination })

  // Check if we're running on the client side
  if (process.server) {
    console.log('ProductService.getProductsWithReviews: Running on server side, using $fetch directly')

    const query = new URLSearchParams()
    Object.entries({
      ...filters,
      page: (pagination.page || 1).toString(),
      limit: (pagination.limit || 12).toString()
    }).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value))
      }
    })

    const url = `/api/products/with-reviews?${query.toString()}`
    console.log('ProductService.getProductsWithReviews: Making server-side request to:', url)

    try {
      const response = await $fetch<ApiResponse<SearchResponse<ProductWithReviewStats>>>(url)
      console.log('ProductService.getProductsWithReviews: Server-side response:', response)
      return response
    } catch (error) {
      console.error('ProductService.getProductsWithReviews: Server-side error:', error)
      return {
        success: false,
        error: 'Failed to fetch products with reviews on server',
        data: null as any
      }
    }
  }

  const query = {
    ...filters,
    page: pagination.page || 1,
    limit: pagination.limit || 12
  }

  return baseService.get<SearchResponse<ProductWithReviewStats>>('/products/with-reviews', query)
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

  if (response.success && response.data?.data) {
    return {
      success: true,
      data: response.data.data
    }
  }

  return response as any
}

/**
 * Get newest products
 */
export const getNewestProducts = async (limit = 8): Promise<ApiResponse<ProductWithCategory[]>> => {
  const response = await baseService.get<SearchResponse<ProductWithCategory>>('/products', {
    sort: 'newest',
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
 * Get product recommendations based on user behavior
 */
export const getRecommendedProducts = async (limit = 6): Promise<ApiResponse<ProductWithCategory[]>> => {
  return baseService.get<ProductWithCategory[]>('/products/recommendations', { limit })
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
 * Get product variants
 */
export const getProductVariants = async (productId: string): Promise<ApiResponse<any[]>> => {
  return baseService.get<any[]>(`/products/${productId}/variants`)
}

/**
 * Get product reviews count
 */
export const getProductReviewsCount = async (productId: string): Promise<ApiResponse<{ count: number; average_rating: number }>> => {
  return baseService.get<{ count: number; average_rating: number }>(`/products/${productId}/reviews/count`)
}

/**
 * Check product availability
 */
export const checkProductAvailability = async (productId: string): Promise<ApiResponse<{ available: boolean; stock?: number }>> => {
  return baseService.get<{ available: boolean; stock?: number }>(`/products/${productId}/availability`)
}
