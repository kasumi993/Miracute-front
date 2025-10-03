import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database, User, ApiResponse } from '@/types/database'
import { createApiResponse, createApiError, handleSupabaseError } from '../../utils/apiResponse'
import { userProfileSchema, validateFormData } from '~/utils/validation'

export default defineEventHandler(async (event): Promise<ApiResponse<User | null>> => {
  try {
    // 1. Authentication Check
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createApiError('Authentication required', 401) // Use createApiError for consistency
    }

    const supabase = serverSupabaseServiceRole<Database>(event)
    const method = getMethod(event)

    // 2. GET Logic: Fetch User Profile
    if (method === 'GET') {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id) // user is guaranteed to exist
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116: No rows found (profile doesn't exist yet)
        handleSupabaseError(error, 'Fetch user profile')
      }

      // Return null data if not found (PGRST116), otherwise the user object
      return createApiResponse(data || null)
    }

    // 3. PATCH Logic: Update User Profile
    if (method === 'PATCH') {
      const body = await readBody(event)

      const validation = validateFormData(userProfileSchema, body)
      if (!validation.success) {
        throw createApiError('Invalid input data', 400) // Throw the error directly
      }

      // Note: Supabase RLS is important here to ensure the user can only update their own profile.
      const { data, error } = await supabase
        .from('users')
        .update({
          ...validation.data,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'Update user profile')
      }

      return createApiResponse(data as User)
    }

    throw createApiError('Method not allowed', 405)

  } catch (error: any) {
    if (error.statusCode) {
      throw error // Re-throw H3 errors (created by createApiError)
    }
    handleSupabaseError(error, 'User API operation')
  }
})