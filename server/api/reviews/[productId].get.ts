import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/app/types/database'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)
  const productId = getRouterParam(event, 'productId')

  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required'
    })
  }

  try {
    // Get reviews for the product with user information
    const { data: reviews, error } = await supabase
      .from('product_reviews')
      .select(`
        id,
        rating,
        title,
        comment,
        is_verified_purchase,
        is_approved,
        created_at,
        user:users (
          first_name,
          last_name,
          email
        )
      `)
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch reviews',
        data: error
      })
    }

    // Calculate review statistics
    const stats = {
      total_reviews: reviews?.length || 0,
      average_rating: 0,
      rating_breakdown: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0
      }
    }

    if (reviews && reviews.length > 0) {
      // Calculate average rating
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
      stats.average_rating = Math.round((totalRating / reviews.length) * 10) / 10

      // Count ratings by star level
      reviews.forEach(review => {
        stats.rating_breakdown[review.rating as keyof typeof stats.rating_breakdown]++
      })
    }

    // Format reviews for display (hide email, show initials only)
    const formattedReviews = reviews?.map(review => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      is_verified_purchase: review.is_verified_purchase,
      created_at: review.created_at,
      user: {
        name: review.user?.first_name && review.user?.last_name
          ? `${review.user.first_name} ${review.user.last_name}`
          : review.user?.first_name || 'Anonymous',
        initials: review.user?.first_name && review.user?.last_name
          ? `${review.user.first_name.charAt(0)}${review.user.last_name.charAt(0)}`.toUpperCase()
          : review.user?.first_name?.charAt(0).toUpperCase() || 'A'
      }
    })) || []

    return {
      success: true,
      reviews: formattedReviews,
      stats
    }

  } catch (error: any) {
    console.error('Error fetching reviews:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch reviews'
    })
  }
})
