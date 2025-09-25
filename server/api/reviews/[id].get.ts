import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)

  // Try multiple ways to get the productId
  let productId = getRouterParam(event, 'id')

  // If that doesn't work, try extracting from URL path
  if (!productId) {
    const url = event.node.req.url
    console.log('Trying to extract productId from URL:', url)
    const matches = url?.match(/\/api\/reviews\/product-([^/?]+)/)
    if (matches) {
      productId = matches[1]
      console.log('Extracted productId from URL:', productId)
    }
  }

  console.log('Reviews API called with productId:', productId)
  console.log('Event URL:', event.node.req.url)

  if (!productId) {
    console.error('No productId found in route params or URL')
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required'
    })
  }

  try {
    // Get reviews for the product with user information
    const { data: reviews, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
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

    // Format reviews for display - keeping all data as fetched
    const formattedReviews = reviews || []

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
