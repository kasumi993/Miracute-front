import { requireAdminAuthentication } from '../../utils/security/auth'
import type { ApiResponse } from '@/types'
import { createApiResponse, handleSupabaseError, createApiError } from '../../utils/api/apiResponse'

/**
 * Endpoint pour supprimer un produit par son ID.
 */
export default defineEventHandler(async (event): Promise<ApiResponse<null>> => {
  const productId = getRouterParam(event, 'id')

  if (!productId) {
    throw createApiError('Product ID is required', 400)
  }

  // 1. Authentification
  const { supabase } = await requireAdminAuthentication(event)

  try {
    // 2. Suppression du produit
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      handleSupabaseError(error, 'Delete product')
    }
    // Suppression réussie
    return createApiResponse(null, 'Product deleted successfully')

  } catch (error: any) {
    // 3. Gestion centralisée des erreurs
    if (error.statusCode) {
      throw error
    }
    handleSupabaseError(error, 'Delete product')
  }
})