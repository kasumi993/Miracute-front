import type { Review, ReviewSubmissionData, ApiResponse } from '@/types'
import {
  validateRequired,
  validatePositiveNumber,
  validateStringLength,
  ValidationError
} from '~/utils/errors'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService({ baseUrl: '/api' })

// --- Validation ---

export const validateReviewSubmission = (data: ReviewSubmissionData): void => {
  validateRequired(data.productId, 'Product ID')
  validateRequired(data.rating, 'Rating')
  validateRequired(data.comment, 'Comment')

  validatePositiveNumber(data.rating, 'Rating')
  if (data.rating > 5) {
    throw new ValidationError('Rating cannot exceed 5', 'rating', data.rating)
  }

  validateStringLength(data.comment, 'Comment', 10, 2000)

  if (data.title) {
    validateStringLength(data.title, 'Title', 5, 100)
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (data.customerEmail && !emailRegex.test(data.customerEmail)) {
    throw new ValidationError('Invalid email format', 'customerEmail', data.customerEmail)
  }

  if (data.customerName) {
    validateStringLength(data.customerName, 'Customer name', 2, 50)
  }

  if (data.images) {
    if (data.images.length > 5) {
      throw new ValidationError('Maximum 5 images allowed', 'images')
    }

    data.images.forEach((image, index) => {
      if (!image.type.startsWith('image/')) {
        throw new ValidationError(`File ${index + 1} is not an image`, 'images')
      }

      if (image.size > 5 * 1024 * 1024) { // 5MB
        throw new ValidationError(`Image ${index + 1} is too large (max 5MB)`, 'images')
      }
    })
  }
}

// --- Internal API Helpers ---

/**
 * Checks if a user has already reviewed a product using targeted endpoint.
 */
export const checkExistingReview = async (
  productId: string,
  userId?: string
): Promise<ApiResponse<Review | null>> => {
  try {
    return await baseService.get<Review | null>('/reviews/check-existing', {
      productId,
      userId
    })
  } catch (error) {
    return {
      success: false,
      data: null,
      error: 'Failed to check existing review'
    }
  }
}

/**
 * Verifies if the user has purchased the product using targeted endpoint.
 */
export const verifyPurchase = async (
  productId: string,
  userId?: string
): Promise<ApiResponse<{ verified: boolean; isAdmin?: boolean }>> => {
  try {
    return await baseService.get<{ verified: boolean; isAdmin?: boolean }>('/purchases/verify', {
      productId,
      userId
    })
  } catch (error) {
    return {
      success: false,
      data: { verified: false },
      error: 'Failed to verify purchase'
    }
  }
}

/**
 * Uploads review images.
 */
export const uploadReviewImages = async (
  images: File[]
): Promise<ApiResponse<{ urls: string[] }>> => {
  try {
    return await baseService.post<{ urls: string[] }>('/reviews/images/upload', { images })
  } catch (error) {
    console.warn('Failed to upload review images:', error)
    return {
      success: false,
      data: { urls: [] },
      error: 'Failed to upload images'
    }
  }
}

/**
 * Sends notification to admins about a new review.
 */
export const notifyNewReview = async (productId: string, review: Review): Promise<void> => {
  try {
    // Use the new email service for admin notifications
    // This will be handled by server-side email service automatically
    await baseService.post('/email/send/admin-review-notification', {
      productId,
      reviewId: review.id,
      rating: review.rating,
      isVerified: review.isVerifiedPurchase,
      title: review.title,
      comment: review.comment,
      customerName: (review as any).customer_name || 'Anonymous',
      customerEmail: (review as any).customer_email
    })
  } catch (error) {
    console.warn('Failed to send new review notification:', error)
  }
}

