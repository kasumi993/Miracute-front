import { requireAdminAuthentication } from '../../../utils/auth'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdminAuthentication(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Category ID is required'
    })
  }

  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete category',
        data: error
      })
    }

    return {
      success: true,
      message: 'Category deleted successfully'
    }

  } catch (error: any) {
    console.error('Error deleting category:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete category',
      data: error
    })
  }
})
