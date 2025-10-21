import { requireAdminAuthentication } from '../../utils/security/auth'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdminAuthentication(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required'
    })
  }

  try {
    // Validate that user exists first
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'User not found'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch user',
        data: fetchError
      })
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update user',
        data: updateError
      })
    }

    return {
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    }

  } catch (error: any) {
    console.error('Error updating user:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update user',
      data: error
    })
  }
})