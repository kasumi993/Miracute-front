import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '@/types/database'
import { isAdminUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)
  const user = await serverSupabaseUser(event)
  const reviewId = getRouterParam(event, 'id')

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  // Check if user is admin
  const isAdmin = await isAdminUser(user.id)

  if (!reviewId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Review ID is required'
    })
  }

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  try {
    // First, verify the review exists and belongs to the current user
    const { data: existingReview, error: fetchError } = await supabase
      .from('product_reviews')
      .select('id, user_id, product_id')
      .eq('id', reviewId)
      .single()

    if (fetchError || !existingReview) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Review not found'
      })
    }

    // Check if the review belongs to the current user (unless admin)
    if (!isAdmin && existingReview.user_id !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only delete your own reviews'
      })
    }

    // Delete the review
    const { error: deleteError } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId)

    if (deleteError) {
      console.error('Error deleting review:', deleteError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete review'
      })
    }

    return {
      success: true,
      message: 'Review deleted successfully'
    }

  } catch (error: any) {
    console.error('Error in review delete API:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete review'
    })
  }
})
