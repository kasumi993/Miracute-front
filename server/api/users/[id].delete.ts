import { requireAdminAuthentication } from '../../utils/security/auth'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdminAuthentication(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required'
    })
  }

  try {
    // Delete user (soft delete by setting is_active to false)
    const { error } = await supabase
      .from('users')
      .update({ is_active: false, deleted_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete user',
        data: error
      })
    }

    return {
      success: true,
      message: 'User deleted successfully'
    }

  } catch (error: any) {
    console.error('Error deleting user:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete user',
      data: error
    })
  }
})