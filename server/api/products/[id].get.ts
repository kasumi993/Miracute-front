import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database, ProductWithCategory, ApiResponse } from '@/types/database'
import { createApiResponse, createApiError, handleSupabaseError } from '../../utils/api/apiResponse'
import { isAdminUser } from '../../utils/security/auth'

// Helper function to check if string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export default defineEventHandler(async (event): Promise<ApiResponse<ProductWithCategory | null>> => {
  const supabase = serverSupabaseServiceRole<Database>(event)
  const identifier = getRouterParam(event, 'id')

  if (!identifier) {
    throw createApiError('Product identifier is required', 400)
  }

  // Try to get user, but don't fail if not authenticated
  let user = null
  try {
    user = await serverSupabaseUser(event)
  } catch {
    // User is not authenticated, which is fine for public endpoints
  }

  // Check if user is admin
  const isAdmin = user ? await isAdminUser(user.id, event) : false

  try {
    // Determine if the identifier is a UUID (ID) or slug
    const isUUID = isValidUUID(identifier)
    const searchField = isUUID ? 'id' : 'slug'

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq(searchField, identifier)

    // If not admin, only show active products
    if (!isAdmin) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createApiResponse(null) // Not found
      }
      handleSupabaseError(error, `Fetch product by ${isUUID ? 'ID' : 'slug'}`)
    }

    // Increment view count asynchronously only for non-admin users
    if (data && !isAdmin) {
      supabase.rpc('increment_view_count', { product_id: data.id }).then().catch(console.warn)
    }

    return createApiResponse(data as ProductWithCategory)

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    handleSupabaseError(error, 'Fetch product')
  }
})