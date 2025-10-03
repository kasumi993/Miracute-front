import type { Product } from '../catalog/product'
import type { UserProfile } from '../auth/user'

/**
 * Review Types
 * Types for product reviews, ratings, and moderation
 */

// --- Options de Tri et Filtres ---

/**
 * Available sorting options for reviews.
 */
export type ReviewSortOption =
  | 'created_at'
  | 'rating'
  | 'helpful_count'
  | 'updated_at'

/**
 * Filtering parameters for retrieving lists of reviews.
 */
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

// --- Modération (Admin) ---

/**
 * Action and data for an administrator moderating a review.
 */
export interface ReviewModerationAction {
  action: 'approve' | 'reject' | 'flag'
  reason?: string // Reason for rejection or flagging
  adminResponse?: string // Public or internal administrator response
}


// --- Revue (Structure de base) ---

/**
 * The standard structure for a product review.
 */
export interface Review {
  id: string
  productId: string
  product: Product
  userId: string
  user: UserProfile
  rating: number
  title?: string
  comment: string
  isVerifiedPurchase: boolean
  isApproved: boolean
  isHelpful: number
  images?: string[]
  adminResponse?: string
  adminResponseDate?: string
  createdAt: string
  updatedAt: string
}

export interface ReviewCreateInput {
  productId: string
  rating: number
  title?: string
  comment: string
  images?: string[]
}

export interface ReviewUpdateInput {
  rating?: number
  title?: string
  comment?: string
  images?: string[]
  isApproved?: boolean
  adminResponse?: string
}

// --- Statistiques ---

/**
 * Numerical distribution of ratings (1 to 5 stars).
 */
export interface RatingDistribution {
  1: number
  2: number
  3: number
  4: number
  5: number
}

/**
 * Statistics aggregated from all product reviews.
 */
export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: RatingDistribution
  verifiedPurchaseCount: number
}