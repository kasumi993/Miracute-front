import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database, ProductWithCategory, ApiResponse } from '@/types/database'
import { createApiResponse, createApiError, handleSupabaseError } from '../../utils/apiResponse'

export default defineEventHandler(async (event): Promise<ApiResponse<ProductWithCategory | null>> => {
  const supabase = serverSupabaseServiceRole<Database>(event)
  const productId = getRouterParam(event, 'id')

  if (!productId) {
    throw createApiError('Product ID is required', 400)
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        review_count:reviews(count),
        average_rating:reviews(average_rating:avg(rating))
      `)
      .eq('id', productId)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createApiResponse(null) // Not found
      }
      handleSupabaseError(error, 'Fetch product by ID')
    }

    // Increment view count asynchronously
    if (data) {
      supabase.rpc('increment_view_count', { product_id: data.id }).then().catch(console.warn)
    }

    return createApiResponse(data as ProductWithCategory)

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    handleSupabaseError(error, 'Fetch product by ID')
  }
})