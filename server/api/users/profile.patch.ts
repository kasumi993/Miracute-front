import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database, User, ApiResponse } from '@/types/database'
import { createApiResponse, createApiError, handleSupabaseError } from '../../utils/api/apiResponse'
import { userProfileSchema, validateFormData } from '~/utils/validation'

export default defineEventHandler(async (event): Promise<ApiResponse<User | null>> => {
  try {
    // 1. Authentication Check
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createApiError('Authentication required', 401)
    }

    const supabase = serverSupabaseServiceRole<Database>(event)
    const body = await readBody(event)

    // 2. Get current user profile to check existing data
    const { data: currentUser, error: fetchError } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      handleSupabaseError(fetchError, 'Fetch current user profile')
    }

    // 3. Validate input data
    const validation = validateFormData(userProfileSchema, body)
    if (!validation.success) {
      throw createApiError('Invalid input data', 400)
    }

    // 4. Business rule: Once first_name/last_name are set, they cannot be emptied
    if (currentUser) {
      if (currentUser.first_name && (!validation.data.first_name || validation.data.first_name.trim() === '')) {
        throw createApiError('First name cannot be removed once set', 400)
      }
      if (currentUser.last_name && (!validation.data.last_name || validation.data.last_name.trim() === '')) {
        throw createApiError('Last name cannot be removed once set', 400)
      }
    }

    // 5. Update user profile in database
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

    return createApiResponse({ user: data as User })

  } catch (error: any) {
    if (error.statusCode) {
      throw error // Re-throw H3 errors (created by createApiError)
    }
    handleSupabaseError(error, 'User profile update operation')
  }
})