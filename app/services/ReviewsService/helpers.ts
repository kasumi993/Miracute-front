import type { Review, ReviewSubmissionData, ReviewStats } from '@/types'
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
 * Checks if a user has already reviewed a product by querying product reviews.
 */
export const checkExistingReview = async (
  productId: string,
  customerEmail?: string // Made optional since we now use user authentication
): Promise<any> => { // Used 'any' to match original return, but should ideally be ApiResponse<Review | null>
  try {
    // Get reviews for this product to check if user already reviewed
    const reviews = await baseService.get(`/products/${productId}/reviews`, { limit: 100 })
    if (!reviews.success || !reviews.data?.data) {
      return { success: true, data: null, error: null }
    }

    // Find existing review by current user (if authenticated) or email
    const auth = useAuth()
    const existingReview = reviews.data.data.find((review: any) => {
      if (auth.isAuthenticated.value && auth.user.value) {
        return review.user_id === auth.user.value.id
      }
      return customerEmail && review.customerEmail === customerEmail
    })

    return { success: true, data: existingReview || null, error: null }
  } catch {
    return { success: true, data: null, error: null }
  }
}

/**
 * Verifies if the customer has purchased the product by checking their orders.
 */
export const verifyPurchase = async (
  productId: string,
  customerEmail?: string // Made optional since we now use user authentication
): Promise<any> => { // Used 'any' to match original return, should ideally be ApiResponse<{ verified: boolean }>
  try {
    const auth = useAuth()

    // Check if user is admin
    if (auth.isAuthenticated.value && auth.user.value?.role === 'admin') {
      return { success: true, data: { verified: true, isAdmin: true }, error: null }
    }

    // For authenticated users, check their orders for this product
    if (auth.isAuthenticated.value) {
      const orders = await baseService.get('/orders', { product_id: productId, limit: 1 })
      if (orders.success && orders.data?.data?.length > 0) {
        // Check if any order has paid status
        const hasPaidOrder = orders.data.data.some((order: any) =>
          order.payment_status === 'paid' &&
          order.order_items?.some((item: any) => item.product_id === productId)
        )
        return { success: true, data: { verified: hasPaidOrder, isAdmin: false }, error: null }
      }
    }

    return { success: true, data: { verified: false, isAdmin: false }, error: null }
  } catch {
    return { success: true, data: { verified: false, isAdmin: false }, error: null }
  }
}

/**
 * Uploads review images.
 */
export const uploadReviewImages = async (
  images: File[]
): Promise<any> => { // Used 'any' to match original return, should ideally be ApiResponse<{ urls: string[] }>
  try {
    // Assuming uploadFiles is a method on BaseApiService
    return await baseService.uploadFiles('/reviews/upload-images', images)
  } catch (error) {
    console.warn('Failed to upload review images:', error)
    return { success: false, data: null, error: 'Failed to upload images' }
  }
}

/**
 * Sends notification to admins about a new review.
 */
export const notifyNewReview = async (productId: string, review: Review): Promise<void> => {
  try {
    await baseService.post('/admin/notifications/new-review', {
      productId,
      reviewId: review.id,
      rating: review.rating,
      isVerified: review.isVerifiedPurchase
    })
  } catch (error) {
    console.warn('Failed to send new review notification:', error)
  }
}

// --- Calculation ---

/**
 * Calculates statistics from a list of reviews.
 */
export const calculateStatsFromReviews = (reviews: Review[]): ReviewStats => {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      verifiedPurchaseCount: 0
    }
  }

  const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
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
    ratingDistribution: ratingDistribution as any, // Cast to match ReviewStats
    verifiedPurchaseCount: verifiedCount
  }
}