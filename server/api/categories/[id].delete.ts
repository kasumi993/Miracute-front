import { requireAdminAuthentication } from '../../utils/security/auth'
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
    // First, check if there are any products linked to this category and get the count
    const { count: linkedProductsCount, error: checkError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)

    if (checkError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to check linked products',
        data: checkError
      })
    }

    // If there are linked products, prevent deletion
    if (linkedProductsCount && linkedProductsCount > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete category with linked products',
        data: {
          message: 'This category has products assigned to it. Please move or delete the products first.',
          linkedProductsCount
        }
      })
    }

    // If no linked products, proceed with deletion
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
