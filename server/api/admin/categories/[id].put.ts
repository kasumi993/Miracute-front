import { validateAdminAccess } from '../../../utils/adminAuth'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const { supabase } = await validateAdminAccess(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category ID is required'
    })
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update category',
        data: error
      })
    }

    return {
      success: true,
      data
    }

  } catch (error: any) {
    console.error('Error updating category:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update category',
      data: error
    })
  }
})
