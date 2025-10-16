import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database, Category, ApiResponse } from '@/types/database'
import { createApiResponse, handleSupabaseError } from '../../utils/apiResponse'
import { isAdminUser } from '../../utils/auth'

export default defineEventHandler(async (event): Promise<ApiResponse<Category[]>> => {
  const supabase = serverSupabaseServiceRole<Database>(event)

  // Try to get user, but don't fail if not authenticated
  let user = null
  try {
    user = await serverSupabaseUser(event)
  } catch {
    // User is not authenticated, which is fine for public endpoints
  }

  // Check if user is admin to determine what categories to show
  const isAdmin = user ? await isAdminUser(user.id) : false

  try {
    let query = supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    // If not admin, only show active categories
    if (!isAdmin) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) {
      handleSupabaseError(error, 'Fetch categories')
    }

    return createApiResponse(data || [])

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    handleSupabaseError(error, 'Fetch categories')
  }
})
