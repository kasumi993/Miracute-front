import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database, Category, ApiResponse } from '@/types/database'
import { createApiResponse, handleSupabaseError } from '../../utils/api/apiResponse'
import { isAdminUser } from '../../utils/security/auth'

export default defineEventHandler(async (event): Promise<ApiResponse<Category[]>> => {
  const supabase = serverSupabaseServiceRole<Database>(event)
  const query = getQuery(event)

  // Try to get user, but don't fail if not authenticated
  let user = null
  try {
    user = await serverSupabaseUser(event)
  } catch {
    // User is not authenticated, which is fine for public endpoints
  }

  // Check if user is admin to determine what categories to show
  const isAdmin = user ? await isAdminUser(user.id, event) : false

  // Get filter parameter
  const filter = query.filter as string || (isAdmin ? 'all' : 'active')

  console.log('Categories API - User:', user?.id, 'isAdmin:', isAdmin, 'filter:', filter)

  try {
    let dbQuery = supabase
      .from('categories')
      .select(`
        *,
        products(count)
      `)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    // Non-admin users or any filter other than 'all' shows only active categories
    if (filter !== 'all' || !isAdmin) {
      dbQuery = dbQuery.eq('is_active', true)
    }

    const { data, error } = await dbQuery

    if (error) {
      handleSupabaseError(error, 'Fetch categories')
    }

    // Process the data to add product_count from the joined products
    const processedData = (data || []).map(category => ({
      ...category,
      product_count: category.products?.[0]?.count || 0,
      products: undefined // Remove the products array from response
    }))

    return createApiResponse(processedData)

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    handleSupabaseError(error, 'Fetch categories')
  }
})
