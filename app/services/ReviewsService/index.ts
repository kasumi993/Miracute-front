// Export all GET methods
export * from './get'

// Export all POST methods
export * from './post'

// Export all PATCH methods
export * from './patch'

// Export all DELETE methods
export * from './delete'

// Export helpers
export * from './helpers'


// Create a unified ReviewsService object for easier usage
export const ReviewsService = {
  // GET methods
  getProductReviews: (productId: string, filters?: any, pagination?: any) => import('./get').then(m => m.getProductReviews(productId, filters, pagination)),
  getProductReviewStats: (productId: string) => import('./get').then(m => m.getProductReviewStats(productId)),
  getReviewsForModeration: (filters?: any, pagination?: any) => import('./get').then(m => m.getReviewsForModeration(filters, pagination)),

  // POST methods
  submitReview: (reviewData: any, userId?: string) => import('./post').then(m => m.submitReview(reviewData, userId)),
  reportReview: (reviewId: string, reason: string, details?: string) => import('./post').then(m => m.reportReview(reviewId, reason, details)),
  markReviewHelpful: (reviewId: string, isHelpful: boolean) => import('./post').then(m => m.markReviewHelpful(reviewId, isHelpful)),
  createReview: (reviewData: any) => import('./post').then(m => m.createReview(reviewData)),

  // PATCH methods
  updateReview: (reviewId: string, updates: any) => import('./patch').then(m => m.updateReview(reviewId, updates)),
  moderateReview: (reviewId: string, action: any) => import('./patch').then(m => m.moderateReview(reviewId, action)),

  // DELETE methods
  deleteReview: (reviewId: string) => import('./delete').then(m => m.deleteReview(reviewId)),
  bulkDeleteReviews: (reviewIds: string[]) => import('./delete').then(m => m.bulkDeleteReviews(reviewIds)),

}