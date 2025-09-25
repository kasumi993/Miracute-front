/**
 * Professional Reviews Service
 * Consolidates all review-related functionality with proper caching and validation
 */

import type {
  Review,
  ReviewCreateInput,
  ReviewUpdateInput,
  ReviewStats,
  ApiResponse,
  PaginationParams,
  PaginatedResponse
} from '@/types'
import {
  validateRequired,
  validatePositiveNumber,
  validateStringLength,
  ValidationError,
  BusinessLogicError
} from '~/utils/errors'
import { BaseApiService } from '../BaseApiService'

export interface ReviewFilters {
  rating?: number
  verified?: boolean
  approved?: boolean
  hasImages?: boolean
  sortBy?: ReviewSortOption
  sortOrder?: 'asc' | 'desc'
  dateFrom?: string
  dateTo?: string
}

export type ReviewSortOption =
  | 'created_at'
  | 'rating'
  | 'helpful_count'
  | 'updated_at'

export interface ReviewSubmissionData {
  productId: string
  rating: number
  title?: string
  comment: string
  images?: File[]
  customerEmail?: string
  customerName?: string
}

export interface ReviewModerationAction {
  action: 'approve' | 'reject' | 'flag'
  reason?: string
  adminResponse?: string
}

export class ReviewsService extends BaseApiService {
  private static instance: ReviewsService
  private reviewStatsCache = new Map<string, { stats: ReviewStats; timestamp: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  private constructor() {
    super({ baseUrl: '/api' })
  }

  static getInstance(): ReviewsService {
    if (!ReviewsService.instance) {
      ReviewsService.instance = new ReviewsService()
    }
    return ReviewsService.instance
  }

  // ==========================================
  // Public Review Methods
  // ==========================================

  /**
   * Get reviews for a specific product with caching
   */
  async getProductReviews(
    productId: string,
    filters: ReviewFilters = {},
    pagination: PaginationParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Review>>> {
    try {
      validateRequired(productId, 'Product ID')

      const query = {
        ...filters,
        page: pagination.page || 1,
        limit: Math.min(pagination.limit || 20, 100) // Max 100 per page
      }

      const response = await this.get<PaginatedResponse<Review>>(
        `/products/${productId}/reviews`,
        query
      )

      if (response.success && response.data) {
        // Cache the review stats from the response
        this.cacheReviewStats(productId, this.calculateStatsFromReviews(response.data.data))
      }

      return response

    } catch (error) {
      console.error('Failed to fetch product reviews:', error)
      throw error
    }
  }

  /**
   * Get review statistics for a product (with caching)
   */
  async getProductReviewStats(productId: string, forceRefresh: boolean = false): Promise<ApiResponse<ReviewStats>> {
    try {
      validateRequired(productId, 'Product ID')

      // Check cache first
      if (!forceRefresh) {
        const cached = this.getFromCache(productId)
        if (cached) {
          return { success: true, data: cached, error: null }
        }
      }

      const response = await this.get<ReviewStats>(`/products/${productId}/reviews/stats`)

      if (response.success && response.data) {
        this.cacheReviewStats(productId, response.data)
      }

      return response

    } catch (error) {
      console.error('Failed to fetch review stats:', error)
      throw error
    }
  }

  /**
   * Submit a new review with comprehensive validation
   */
  async submitReview(
  reviewData: ReviewSubmissionData | { product_id: string; user_id: string; rating: number; title?: string | null; comment?: string | null }
): Promise<ApiResponse<Review>> {
    try {
      const normalized: ReviewSubmissionData = 'product_id' in reviewData
        ? {
            productId: reviewData.product_id,
            rating: reviewData.rating,
            title: reviewData.title ?? undefined,
            comment: (reviewData.comment ?? '').toString()
          }
        : reviewData

      // Comprehensive validation
      this.validateReviewSubmission(normalized)

      // Check if user has already reviewed this product
      const existingReview = await this.checkExistingReview(
        normalized.productId,
        normalized.customerEmail ?? ''
      )

      if (existingReview.data) {
        throw new BusinessLogicError(
          'You have already reviewed this product. You can update your existing review instead.',
          'DUPLICATE_REVIEW'
        )
      }

      // Verify purchase if required
      const purchaseVerified = await this.verifyPurchase(
        normalized.productId,
        normalized.customerEmail ?? ''
      )

      // Prepare review data
      const reviewPayload: ReviewCreateInput = {
        productId: normalized.productId,
        rating: normalized.rating,
        title: normalized.title?.trim(),
        comment: normalized.comment.trim()
      }

      // Handle image uploads if any
      if (normalized.images && normalized.images.length > 0) {
        const imageUploadResponse = await this.uploadReviewImages(normalized.images)
        if (imageUploadResponse.success && imageUploadResponse.data) {
          reviewPayload.images = imageUploadResponse.data.urls
        }
      }

      // Submit review
      const response = await this.post<Review>('/reviews/submit', {
        ...reviewPayload,
        customerEmail: normalized.customerEmail ?? 'anonymous@local',
        customerName: normalized.customerName ?? 'Anonymous',
        isVerifiedPurchase: purchaseVerified.data?.verified || false
      })

      if (response.success) {
        // Clear cached stats for this product
        this.clearCache(normalized.productId)

        // Send notification to admins about new review
        await this.notifyNewReview(normalized.productId, response.data!)
      }

      return response

    } catch (error) {
      console.error('Failed to submit review:', error)
      throw error
    }
  }

  /**
   * Update an existing review
   */
  async updateReview(
    reviewId: string,
    updates: ReviewUpdateInput
  ): Promise<ApiResponse<Review>> {
    try {
      validateRequired(reviewId, 'Review ID')

      // Validate update data
      if (updates.rating !== undefined) {
        validatePositiveNumber(updates.rating, 'Rating')
        if (updates.rating > 5) {
          throw new ValidationError('Rating cannot exceed 5', 'rating', updates.rating)
        }
      }

      if (updates.comment !== undefined) {
        validateStringLength(updates.comment, 'Comment', 10, 2000)
      }

      const response = await this.patch<Review>(`/reviews/${reviewId}`, updates)

      if (response.success && response.data) {
        // Clear cached stats for the product
        this.clearCache(response.data.productId)
      }

      return response

    } catch (error) {
      console.error('Failed to update review:', error)
      throw error
    }
  }

  /**
   * Delete a review (soft delete)
   */
  async deleteReview(reviewId: string): Promise<ApiResponse<{ message: string }>> {
    try {
      validateRequired(reviewId, 'Review ID')

      const response = await this.delete<{ message: string; productId?: string }>(
        `/reviews/${reviewId}`
      )

      if (response.success && response.data?.productId) {
        // Clear cached stats for the product
        this.clearCache(response.data.productId)
      }

      return response

    } catch (error) {
      console.error('Failed to delete review:', error)
      throw error
    }
  }

  /**
   * Report a review for moderation
   */
  async reportReview(
    reviewId: string,
    reason: string,
    details?: string
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      validateRequired(reviewId, 'Review ID')
      validateRequired(reason, 'Report reason')
      validateStringLength(reason, 'Reason', 5, 100)

      if (details) {
        validateStringLength(details, 'Details', 10, 500)
      }

      return await this.post<{ message: string }>(`/reviews/${reviewId}/report`, {
        reason: reason.trim(),
        details: details?.trim()
      })

    } catch (error) {
      console.error('Failed to report review:', error)
      throw error
    }
  }

  /**
   * Mark review as helpful/unhelpful
   */
  async markReviewHelpful(
    reviewId: string,
    isHelpful: boolean
  ): Promise<ApiResponse<{ helpfulCount: number }>> {
    try {
      validateRequired(reviewId, 'Review ID')

      return await this.post<{ helpfulCount: number }>(`/reviews/${reviewId}/helpful`, {
        isHelpful
      })

    } catch (error) {
      console.error('Failed to mark review helpful:', error)
      throw error
    }
  }

  // ==========================================
  // Admin Methods
  // ==========================================

  /**
   * Get all reviews with admin filters
   */
  async getReviewsForModeration(
    filters: ReviewFilters = {},
    pagination: PaginationParams = {}
  ): Promise<ApiResponse<PaginatedResponse<Review>>> {
    try {
      const query = {
        ...filters,
        page: pagination.page || 1,
        limit: Math.min(pagination.limit || 20, 100)
      }

      return await this.get<PaginatedResponse<Review>>('/admin/reviews', query)

    } catch (error) {
      console.error('Failed to fetch reviews for moderation:', error)
      throw error
    }
  }

  /**
   * Moderate a review (approve/reject/flag)
   */
  async moderateReview(
    reviewId: string,
    action: ReviewModerationAction
  ): Promise<ApiResponse<Review>> {
    try {
      validateRequired(reviewId, 'Review ID')
      validateRequired(action.action, 'Moderation action')

      if (action.reason) {
        validateStringLength(action.reason, 'Reason', 5, 200)
      }

      if (action.adminResponse) {
        validateStringLength(action.adminResponse, 'Admin response', 10, 500)
      }

      const response = await this.patch<Review>(`/admin/reviews/${reviewId}/moderate`, action)

      if (response.success && response.data) {
        // Clear cached stats for the product
        this.clearCache(response.data.productId)
      }

      return response

    } catch (error) {
      console.error('Failed to moderate review:', error)
      throw error
    }
  }

  // ==========================================
  // Private Helper Methods
  // ==========================================

  private validateReviewSubmission(data: ReviewSubmissionData): void {
    validateRequired(data.productId, 'Product ID')
    validateRequired(data.rating, 'Rating')
    validateRequired(data.comment, 'Comment')
    // customerEmail and customerName optional for legacy flows

    // Rating validation
    validatePositiveNumber(data.rating, 'Rating')
    if (data.rating > 5) {
      throw new ValidationError('Rating cannot exceed 5', 'rating', data.rating)
    }

    // Comment validation
    validateStringLength(data.comment, 'Comment', 10, 2000)

    // Title validation (optional)
    if (data.title) {
      validateStringLength(data.title, 'Title', 5, 100)
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (data.customerEmail && !emailRegex.test(data.customerEmail)) {
      throw new ValidationError('Invalid email format', 'customerEmail', data.customerEmail)
    }

    // Name validation
    if (data.customerName) {
      validateStringLength(data.customerName, 'Customer name', 2, 50)
    }

    // Images validation
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

  private async checkExistingReview(
    productId: string,
    customerEmail: string
  ): Promise<ApiResponse<Review | null>> {
    try {
      return await this.get<Review | null>('/reviews/check-existing', {
        productId,
        customerEmail
      })
    } catch {
      return { success: true, data: null, error: null }
    }
  }

  private async verifyPurchase(
    productId: string,
    customerEmail: string
  ): Promise<ApiResponse<{ verified: boolean }>> {
    try {
      return await this.get<{ verified: boolean }>('/reviews/verify-purchase', {
        productId,
        customerEmail
      })
    } catch {
      return { success: true, data: { verified: false }, error: null }
    }
  }

  private async uploadReviewImages(images: File[]): Promise<ApiResponse<{ urls: string[] }>> {
    try {
      return await this.uploadFiles('/reviews/upload-images', images)
    } catch (error) {
      console.warn('Failed to upload review images:', error)
      return { success: false, data: null, error: 'Failed to upload images' }
    }
  }

  private async notifyNewReview(productId: string, review: Review): Promise<void> {
    try {
      await this.post('/admin/notifications/new-review', {
        productId,
        reviewId: review.id,
        rating: review.rating,
        isVerified: review.isVerifiedPurchase
      })
    } catch (error) {
      console.warn('Failed to send new review notification:', error)
      // Don't throw - notification failure shouldn't break review submission
    }
  }

  private calculateStatsFromReviews(reviews: Review[]): ReviewStats {
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        verifiedPurchaseCount: 0
      }
    }

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let totalRating = 0
    let verifiedCount = 0

    reviews.forEach(review => {
      totalRating += review.rating
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++
      if (review.isVerifiedPurchase) {
        verifiedCount++
      }
    })

    return {
      averageRating: Math.round((totalRating / reviews.length) * 10) / 10,
      totalReviews: reviews.length,
      ratingDistribution,
      verifiedPurchaseCount: verifiedCount
    }
  }

  // Cache Management
  private getFromCache(productId: string): ReviewStats | null {
    const cached = this.reviewStatsCache.get(productId)
    if (!cached) {return null}

    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL
    if (isExpired) {
      this.reviewStatsCache.delete(productId)
      return null
    }

    return cached.stats
  }

  private cacheReviewStats(productId: string, stats: ReviewStats): void {
    this.reviewStatsCache.set(productId, {
      stats,
      timestamp: Date.now()
    })
  }

  private clearCache(productId: string): void {
    this.reviewStatsCache.delete(productId)
  }

  public clearAllCache(): void {
    this.reviewStatsCache.clear()
  }
}

// Export singleton instance
export const reviewsService = ReviewsService.getInstance()
