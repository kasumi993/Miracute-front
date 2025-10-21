import type {
  Review, ReviewUpdateInput, ReviewSubmissionData, ApiResponse
} from '@/types'
import { validateRequired, validatePositiveNumber, validateStringLength, ValidationError, BusinessLogicError } from '~/utils/errors'
import { BaseApiService } from '../BaseApiService/index'
import {
  validateReviewSubmission,
  checkExistingReview,
  uploadReviewImages,
  notifyNewReview
} from './helpers'

const baseService = new BaseApiService({ baseUrl: '/api' })

/**
 * Submit a new review with simplified flow
 */
export const submitReview = async (
  reviewData: ReviewSubmissionData,
  userId?: string
): Promise<ApiResponse<Review>> => {
  // 1. Validate input
  validateReviewSubmission(reviewData)

  // 2. Check for authentication requirement
  if (!userId && !reviewData.customerEmail) {
    throw new ValidationError('User authentication or email required')
  }

  // 3. Check for existing review (server will handle duplicate prevention)
  if (userId) {
    const existingReview = await checkExistingReview(reviewData.productId, userId)
    if (existingReview.success && existingReview.data) {
      throw new BusinessLogicError(
        'You have already reviewed this product. You can update your existing review instead.',
        'DUPLICATE_REVIEW'
      )
    }
  }

  // 4. Handle image uploads if present
  let imageUrls: string[] = []
  if (reviewData.images && reviewData.images.length > 0) {
    const imageUploadResponse = await uploadReviewImages(reviewData.images)
    if (imageUploadResponse.success && imageUploadResponse.data) {
      imageUrls = imageUploadResponse.data.urls
    }
  }

  // 5. Submit review (server handles purchase verification)
  const response = await baseService.post<Review>('/reviews', {
    productId: reviewData.productId,
    rating: reviewData.rating,
    title: reviewData.title?.trim(),
    comment: reviewData.comment.trim(),
    userId: userId,
    customerEmail: reviewData.customerEmail?.trim(),
    customerName: reviewData.customerName?.trim(),
    images: imageUrls
  })

  // 6. Send notification on success
  if (response.success && response.data) {
    await notifyNewReview(reviewData.productId, response.data)
  }

  return response
}

/**
 * Report a review for inappropriate content
 */
export const reportReview = async (
  reviewId: string,
  reason: string,
  details?: string
): Promise<ApiResponse<{ message: string }>> => {
  validateRequired(reviewId, 'Review ID')
  validateRequired(reason, 'Report reason')
  validateStringLength(reason, 'Report reason', 5, 100)

  if (details) {
    validateStringLength(details, 'Report details', 10, 500)
  }

  return baseService.post<{ message: string }>(`/reviews/${reviewId}/report`, {
    reason: reason.trim(),
    details: details?.trim()
  })
}

/**
 * Mark a review as helpful/not helpful
 */
export const markReviewHelpful = async (
  reviewId: string,
  isHelpful: boolean
): Promise<ApiResponse<{ message: string; helpfulCount?: number }>> => {
  validateRequired(reviewId, 'Review ID')

  return baseService.post<{ message: string; helpfulCount?: number }>(
    `/reviews/${reviewId}/helpful`,
    { helpful: isHelpful }
  )
}

/**
 * Create a review (Admin only)
 */
export const createReview = async (reviewData: {
  productId: string
  rating: number
  title?: string
  comment: string
  customerEmail: string
  customerName: string
  isVerifiedPurchase?: boolean
}): Promise<ApiResponse<Review>> => {
  validateRequired(reviewData.productId, 'Product ID')
  validateRequired(reviewData.customerEmail, 'Customer email')
  validateRequired(reviewData.customerName, 'Customer name')
  validatePositiveNumber(reviewData.rating, 'Rating')
  validateStringLength(reviewData.comment, 'Comment', 10, 2000)

  if (reviewData.rating > 5) {
    throw new ValidationError('Rating cannot exceed 5', 'rating', reviewData.rating)
  }

  if (reviewData.title) {
    validateStringLength(reviewData.title, 'Title', 5, 100)
  }

  const response = await baseService.post<Review>('/admin/reviews', {
    productId: reviewData.productId,
    rating: reviewData.rating,
    title: reviewData.title?.trim(),
    comment: reviewData.comment.trim(),
    customerEmail: reviewData.customerEmail.toLowerCase().trim(),
    customerName: reviewData.customerName.trim(),
    isVerifiedPurchase: reviewData.isVerifiedPurchase || false
  })


  return response
}