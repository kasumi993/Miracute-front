import * as ClientService from './ReviewClientService'
import * as AdminService from './ReviewAdminService'
import { getCacheService } from './ReviewClientService'

/**
 * Professional Reviews Service Singleton
 * Aggregates client, admin, and cache functionality.
 */
export const ReviewsService = {
  // --- Client Methods ---
  getProductReviews: ClientService.getProductReviews,
  getProductReviewStats: ClientService.getProductReviewStats,
  submitReview: ClientService.submitReview,
  updateReview: ClientService.updateReview,
  deleteReview: ClientService.deleteReview,
  reportReview: ClientService.reportReview,
  markReviewHelpful: ClientService.markReviewHelpful,

  // --- Admin Methods ---
  getReviewsForModeration: AdminService.getReviewsForModeration,
  moderateReview: AdminService.moderateReview,

  // --- Cache Management (exposed for tools/debugging) ---
  clearStatsCache: (productId: string) => getCacheService().clearCache(productId),
  clearAllCache: () => getCacheService().clearAllCache(),
}