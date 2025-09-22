// Export all GET methods
export * from './get'

// Export all POST methods
export * from './post'

// Create a unified ReviewService object for easier usage
export const ReviewService = {
  // GET methods
  getProductReviews: (productId: string, page?: number, limit?: number, sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful') =>
    import('./get').then(m => m.getProductReviews(productId, page, limit, sortBy)),
  getProductReviewStats: (productId: string) => import('./get').then(m => m.getProductReviewStats(productId)),
  getReview: (reviewId: string) => import('./get').then(m => m.getReview(reviewId)),
  getUserReviews: (page?: number, limit?: number, status?: string) => import('./get').then(m => m.getUserReviews(page, limit, status)),
  getReviewsForModeration: (page?: number, limit?: number, status?: string) => import('./get').then(m => m.getReviewsForModeration(page, limit, status)),
  getReviewResponses: (reviewId: string) => import('./get').then(m => m.getReviewResponses(reviewId)),
  getReviewHelpfulVotes: (reviewId: string) => import('./get').then(m => m.getReviewHelpfulVotes(reviewId)),
  canUserReviewProduct: (productId: string) => import('./get').then(m => m.canUserReviewProduct(productId)),
  getTrendingReviews: (page?: number, limit?: number, period?: 'week' | 'month' | 'year') => import('./get').then(m => m.getTrendingReviews(page, limit, period)),
  searchReviews: (query: string, page?: number, limit?: number, filters?: any) => import('./get').then(m => m.searchReviews(query, page, limit, filters)),
  getReviewTemplates: (category?: string) => import('./get').then(m => m.getReviewTemplates(category)),
  getReviewSentiment: (reviewId: string) => import('./get').then(m => m.getReviewSentiment(reviewId)),

  // POST methods
  submitReview: (data: any) => import('./post').then(m => m.submitReview(data)),
  updateReview: (reviewId: string, data: any) => import('./post').then(m => m.updateReview(reviewId, data)),
  deleteReview: (reviewId: string, reason?: string) => import('./post').then(m => m.deleteReview(reviewId, reason)),
  voteReviewHelpful: (reviewId: string, helpful: boolean) => import('./post').then(m => m.voteReviewHelpful(reviewId, helpful)),
  reportReview: (reviewId: string, reason: string, details?: string) => import('./post').then(m => m.reportReview(reviewId, reason, details)),
  addReviewResponse: (reviewId: string, data: any) => import('./post').then(m => m.addReviewResponse(reviewId, data)),
  updateReviewResponse: (responseId: string, content: string) => import('./post').then(m => m.updateReviewResponse(responseId, content)),
  deleteReviewResponse: (responseId: string) => import('./post').then(m => m.deleteReviewResponse(responseId)),
  moderateReview: (reviewId: string, data: any) => import('./post').then(m => m.moderateReview(reviewId, data)),
  bulkModerateReviews: (reviewIds: string[], action: 'approve' | 'reject', reason?: string) => import('./post').then(m => m.bulkModerateReviews(reviewIds, action, reason)),
  requestReview: (data: any) => import('./post').then(m => m.requestReview(data)),
  sendReviewReminder: (requestId: string) => import('./post').then(m => m.sendReviewReminder(requestId)),
  importReviews: (data: any) => import('./post').then(m => m.importReviews(data)),
  generateReviewInsights: (data: any) => import('./post').then(m => m.generateReviewInsights(data))
}