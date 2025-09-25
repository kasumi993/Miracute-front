import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  console.log('Review edit API called')

  const supabase = serverSupabaseServiceRole<Database>(event)
  const user = await serverSupabaseUser(event)
  const reviewId = getRouterParam(event, 'id')
  const body = await readBody(event)

  console.log('Review edit API: reviewId =', reviewId)
  console.log('Review edit API: user =', user?.id)
  console.log('Review edit API: body =', body)

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

  // Validate required fields
  if (!body.rating || body.rating < 1 || body.rating > 5) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Valid rating (1-5) is required'
    })
  }

  try {
    // First, verify the review exists and belongs to the current user
    const { data: existingReview, error: fetchError } = await supabase
      .from('product_reviews')
      .select('id, user_id, product_id, is_editable, edit_deadline, created_at')
      .eq('id', reviewId)
      .single()

    if (fetchError || !existingReview) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Review not found'
      })
    }

    // Check if the review belongs to the current user
    if (existingReview.user_id !== user.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can only edit your own reviews'
      })
    }

    // Check if the review is still editable (within 6-hour window)
    const now = new Date()
    const editDeadline = new Date(existingReview.edit_deadline)

    if (!existingReview.is_editable || now > editDeadline) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Review can no longer be edited. You can add an edit note instead after 6 hours.'
      })
    }

    // Update the review
    const { data: updatedReview, error: updateError } = await supabase
      .from('product_reviews')
      .update({
        rating: body.rating,
        title: body.title?.trim() || null,
        comment: body.comment?.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating review:', updateError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update review'
      })
    }

    return {
      success: true,
      message: 'Review updated successfully',
      review: updatedReview
    }

  } catch (error: any) {
    console.error('Error in review edit API:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update review'
    })
  }
})
