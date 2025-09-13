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

  const body = await readBody(event)
  const { supabase } = await validateAdminAccess(event)

  try {
    // Update the product
    const { data, error } = await supabase
      .from('products')
      .update(body)
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update product',
        data: error
      })
    }

    return {
      success: true,
      data,
      message: 'Product updated successfully'
    }

  } catch (error: any) {
    console.error('Error updating product:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update product',
      data: error
    })
  }
})
