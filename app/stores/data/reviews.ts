import { defineStore } from 'pinia'
import { reviewsService } from '@/services'
import type { Database } from '@/types/database'

type Review = Database['public']['Tables']['reviews']['Row']
type User = Database['public']['Tables']['users']['Row']

export interface ReviewWithAuthor extends Review {
  author: Pick<User, 'id' | 'first_name' | 'last_name' | 'avatar_url'> | null
  helpful_count: number
  is_helpful: boolean // Whether current user marked as helpful
  is_verified_purchase: boolean
}

export interface ReviewStats {
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  verifiedPurchaseCount: number
  helpfulReviewsCount: number
}

export interface ReviewFilters {
  rating?: number[]
  verifiedPurchase?: boolean
  withPhotos?: boolean
  sortBy?: 'newest' | 'oldest' | 'highest_rating' | 'lowest_rating' | 'most_helpful'
  search?: string
}

export interface ReviewFormData {
  productId: string
  rating: number
  title: string
  content: string
  photos?: File[]
  recommend: boolean
}

interface ReviewsState {
  // Product reviews
  productReviews: Record<string, ReviewWithAuthor[]>
  productReviewStats: Record<string, ReviewStats>

  // User reviews
  userReviews: ReviewWithAuthor[]

  // Current review data
  currentProductId: string | null
  currentReviews: ReviewWithAuthor[]
  currentStats: ReviewStats | null

  // Filtering and pagination
  filters: ReviewFilters
  pagination: {
    page: number
    limit: number
    total: number
    hasMore: boolean
  }

  // Form state
  reviewForm: ReviewFormData | null
  isSubmittingReview: boolean

  // Loading states
  loading: {
    reviews: boolean
    stats: boolean
    userReviews: boolean
    submit: boolean
    helpful: boolean
  }

  // Error states
  error: string | null

  // Cache management
  lastFetch: Record<string, number>
  cacheTimeout: number
}

