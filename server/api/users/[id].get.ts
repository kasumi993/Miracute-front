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
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        throw createError({
          statusCode: 404,
          statusMessage: 'User not found'
        })
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch user',
        data: error
      })
    }

    return {
      success: true,
      data: user
    }

  } catch (error: any) {
    console.error('Error fetching user:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch user',
      data: error
    })
  }
})