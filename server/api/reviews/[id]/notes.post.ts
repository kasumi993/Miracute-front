import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/app/types/database'

export default defineEventHandler(async (event) => {
  console.log('Review edit note API called')

  const supabase = serverSupabaseServiceRole<Database>(event)
  const user = await serverSupabaseUser(event)
  const reviewId = getRouterParam(event, 'id')
  const body = await readBody(event)

  console.log('Review edit note API: reviewId =', reviewId)
  console.log('Review edit note API: user =', user?.id)
  console.log('Review edit note API: body =', body)

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
  if (!body.note || !body.note.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Note content is required'
    })
  }

  if (!body.note_type || !['edit', 'clarification', 'update'].includes(body.note_type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Valid note type is required (edit, clarification, update)'
    })
  }

  try {
    // First, verify the review exists and belongs to the current user
    const { data: existingReview, error: fetchError } = await supabase
      .from('product_reviews')
      .select('id, user_id, is_editable, edit_deadline')
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
        statusMessage: 'You can only add notes to your own reviews'
      })
    }

    // Check if the edit window has passed (notes are only allowed after 6 hours)
    const now = new Date()
    const editDeadline = new Date(existingReview.edit_deadline)

    if (existingReview.is_editable && now <= editDeadline) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You can still edit this review directly. Edit notes are only available after the 6-hour edit window.'
      })
    }

    // Create the edit note
    const { data: editNote, error: insertError } = await supabase
      .from('review_edit_notes')
      .insert({
        review_id: reviewId,
        user_id: user.id,
        note: body.note.trim(),
        note_type: body.note_type
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating edit note:', insertError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create edit note'
      })
    }

    return {
      success: true,
      message: 'Edit note added successfully',
      editNote: editNote
    }

  } catch (error: any) {
    console.error('Error in review edit note API:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add edit note'
    })
  }
})