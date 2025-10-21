import type { ApiResponse } from '@/types'
import { validateRequired } from '~/utils/errors'
import { BaseApiService } from '../BaseApiService/index'

const baseService = new BaseApiService()

/**
 * Delete a review (soft delete)
 */
export const deleteReview = async (reviewId: string): Promise<ApiResponse<{ message: string }>> => {
  validateRequired(reviewId, 'Review ID')

  return baseService.delete<{ message: string }>(`/reviews/${reviewId}`)
}