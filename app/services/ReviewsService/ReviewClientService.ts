import type {
  Review, ReviewUpdateInput, ReviewStats, ApiResponse, PaginationParams, PaginatedResponse, ReviewFilters, ReviewSubmissionData,
} from '@/types'
import { validateRequired, validatePositiveNumber, validateStringLength, ValidationError, BusinessLogicError } from '~/utils/errors'
import { BaseApiService } from '../BaseApiService'
import { ReviewCache } from './ReviewCache'
import {
  calculateStatsFromReviews,
  validateReviewSubmission,
  checkExistingReview,
  verifyPurchase,
  uploadReviewImages,
  notifyNewReview
} from './helpers'

const baseService = new BaseApiService({ baseUrl: '/api' })
const cache = new ReviewCache()

/**
 * Get reviews for a specific product with caching
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

  const response = await baseService.get<PaginatedResponse<Review>>(
    `/products/${productId}/reviews`,
    query
  )

  if (response.success && response.data) {
    // Cache the review stats from the response (optimization)
    cache.cacheStats(productId, calculateStatsFromReviews(response.data.data))
  }

  return response
}

/**
 * Get review statistics for a product (with caching)
 */
export const getProductReviewStats = async (productId: string, forceRefresh: boolean = false): Promise<ApiResponse<ReviewStats>> => {
  validateRequired(productId, 'Product ID')

  if (!forceRefresh) {
    const cached = cache.getFromCache(productId)
    if (cached) {
      return { success: true, data: cached, error: null }
    }
  }

  const response = await baseService.get<ReviewStats>(`/products/${productId}/reviews/stats`)

  if (response.success && response.data) {
    cache.cacheStats(productId, response.data)
  }

  return response
}

/**
 * Submit a new review with comprehensive validation
 */
export const submitReview = async (
  reviewData: ReviewSubmissionData | { product_id: string; user_id: string; rating: number; title?: string | null; comment?: string | null },
  isAdmin: boolean = false
): Promise<ApiResponse<Review>> => {
  const normalized: ReviewSubmissionData = 'product_id' in reviewData
    ? {
        productId: reviewData.product_id,
        rating: reviewData.rating,
        title: reviewData.title ?? undefined,
        comment: (reviewData.comment ?? '').toString()
      }
    : reviewData

  validateReviewSubmission(normalized)

  // Skip verification steps for admin users
  let purchaseVerified = { data: { verified: true } }

  if (!isAdmin) {
    const existingReview = await checkExistingReview(
      normalized.productId,
      normalized.customerEmail ?? ''
    )

    if (existingReview.data) {
      throw new BusinessLogicError(
        'You have already reviewed this product. You can update your existing review instead.',
        'DUPLICATE_REVIEW'
      )
    }

    purchaseVerified = await verifyPurchase(
      normalized.productId,
      normalized.customerEmail ?? ''
    )
  }

  const reviewPayload: ReviewCreateInput = {
    productId: normalized.productId,
    rating: normalized.rating,
    title: normalized.title?.trim(),
    comment: normalized.comment.trim()
  }

  // Handle image uploads
  if (normalized.images && normalized.images.length > 0) {
    const imageUploadResponse = await uploadReviewImages(normalized.images)
    if (imageUploadResponse.success && imageUploadResponse.data) {
      reviewPayload.images = imageUploadResponse.data.urls
    }
  }

  const response = await baseService.post<Review>('/reviews/submit', {
    product_id: reviewPayload.productId,
    rating: reviewPayload.rating,
    title: reviewPayload.title,
    comment: reviewPayload.comment,
    customerEmail: normalized.customerEmail ?? 'anonymous@local',
    customerName: normalized.customerName ?? 'Anonymous',
    isVerifiedPurchase: purchaseVerified.data?.verified || false
  })

  if (response.success) {
    cache.clearCache(normalized.productId)
    await notifyNewReview(normalized.productId, response.data!)
  }

  return response
}

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

  const response = await baseService.patch<Review>(`/reviews/${reviewId}`, updates)

  if (response.success && response.data) {
    cache.clearCache(response.data.productId)
  }

  return response
}

/**
 * Delete a review (soft delete)
 */
export const deleteReview = async (reviewId: string): Promise<ApiResponse<{ message: string }>> => {
  validateRequired(reviewId, 'Review ID')

  const response = await baseService.delete<{ message: string; productId?: string }>(
    `/reviews/${reviewId}`
  )

  if (response.success && response.data?.productId) {
    cache.clearCache(response.data.productId)
  }

  return response as ApiResponse<{ message: string }>
}

/**
 * Report a review for moderation
 */
export const reportReview = async (
  reviewId: string,
  reason: string,
  details?: string
): Promise<ApiResponse<{ message: string }>> => {
  validateRequired(reviewId, 'Review ID')
  validateRequired(reason, 'Report reason')
  validateStringLength(reason, 'Reason', 5, 100)

  if (details) {
    validateStringLength(details, 'Details', 10, 500)
  }

  return baseService.post<{ message: string }>(`/reviews/${reviewId}/report`, {
    reason: reason.trim(),
    details: details?.trim()
  })
}

/**
 * Mark review as helpful/unhelpful
 */
export const markReviewHelpful = async (
  reviewId: string,
  isHelpful: boolean
): Promise<ApiResponse<{ helpfulCount: number }>> => {
  validateRequired(reviewId, 'Review ID')

  return baseService.post<{ helpfulCount: number }>(`/reviews/${reviewId}/helpful`, {
    isHelpful
  })
}

export const getCacheService = (): ReviewCache => cache