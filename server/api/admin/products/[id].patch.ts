import { requireAdminAuthentication } from '../../../utils/auth'
import type { Product, ApiResponse } from '@/types'
import { createApiResponse, handleSupabaseError, createApiError } from '../../../utils/apiResponse'

// Utiliser Updates<'products'> de votre type Database si possible pour le patch
export default defineEventHandler(async (event): Promise<ApiResponse<Product>> => {
  const { supabase } = await requireAdminAuthentication(event)
  const productId = getRouterParam(event, 'id')

  if (!productId) {
    throw createApiError('Product ID is required', 400)
  }

  const body = await readBody(event) // Lecture du corps pour une mise à jour partielle

  if (!body || Object.keys(body).length === 0) {
    throw createApiError('Request body is required and cannot be empty.', 400)
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .update(body) // Mise à jour partielle (PATCH)
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      handleSupabaseError(error, 'Update product (PATCH)')
    }
    
    if (!data) {
        throw createApiError('Product not found or update failed.', 404)
    }

    return createApiResponse(data as Product, 'Product updated successfully')

  } catch (error: any) {
    if (error.statusCode === 404) {
      throw createApiError('Product not found.', 404)
    }
    if (error.statusCode) {
      throw error
    }
    handleSupabaseError(error, 'Update product (PATCH)')
  }
})