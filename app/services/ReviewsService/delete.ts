import type { ApiResponse } from '@/types'
import { validateRequired, validatePositiveNumber } from '~/utils/errors'
import { BaseApiService } from '../BaseApiService/index'

const baseService = new BaseApiService({ baseUrl: '/api' })

/**
 * Delete a review (soft delete)
 */
export const deleteReview = async (reviewId: string): Promise<ApiResponse<{ message: string }>> => {
  validateRequired(reviewId, 'Review ID')

  return baseService.delete<{ message: string }>(`/reviews/${reviewId}`)
}

/**
 * Bulk delete multiple reviews (Admin only)
 */
export const bulkDeleteReviews = async (reviewIds: string[]): Promise<ApiResponse<{ deleted: number }>> => {
  if (!reviewIds || reviewIds.length === 0) {
    throw new Error('Review IDs array cannot be empty')
  }

  validatePositiveNumber(reviewIds.length, 'Number of reviews')

  if (reviewIds.length > 100) {
    throw new Error('Cannot delete more than 100 reviews at once')
  }

  reviewIds.forEach((id, index) => {
    validateRequired(id, `Review ID at index ${index}`)
  })

  return baseService.delete<{ deleted: number }>('/admin/reviews/bulk', {
    reviewIds
  })
}