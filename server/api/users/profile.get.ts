import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database, User, ApiResponse } from '@/types/database'
import { createApiResponse, createApiError, handleSupabaseError } from '../../utils/api/apiResponse'

export default defineEventHandler(async (event): Promise<ApiResponse<{ user: User | null }>> => {
  try {
    // 1. Authentication Check
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createApiError('Authentication required', 401)
    }

    const supabase = serverSupabaseServiceRole<Database>(event)

    // 2. Fetch User Profile
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116: No rows found (profile doesn't exist yet)
      handleSupabaseError(error, 'Fetch user profile')
    }

    // Return null data if not found (PGRST116), otherwise the user object
    return createApiResponse({ user: data || null })

  } catch (error: any) {
    if (error.statusCode) {
      throw error // Re-throw H3 errors (created by createApiError)
    }
    handleSupabaseError(error, 'Get user operation')
  }
})