import { requireAdminAuthentication } from '../../../utils/auth'
import type { Product, ApiResponse } from '@/types'
import { createApiResponse, handleSupabaseError, createApiError } from '../../../utils/apiResponse'

// NOTE: Le type ProductWithCategory (ou ProductWithAdminDetails) doit être utilisé
export default defineEventHandler(async (event): Promise<ApiResponse<Product | null>> => {
  const { supabase } = await requireAdminAuthentication(event)
  const productId = getRouterParam(event, 'id')

  if (!productId) {
    throw createApiError('Product ID is required', 400)
  }

  try {
    // Simplification du SELECT: demander toutes les colonnes + la catégorie
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(
          id,
          name,
          slug
        )
      `)
      .eq('id', productId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createApiResponse(null) // 404 Not found
      }
      handleSupabaseError(error, 'Fetch admin product by ID')
    }

    return createApiResponse(data as Product)

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    handleSupabaseError(error, 'Fetch admin product by ID')
  }
})