import type {
  Review, ReviewUpdateInput, ReviewModerationAction, ApiResponse
} from '@/types'
import { validateRequired, validatePositiveNumber, validateStringLength, ValidationError } from '~/utils/errors'
import { BaseApiService } from '../BaseApiService/index'

const baseService = new BaseApiService()

/**
 * Update an existing review
 */
export const updateReview = async (
  reviewId: string,
  updates: ReviewUpdateInput
): Promise<ApiResponse<Review>> => {
  validateRequired(reviewId, 'Review ID')

  if (updates.rating !== undefined) {
    validatePositiveNumber(updates.rating, 'Rating')
    if (updates.rating > 5) {
      throw new ValidationError('Rating cannot exceed 5', 'rating', updates.rating)
    }
  }

  if (updates.comment !== undefined) {
    validateStringLength(updates.comment, 'Comment', 10, 2000)
  }

  return baseService.patch<Review>(`/reviews/${reviewId}`, updates)
}

/**
 * Moderate a review (approve/reject/flag) - Admin only
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

  return baseService.patch<Review>(`/reviews/${reviewId}/moderate`, {
    action: action.action,
    reason: action.reason?.trim(),
    adminResponse: action.adminResponse?.trim(),
    adminNotes: action.adminNotes?.trim()
  })
}