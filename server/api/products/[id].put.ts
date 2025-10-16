import { requireAdminAuthentication } from '../../utils/auth'
import type { Product, ApiResponse, ProductCreateInput } from '@/types'
import { createApiResponse, handleSupabaseError, createApiError } from '../../utils/apiResponse'

// Utiliser ProductCreateInput ou un ProductUpdateInput si vous avez des différences
export default defineEventHandler(async (event): Promise<ApiResponse<Product>> => {
  const { supabase } = await requireAdminAuthentication(event)
  const productId = getRouterParam(event, 'id')

  if (!productId) {
    throw createApiError('Product ID is required', 400)
  }

  const body: ProductCreateInput = await readBody(event)

  if (!body) {
    throw createApiError('Request body is required', 400)
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .update(body) // Mise à jour complète (PUT)
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      handleSupabaseError(error, 'Update product (PUT)')
    }
    
    if (!data) {
        throw createApiError('Product not found or update failed.', 404)
    }

    return createApiResponse(data as Product)

  } catch (error: any) {
    if (error.statusCode === 404) {
      throw createApiError('Product not found.', 404)
    }
    if (error.statusCode) {
      throw error
    }
    handleSupabaseError(error, 'Update product (PUT)')
  }
})