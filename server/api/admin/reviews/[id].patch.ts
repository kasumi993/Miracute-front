import { requireAdminAuthentication } from '../../../utils/auth'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdminAuthentication(event)
  const reviewId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!reviewId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Review ID is required'
    })
  }

  try {
    // Build update object from body
    const updateData: any = {}

    if (typeof body.is_approved === 'boolean') {
      updateData.is_approved = body.is_approved
    }

    if (body.title !== undefined) {
      updateData.title = body.title?.trim() || null
    }

    if (body.comment !== undefined) {
      updateData.comment = body.comment?.trim() || null
    }

    if (body.rating && body.rating >= 1 && body.rating <= 5) {
      updateData.rating = body.rating
    }

    // Add updated timestamp
    updateData.updated_at = new Date().toISOString()

    // Update the review
    const { data: review, error } = await supabase
      .from('product_reviews')
      .update(updateData)
      .eq('id', reviewId)
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
          first_name,
          last_name,
          email
        )
      `)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'Review not found'
        })
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update review',
        data: error
      })
    }

    return {
      success: true,
      message: 'Review updated successfully',
      review
    }

  } catch (error: any) {
    console.error('Error updating review:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update review'
    })
  }
})
