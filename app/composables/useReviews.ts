import { reviewsService } from '@/services'

export const useReviews = () => {
  // Get reviews for a product
  const getProductReviews = async (productId: string) => {
    try {
      const response = await reviewsService.getProductReviews(productId)
      return response
    } catch (error) {
      console.error('Error fetching reviews:', error)
      throw error
    }
  }

  // Submit a new review
  const submitReview = async (reviewData: {
    product_id: string
    user_id: string
    rating: number
    title?: string
    comment?: string
  }) => {
    try {
      const response = await reviewsService.submitReview(reviewData)
      return response
    } catch (error) {
      console.error('Error submitting review:', error)
      throw error
    }
  }

  // Admin functions
  const getAdminReviews = async (params: {
    page?: number
    limit?: number
    status?: 'approved' | 'pending' | 'all'
    product_id?: string
    rating?: number
  } = {}) => {
    try {
      const response = await reviewsService.getReviewsForModeration(params.page, params.limit, params.status)
      return response
    } catch (error) {
      console.error('Error fetching admin reviews:', error)
      throw error
    }
  }

  // Update review (admin)
  const updateReview = async (reviewId: string, updates: {
    is_approved?: boolean
    title?: string
    comment?: string
    rating?: number
  }) => {
    try {
      const response = await reviewsService.updateReview(reviewId, updates)
      return response
    } catch (error) {
      console.error('Error updating review:', error)
      throw error
    }
  }

  // Delete review (admin)
  const deleteReview = async (reviewId: string) => {
    try {
      const response = await reviewsService.deleteReview(reviewId)
      return response
    } catch (error) {
      console.error('Error deleting review:', error)
      throw error
    }
  }

  // Create review (admin)
  const createReview = async (reviewData: {
    product_id: string
    user_id: string
    rating: number
    title?: string
    comment?: string
    is_verified_purchase?: boolean
    is_approved?: boolean
    force_override?: boolean
  }) => {
    try {
      const response = await reviewsService.submitReview(reviewData)
      return response
    } catch (error) {
      console.error('Error creating review:', error)
      throw error
    }
  }

  // Approve review (admin)
  const approveReview = async (reviewId: string) => {
    return updateReview(reviewId, { is_approved: true })
  }

  // Reject review (admin)
  const rejectReview = async (reviewId: string) => {
    return updateReview(reviewId, { is_approved: false })
  }

  // Helper function to format rating display
  const formatRating = (rating: number) => {
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
    return labels[rating] || 'Unknown'
  }

  // Helper function to get rating color
  const getRatingColor = (rating: number) => {
    if (rating >= 4) {return 'text-green-600'}
    if (rating >= 3) {return 'text-yellow-600'}
    return 'text-red-600'
  }

  return {
    // Public functions
    getProductReviews,
    submitReview,

    // Admin functions
    getAdminReviews,
    updateReview,
    deleteReview,
    createReview,
    approveReview,
    rejectReview,

    // Helper functions
    formatRating,
    getRatingColor
  }
}
