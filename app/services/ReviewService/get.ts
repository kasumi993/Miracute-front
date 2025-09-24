import type { ApiResponse } from '~/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

/**
 * Get reviews for a specific product
 */
export const getProductReviews = async (
  productId: string,
  page = 1,
  limit = 20,
  sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'
): Promise<ApiResponse<{ reviews: any[]; stats: any }>> => {
  const query: any = { page, limit }
  if (sortBy) query.sortBy = sortBy
  return baseService.get<{ reviews: any[]; stats: any }>(`/reviews/product-${productId}`, query)
}

/**
 * Get review statistics for a product
 */
export const getProductReviewStats = async (productId: string): Promise<ApiResponse<{
  totalReviews: number
  averageRating: number
  ratingDistribution: { [key: string]: number }
  verifiedPurchaseCount: number
  responseRate: number
}>> => {
  return baseService.get<{
    totalReviews: number
    averageRating: number
    ratingDistribution: { [key: string]: number }
    verifiedPurchaseCount: number
    responseRate: number
  }>(`/products/${productId}/reviews/stats`)
}

/**
 * Get specific review details
 */
export const getReview = async (reviewId: string): Promise<ApiResponse<any>> => {
  return baseService.get<any>(`/reviews/${reviewId}`)
}

/**
 * Get user's reviews
 */
export const getUserReviews = async (page = 1, limit = 20, status?: string): Promise<ApiResponse<{ reviews: any[]; pagination: any }>> => {
  const query: any = { page, limit }
  if (status) query.status = status
  return baseService.get<{ reviews: any[]; pagination: any }>('/users/reviews', query)
}

/**
 * Get reviews that need moderation (admin only)
 */
export const getReviewsForModeration = async (page = 1, limit = 20, status?: string): Promise<ApiResponse<{ reviews: any[]; pagination: any }>> => {
  const query: any = { page, limit }
  if (status) query.status = status
  return baseService.get<{ reviews: any[]; pagination: any }>('/admin/reviews/moderation', query)
}

/**
 * Get review responses/replies
 */
export const getReviewResponses = async (reviewId: string): Promise<ApiResponse<any[]>> => {
  return baseService.get<any[]>(`/reviews/${reviewId}/responses`)
}

/**
 * Get helpful votes for a review
 */
export const getReviewHelpfulVotes = async (reviewId: string): Promise<ApiResponse<{ helpful: number; notHelpful: number; userVote?: 'helpful' | 'not_helpful' }>> => {
  return baseService.get<{ helpful: number; notHelpful: number; userVote?: 'helpful' | 'not_helpful' }>(`/reviews/${reviewId}/votes`)
}

/**
 * Check if user can review a product
 */
export const canUserReviewProduct = async (productId: string): Promise<ApiResponse<{
  canReview: boolean
  reason?: string
  existingReviewId?: string
  purchaseVerified: boolean
}>> => {
  return baseService.get<{
    canReview: boolean
    reason?: string
    existingReviewId?: string
    purchaseVerified: boolean
  }>(`/products/${productId}/can-review`)
}

/**
 * Get trending reviews (most helpful, recent, etc.)
 */
export const getTrendingReviews = async (page = 1, limit = 20, period?: 'week' | 'month' | 'year'): Promise<ApiResponse<{ reviews: any[]; pagination: any }>> => {
  const query: any = { page, limit }
  if (period) query.period = period
  return baseService.get<{ reviews: any[]; pagination: any }>('/reviews/trending', query)
}

/**
 * Search reviews across all products
 */
export const searchReviews = async (
  query: string,
  page = 1,
  limit = 20,
  filters?: {
    rating?: number
    productId?: string
    verified?: boolean
    dateFrom?: string
    dateTo?: string
  }
): Promise<ApiResponse<{ reviews: any[]; pagination: any }>> => {
  const searchParams: any = { q: query, page, limit }
  if (filters) {
    Object.assign(searchParams, filters)
  }
  return baseService.get<{ reviews: any[]; pagination: any }>('/reviews/search', searchParams)
}

/**
 * Get review templates for common feedback
 */
export const getReviewTemplates = async (category?: string): Promise<ApiResponse<Array<{ id: string; title: string; content: string; category: string }>>> => {
  const query = category ? { category } : undefined
  return baseService.get<Array<{ id: string; title: string; content: string; category: string }>>('/reviews/templates', query)
}

/**
 * Get review sentiment analysis
 */
export const getReviewSentiment = async (reviewId: string): Promise<ApiResponse<{
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  keywords: string[]
  emotions: { [emotion: string]: number }
}>> => {
  return baseService.get<{
    sentiment: 'positive' | 'negative' | 'neutral'
    confidence: number
    keywords: string[]
    emotions: { [emotion: string]: number }
  }>(`/reviews/${reviewId}/sentiment`)
}

/**
 * Get edit notes for a review
 */
export const getReviewEditNotes = async (reviewId: string): Promise<ApiResponse<any[]>> => {
  return baseService.get<any[]>(`/reviews/${reviewId}/notes`)
}