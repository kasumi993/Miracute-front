/**
 * Review Types
 * Types for product reviews and ratings
 */

import type { Product } from '../catalog/product'
import type { UserProfile } from '../auth/user'

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

export interface ReviewStats {
  averageRating: number
  totalReviews: number
  ratingDistribution: RatingDistribution
  verifiedPurchaseCount: number
}

export interface RatingDistribution {
  1: number
  2: number
  3: number
  4: number
  5: number
}
