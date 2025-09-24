import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/app/types/database'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)
  const reviewId = getRouterParam(event, 'id')

  if (!reviewId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Review ID is required'
    })
  }

  try {
    // Get edit notes for the review
    const { data: editNotes, error } = await supabase
      .from('review_edit_notes')
      .select(`
        id,
        note,
        note_type,
        created_at,
        user:users (
          first_name,
          last_name,
          email
        )
      `)
      .eq('review_id', reviewId)
      .order('created_at', { ascending: true })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch edit notes',
        data: error
      })
    }

    // Format edit notes for display
    const formattedNotes = editNotes?.map(note => ({
      id: note.id,
      note: note.note,
      note_type: note.note_type,
      created_at: note.created_at,
      user: {
        name: note.user?.first_name && note.user?.last_name
          ? `${note.user.first_name} ${note.user.last_name}`
          : note.user?.first_name || 'Anonymous',
        initials: note.user?.first_name && note.user?.last_name
          ? `${note.user.first_name.charAt(0)}${note.user.last_name.charAt(0)}`.toUpperCase()
          : note.user?.first_name?.charAt(0).toUpperCase() || 'A'
      }
    })) || []

    return {
      success: true,
      editNotes: formattedNotes
    }

  } catch (error: any) {
    console.error('Error fetching edit notes:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch edit notes'
    })
  }
})