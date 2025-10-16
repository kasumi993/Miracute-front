import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database, ReviewStats, ApiResponse } from '@/types/database'
import { createApiResponse, createApiError, handleSupabaseError } from '../../../../utils/apiResponse'
import { isAdminUser } from '../../../../utils/auth'

// Helper function to check if string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export default defineEventHandler(async (event): Promise<ApiResponse<ReviewStats>> => {
  const supabase = serverSupabaseServiceRole<Database>(event)
  const identifier = getRouterParam(event, 'id')

  if (!identifier) {
    throw createApiError('Product identifier is required', 400)
  }

  // Try to get user, but don't fail if not authenticated
  let user = null
  try {
    user = await serverSupabaseUser(event)
  } catch {
    // User is not authenticated, which is fine for public endpoints
  }

  // Check if user is admin
  const isAdmin = user ? await isAdminUser(user.id) : false

  try {
    // Determine if the identifier is a UUID (ID) or slug
    const isUUID = isValidUUID(identifier)
    const searchField = isUUID ? 'id' : 'slug'

    // First, get the product to check review_count and average_rating
    let productQuery = supabase
      .from('products')
      .select('id, review_count, average_rating')
      .eq(searchField, identifier)

    // If not admin, only show active products
    if (!isAdmin) {
      productQuery = productQuery.eq('is_active', true)
    }

    const { data: product, error: productError } = await productQuery.single()

    if (productError) {
      if (productError.code === 'PGRST116') {
        return createApiResponse({
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
          }
        })
      }
      handleSupabaseError(productError, 'Fetch product for review stats')
    }

    // If product has no reviews, return zero stats without database query
    if (!product || !product.review_count || product.review_count === 0) {
      return createApiResponse({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
          5: 0
        }
      })
    }

    // If we have reviews, get detailed stats from product_reviews table
    let ratingsQuery = supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', product.id)

    // If not admin, only count approved reviews
    if (!isAdmin) {
      ratingsQuery = ratingsQuery.eq('is_approved', true)
    }

    const { data: ratings, error: ratingsError } = await ratingsQuery

    if (ratingsError) {
      handleSupabaseError(ratingsError, 'Fetch review ratings for stats')
    }

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    let totalRating = 0

    if (ratings && ratings.length > 0) {
      ratings.forEach(review => {
        if (review.rating >= 1 && review.rating <= 5) {
          ratingDistribution[review.rating as keyof typeof ratingDistribution]++
          totalRating += review.rating
        }
      })
    }

    const reviewStats: ReviewStats = {
      totalReviews: ratings?.length || 0,
      averageRating: ratings?.length ? totalRating / ratings.length : 0,
      ratingDistribution
    }

    return createApiResponse(reviewStats)

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    handleSupabaseError(error, 'Fetch product review stats')
  }
})