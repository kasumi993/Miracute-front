import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database, Review, ApiResponse, SearchResponse } from '@/types/database'
import { createApiResponse, createApiError, handleSupabaseError } from '../../../../utils/api/apiResponse'
import { isAdminUser } from '../../../../utils/security/auth'

// Helper function to check if string is a valid UUID
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export default defineEventHandler(async (event): Promise<ApiResponse<SearchResponse<Review>>> => {
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
  const isAdmin = user ? await isAdminUser(user.id) : false

  // Parse query parameters
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = Math.min(parseInt(query.limit as string) || 20, 100)
  const offset = (page - 1) * limit

  try {
    // Determine if the identifier is a UUID (ID) or slug
    const isUUID = isValidUUID(identifier)
    const searchField = isUUID ? 'id' : 'slug'

    // First, get the product to check review_count
    let productQuery = supabase
      .from('products')
      .select('id, review_count')
      .eq(searchField, identifier)

    // If not admin, only show active products
    if (!isAdmin) {
      productQuery = productQuery.eq('is_active', true)
    }

    const { data: product, error: productError } = await productQuery.single()

    if (productError) {
      if (productError.code === 'PGRST116') {
        return createApiResponse({
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false
          }
        })
      }
      handleSupabaseError(productError, 'Fetch product for reviews')
    }

    // If product has no reviews, return empty result without database query
    if (!product || !product.review_count || product.review_count === 0) {
      return createApiResponse({
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      })
    }

    // If we have reviews, fetch them from product_reviews table
    let reviewsQuery = supabase
      .from('product_reviews')
      .select(`
        *,
        user:users(id, email, first_name, last_name)
      `, { count: 'exact' })
      .eq('product_id', product.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // If not admin, only show approved reviews
    if (!isAdmin) {
      reviewsQuery = reviewsQuery.eq('is_approved', true)
    }

    const { data: reviews, count, error: reviewsError } = await reviewsQuery

    if (reviewsError) {
      handleSupabaseError(reviewsError, 'Fetch product reviews')
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    const searchResponse: SearchResponse<Review> = {
      data: (reviews as Review[]) || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }

    return createApiResponse(searchResponse)

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    handleSupabaseError(error, 'Fetch product reviews')
  }
})