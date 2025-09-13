import { validateAdminAccess } from '../../../utils/adminAuth'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const productId = getRouterParam(event, 'id')

  if (!productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID is required'
    })
  }

  const { supabase } = await validateAdminAccess(event)

  try {
    // Delete the product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete product',
        data: error
      })
    }

    return {
      success: true,
      message: 'Product deleted successfully'
    }

  } catch (error: any) {
    console.error('Error deleting product:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete product',
      data: error
    })
  }
})