export const useReviewsStore = defineStore('reviews', {
  state: (): ReviewsState => ({
    productReviews: {},
    productReviewStats: {},
    userReviews: [],

    currentProductId: null,
    currentReviews: [],
    currentStats: null,

    filters: {
      sortBy: 'newest'
    },

    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      hasMore: false
    },

    reviewForm: null,
    isSubmittingReview: false,

    loading: {
      reviews: false,
      stats: false,
      userReviews: false,
      submit: false,
      helpful: false
    },

    error: null,

    lastFetch: {},
    cacheTimeout: 5 * 60 * 1000 // 5 minutes
  }),

  getters: {
    // Loading states
    isLoading: (state) => Object.values(state.loading).some(loading => loading),

    // Current product reviews
    hasCurrentReviews: (state) => state.currentReviews.length > 0,

    currentReviewsCount: (state) => state.currentReviews.length,

    currentAverageRating: (state) => state.currentStats?.averageRating || 0,

    currentTotalReviews: (state) => state.currentStats?.totalReviews || 0,

    // Filtered reviews
    filteredReviews: (state) => {
      let reviews = [...state.currentReviews]

      // Filter by rating
      if (state.filters.rating && state.filters.rating.length > 0) {
        reviews = reviews.filter(review => state.filters.rating!.includes(review.rating))
      }

      // Filter by verified purchase
      if (state.filters.verifiedPurchase !== undefined) {
        reviews = reviews.filter(review => review.is_verified_purchase === state.filters.verifiedPurchase)
      }

      // Filter by photos
      if (state.filters.withPhotos) {
        reviews = reviews.filter(review => review.photos && review.photos.length > 0)
      }

      // Search filter
      if (state.filters.search) {
        const searchTerm = state.filters.search.toLowerCase()
        reviews = reviews.filter(review =>
          review.title.toLowerCase().includes(searchTerm) ||
          review.content.toLowerCase().includes(searchTerm)
        )
      }

      // Sort reviews
      switch (state.filters.sortBy) {
        case 'newest':
          reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          break
        case 'oldest':
          reviews.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          break
        case 'highest_rating':
          reviews.sort((a, b) => b.rating - a.rating)
          break
        case 'lowest_rating':
          reviews.sort((a, b) => a.rating - b.rating)
          break
        case 'most_helpful':
          reviews.sort((a, b) => b.helpful_count - a.helpful_count)
          break
      }

      return reviews
    },

    // Review statistics
    ratingDistributionPercentages: (state) => {
      if (!state.currentStats) {return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }}

      const total = state.currentStats.totalReviews
      if (total === 0) {return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }}

      return {
        1: (state.currentStats.ratingDistribution[1] / total) * 100,
        2: (state.currentStats.ratingDistribution[2] / total) * 100,
        3: (state.currentStats.ratingDistribution[3] / total) * 100,
        4: (state.currentStats.ratingDistribution[4] / total) * 100,
        5: (state.currentStats.ratingDistribution[5] / total) * 100
      }
    },

    // User review status
    hasUserReviewed: (state) => (productId: string, userId: string) => {
      const reviews = state.productReviews[productId] || []
      return reviews.some(review => review.user_id === userId)
    },

    getUserReviewForProduct: (state) => (productId: string, userId: string) => {
      const reviews = state.productReviews[productId] || []
      return reviews.find(review => review.user_id === userId)
    },

    // Cache validation
    isProductDataStale: (state) => (productId: string) => {
      const lastFetch = state.lastFetch[productId]
      if (!lastFetch) {return true}
      return Date.now() - lastFetch > state.cacheTimeout
    },

    // Review form validation
    isReviewFormValid: (state) => {
      if (!state.reviewForm) {return false}
      return !!(
        state.reviewForm.productId &&
        state.reviewForm.rating > 0 &&
        state.reviewForm.title.trim() &&
        state.reviewForm.content.trim()
      )
    },

    // Featured reviews
    featuredReviews: (state) => {
      return state.currentReviews
        .filter(review => review.rating >= 4 && review.helpful_count > 0)
        .sort((a, b) => b.helpful_count - a.helpful_count)
        .slice(0, 3)
    },

    // Recent reviews
    recentReviews: (state) => {
      return [...state.currentReviews]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
    }
  },

  actions: {
    // Loading management
    setLoading(type: keyof ReviewsState['loading'], loading: boolean) {
      this.loading[type] = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    // Fetch product reviews
    async fetchProductReviews(productId: string, force = false) {
      if (!force && !this.isProductDataStale(productId) && this.productReviews[productId]) {
        this.currentProductId = productId
        this.currentReviews = this.productReviews[productId]
        this.currentStats = this.productReviewStats[productId]
        return
      }

      this.setLoading('reviews', true)
      this.setError(null)
      this.currentProductId = productId

      try {
        const response = await reviewsService.getProductReviews(productId, {
          page: this.pagination.page,
          limit: this.pagination.limit,
          sortBy: this.filters.sortBy
        })

        if (response.success && response.data) {
          const { reviews, pagination, stats } = response.data

          this.productReviews[productId] = reviews
          this.productReviewStats[productId] = stats
          this.currentReviews = reviews
          this.currentStats = stats

          this.pagination = {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            hasMore: pagination.hasMore
          }

          this.lastFetch[productId] = Date.now()
        } else {
          throw new Error(response.error || 'Failed to fetch product reviews')
        }
      } catch (error: any) {
        console.error('Error fetching product reviews:', error)
        this.setError(error.message || 'Failed to fetch product reviews')
      } finally {
        this.setLoading('reviews', false)
      }
    },

    // Load more reviews (pagination)
    async loadMoreReviews() {
      if (!this.currentProductId || !this.pagination.hasMore || this.loading.reviews) {return}

      const nextPage = this.pagination.page + 1

      this.setLoading('reviews', true)

      try {
        const response = await reviewsService.getProductReviews(this.currentProductId, {
          page: nextPage,
          limit: this.pagination.limit,
          sortBy: this.filters.sortBy
        })

        if (response.success && response.data) {
          const { reviews, pagination } = response.data

          // Append new reviews
          this.currentReviews.push(...reviews)
          this.productReviews[this.currentProductId].push(...reviews)

          this.pagination = {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            hasMore: pagination.hasMore
          }
        } else {
          throw new Error(response.error || 'Failed to load more reviews')
        }
      } catch (error: any) {
        console.error('Error loading more reviews:', error)
        this.setError(error.message || 'Failed to load more reviews')
      } finally {
        this.setLoading('reviews', false)
      }
    },

    // Fetch user reviews
    async fetchUserReviews(userId: string) {
      this.setLoading('userReviews', true)
      this.setError(null)

      try {
        const response = await reviewsService.getUserReviews(userId)

        if (response.success && response.data) {
          this.userReviews = response.data
        } else {
          throw new Error(response.error || 'Failed to fetch user reviews')
        }
      } catch (error: any) {
        console.error('Error fetching user reviews:', error)
        this.setError(error.message || 'Failed to fetch user reviews')
      } finally {
        this.setLoading('userReviews', false)
      }
    },

    // Create review
    async createReview(reviewData: ReviewFormData) {
      this.setLoading('submit', true)
      this.setError(null)

      try {
        const response = await reviewsService.createReview(reviewData)

        if (response.success && response.data) {
          // Add new review to current product reviews
          if (this.currentProductId === reviewData.productId) {
            this.currentReviews.unshift(response.data)
            this.productReviews[reviewData.productId] = this.currentReviews

            // Update stats
            if (this.currentStats) {
              this.currentStats.totalReviews += 1
              this.currentStats.ratingDistribution[reviewData.rating as keyof typeof this.currentStats.ratingDistribution] += 1

              // Recalculate average rating
              const total = this.currentStats.totalReviews
              const sum = Object.entries(this.currentStats.ratingDistribution)
                .reduce((acc, [rating, count]) => acc + (parseInt(rating) * count), 0)
              this.currentStats.averageRating = sum / total

              this.productReviewStats[reviewData.productId] = this.currentStats
            }
          }

          this.resetReviewForm()
          return response.data
        } else {
          throw new Error(response.error || 'Failed to create review')
        }
      } catch (error: any) {
        console.error('Error creating review:', error)
        this.setError(error.message || 'Failed to create review')
        throw error
      } finally {
        this.setLoading('submit', false)
      }
    },

    // Update review
    async updateReview(reviewId: string, updates: Partial<ReviewFormData>) {
      this.setLoading('submit', true)
      this.setError(null)

      try {
        const response = await reviewsService.updateReview(reviewId, updates)

        if (response.success && response.data) {
          // Update review in current reviews
          const index = this.currentReviews.findIndex(review => review.id === reviewId)
          if (index !== -1) {
            this.currentReviews[index] = response.data
          }

          // Update in product reviews cache
          if (this.currentProductId && this.productReviews[this.currentProductId]) {
            const productIndex = this.productReviews[this.currentProductId].findIndex(
              review => review.id === reviewId
            )
            if (productIndex !== -1) {
              this.productReviews[this.currentProductId][productIndex] = response.data
            }
          }

          return response.data
        } else {
          throw new Error(response.error || 'Failed to update review')
        }
      } catch (error: any) {
        console.error('Error updating review:', error)
        this.setError(error.message || 'Failed to update review')
        throw error
      } finally {
        this.setLoading('submit', false)
      }
    },

    // Delete review
    async deleteReview(reviewId: string) {
      this.setLoading('submit', true)
      this.setError(null)

      try {
        const response = await reviewsService.deleteReview(reviewId)

        if (response.success) {
          // Remove from current reviews
          this.currentReviews = this.currentReviews.filter(review => review.id !== reviewId)

          // Remove from product reviews cache
          if (this.currentProductId && this.productReviews[this.currentProductId]) {
            this.productReviews[this.currentProductId] = this.productReviews[this.currentProductId]
              .filter(review => review.id !== reviewId)
          }

          // Update stats
          if (this.currentStats) {
            this.currentStats.totalReviews = Math.max(0, this.currentStats.totalReviews - 1)
          }

          return true
        } else {
          throw new Error(response.error || 'Failed to delete review')
        }
      } catch (error: any) {
        console.error('Error deleting review:', error)
        this.setError(error.message || 'Failed to delete review')
        return false
      } finally {
        this.setLoading('submit', false)
      }
    },

    // Mark review as helpful
    async markReviewHelpful(reviewId: string, helpful: boolean) {
      this.setLoading('helpful', true)

      try {
        const response = await reviewsService.markReviewHelpful(reviewId, helpful)

        if (response.success) {
          // Update review in current reviews
          const review = this.currentReviews.find(r => r.id === reviewId)
          if (review) {
            if (helpful && !review.is_helpful) {
              review.helpful_count += 1
              review.is_helpful = true
            } else if (!helpful && review.is_helpful) {
              review.helpful_count = Math.max(0, review.helpful_count - 1)
              review.is_helpful = false
            }
          }

          return true
        } else {
          throw new Error(response.error || 'Failed to mark review as helpful')
        }
      } catch (error: any) {
        console.error('Error marking review as helpful:', error)
        this.setError(error.message || 'Failed to mark review as helpful')
        return false
      } finally {
        this.setLoading('helpful', false)
      }
    },

    // Filter management
    setFilter<K extends keyof ReviewFilters>(key: K, value: ReviewFilters[K]) {
      this.filters[key] = value
    },

    clearFilters() {
      this.filters = { sortBy: 'newest' }
    },

    // Review form management
    initializeReviewForm(productId: string) {
      this.reviewForm = {
        productId,
        rating: 0,
        title: '',
        content: '',
        photos: [],
        recommend: true
      }
    },

    updateReviewForm<K extends keyof ReviewFormData>(key: K, value: ReviewFormData[K]) {
      if (this.reviewForm) {
        this.reviewForm[key] = value
      }
    },

    resetReviewForm() {
      this.reviewForm = null
      this.isSubmittingReview = false
    },

    // Pagination
    setPage(page: number) {
      this.pagination.page = page
    },

    setLimit(limit: number) {
      this.pagination.limit = limit
      this.pagination.page = 1 // Reset to first page
    },

    // Clear current product data
    clearCurrentProduct() {
      this.currentProductId = null
      this.currentReviews = []
      this.currentStats = null
      this.pagination.page = 1
    },

    // Clear error
    clearError() {
      this.setError(null)
    },

    // Utility methods
    getReviewById(reviewId: string): ReviewWithAuthor | null {
      return this.currentReviews.find(review => review.id === reviewId) || null
    },

    // Calculate review summary for a product
    getProductReviewSummary(productId: string) {
      const stats = this.productReviewStats[productId]
      if (!stats) {return null}

      return {
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
        verifiedPurchasePercentage: stats.totalReviews > 0
          ? (stats.verifiedPurchaseCount / stats.totalReviews) * 100
          : 0,
        recommendationPercentage: this.currentReviews.length > 0
          ? (this.currentReviews.filter(r => r.recommend).length / this.currentReviews.length) * 100
          : 0
      }
    }
  }

  // Persist filters and pagination preferences
})
