import type {
  Review,
  ApiResponse,
  PaginationParams,
  PaginatedResponse,
  ReviewFilters,
  ReviewModerationAction
} from '@/types'
import { validateRequired, validateStringLength } from '~/utils/errors'
import { BaseApiService } from '../BaseApiService'
import { ReviewCache } from './ReviewCache'
import { getCacheService } from './ReviewClientService' // Access cache instance

const baseService = new BaseApiService({ baseUrl: '/api' })
const cache = getCacheService() // Use the same cache instance

/**
 * Get all reviews with admin filters for moderation
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

  return baseService.get<PaginatedResponse<Review>>('/admin/reviews', query)
}

/**
 * Moderate a review (approve/reject/flag)
 */
export const moderateReview = async (
  reviewId: string,
  action: ReviewModerationAction
): Promise<ApiResponse<Review>> => {
  validateRequired(reviewId, 'Review ID')
  validateRequired(action.action, 'Moderation action')

  if (action.reason) {
    validateStringLength(action.reason, 'Reason', 5, 200)
  }

  if (action.adminResponse) {
    validateStringLength(action.adminResponse, 'Admin response', 10, 500)
  }

  const response = await baseService.patch<Review>(`/admin/reviews/${reviewId}/moderate`, action)

  if (response.success && response.data) {
    // Clear cached stats for the product
    cache.clearCache(response.data.productId)
  }

  return response
}