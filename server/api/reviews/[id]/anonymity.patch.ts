import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  console.log('Review anonymity toggle API called')

  const supabase = serverSupabaseServiceRole<Database>(event)
  const user = await serverSupabaseUser(event)
  const reviewId = getRouterParam(event, 'id')
  const body = await readBody(event)

  console.log('Review anonymity API: reviewId =', reviewId)
  console.log('Review anonymity API: user =', user?.id)
  console.log('Review anonymity API: body =', body)

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
  if (typeof body.is_anonymous !== 'boolean') {
    throw createError({
      statusCode: 400,
      statusMessage: 'is_anonymous field is required and must be a boolean'
    })
  }

  try {
    // First, verify the review exists and belongs to the current user
    const { data: existingReview, error: fetchError } = await supabase
      .from('product_reviews')
      .select('id, user_id, is_anonymous')
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
        statusMessage: 'You can only modify your own reviews'
      })
    }

    // Update the anonymity setting
    const { data: updatedReview, error: updateError } = await supabase
      .from('product_reviews')
      .update({
        is_anonymous: body.is_anonymous,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating review anonymity:', updateError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update review anonymity'
      })
    }

    return {
      success: true,
      message: `Review ${body.is_anonymous ? 'made anonymous' : 'made public'}`,
      review: updatedReview
    }

  } catch (error: any) {
    console.error('Error in review anonymity API:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update review anonymity'
    })
  }
})
