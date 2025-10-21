import type {
  Review, ReviewStats, ApiResponse, PaginationParams, PaginatedResponse, ReviewFilters
} from '@/types'
import { validateRequired } from '~/utils/errors'
import { BaseApiService } from '../BaseApiService/index'

const baseService = new BaseApiService({ baseUrl: '/api' })

/**
 * Get reviews for a specific product
 */
export const getProductReviews = async (
  productId: string,
  filters: ReviewFilters = {},
  pagination: PaginationParams = {}
): Promise<ApiResponse<PaginatedResponse<Review>>> => {
  validateRequired(productId, 'Product ID')

  const query = {
    ...filters,
    page: pagination.page || 1,
    limit: Math.min(pagination.limit || 20, 100)
  }

  return baseService.get<PaginatedResponse<Review>>(
    `/products/${productId}/reviews`,
    query
  )
}

/**
 * Get review statistics for a product
 */
export const getProductReviewStats = async (productId: string): Promise<ApiResponse<ReviewStats>> => {
  validateRequired(productId, 'Product ID')

  return baseService.get<ReviewStats>(`/products/${productId}/reviews/stats`)
}

/**
 * Get all reviews with admin filters for moderation (Admin only)
 */
export const getReviewsForModeration = async (
  filters: ReviewFilters = {},
  pagination: PaginationParams = {}
): Promise<ApiResponse<PaginatedResponse<Review>>> => {
  const query = {
    ...filters,
    page: pagination.page || 1,
    limit: Math.min(pagination.limit || 20, 100)
  }

  return baseService.get<PaginatedResponse<Review>>('/reviews', query)
}

