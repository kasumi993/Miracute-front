import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database, ProductWithCategory, ApiResponse } from '@/types/database'
import { createApiResponse, createApiError, handleSupabaseError } from '../../utils/apiResponse'

export default defineEventHandler(async (event): Promise<ApiResponse<ProductWithCategory | null>> => {
  const supabase = serverSupabaseServiceRole<Database>(event)
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createApiError('Product slug is required', 400)
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createApiResponse(null) // Not found
      }
      handleSupabaseError(error, 'Fetch product by Slug')
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
    handleSupabaseError(error, 'Fetch product by Slug')
  }
})