import { requireAdminAuthentication } from "../../../utils/auth"
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdminAuthentication(event)
  const query = getQuery(event)

  // Get pagination parameters
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20
  const offset = (page - 1) * limit

  // Get filter parameters
  const status = query.status as string // 'approved', 'pending', 'all'
  const productId = query.product_id as string
  const rating = query.rating ? parseInt(query.rating as string) : null

  try {
    let queryBuilder = supabase
      .from('product_reviews')
      .select(`
        id,
        rating,
        title,
        comment,
        is_verified_purchase,
        is_approved,
        created_at,
        updated_at,
        product:products (
          id,
          name,
          slug
        ),
        user:users (
          id,
          full_name,
          email
        )
      `, { count: 'exact' })

    // Apply filters
    if (status && status !== 'all') {
      const isApproved = status === 'approved'
      queryBuilder = queryBuilder.eq('is_approved', isApproved)
    }

    if (productId) {
      queryBuilder = queryBuilder.eq('product_id', productId)
    }

    if (rating) {
      queryBuilder = queryBuilder.eq('rating', rating)
    }

    // Apply pagination and ordering
    const { data: reviews, error, count } = await queryBuilder
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch reviews',
        data: error
      })
    }

    // Get review statistics
    const { data: stats, error: statsError } = await supabase
      .from('product_reviews')
      .select('rating, is_approved')

    const reviewStats = {
      total: 0,
      approved: 0,
      pending: 0,
      average_rating: 0,
      rating_breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    }

    if (stats && !statsError) {
      reviewStats.total = stats.length
      reviewStats.approved = stats.filter(r => r.is_approved).length
      reviewStats.pending = stats.filter(r => !r.is_approved).length

      if (stats.length > 0) {
        const totalRating = stats.reduce((sum, review) => sum + review.rating, 0)
        reviewStats.average_rating = Math.round((totalRating / stats.length) * 10) / 10

        stats.forEach(review => {
          reviewStats.rating_breakdown[review.rating as keyof typeof reviewStats.rating_breakdown]++
        })
      }
    }

    return {
      success: true,
      reviews: reviews || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      },
      stats: reviewStats
    }

  } catch (error: any) {
    console.error('Error fetching admin reviews:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch reviews'
    })
  }
})
