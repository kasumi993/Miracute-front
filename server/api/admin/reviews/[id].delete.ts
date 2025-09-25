import { requireAdminAuthentication } from '../../../utils/auth'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdminAuthentication(event)
  const reviewId = getRouterParam(event, 'id')

  if (!reviewId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Review ID is required'
    })
  }

  try {
    // Delete the review
    const { error } = await supabase
      .from('product_reviews')
      .delete()
      .eq('id', reviewId)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete review',
        data: error
      })
    }

    return {
      success: true,
      message: 'Review deleted successfully'
    }

  } catch (error: any) {
    console.error('Error deleting review:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete review'
    })
  }
})
