import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database, User, ApiResponse } from '~/types/database'
import { createApiResponse, createApiError, handleSupabaseError } from '../../utils/apiResponse'
import { userProfileSchema, validateFormData } from '~/utils/validation'

export default defineEventHandler(async (event): Promise<ApiResponse<User | null>> => {
  try {
    const user = await serverSupabaseUser(event)

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const supabase = serverSupabaseServiceRole<Database>(event)
    const method = getMethod(event)

    if (method === 'GET') {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        handleSupabaseError(error, 'Fetch user profile')
      }

      return createApiResponse({ user: data || null })
    }

    if (method === 'PATCH') {
      const body = await readBody(event)

      // Validate input data
      const validation = validateFormData(userProfileSchema, body)
      if (!validation.success) {
        createApiError('Invalid input data', 400)
      }

      const { data, error } = await supabase
        .from('users')
        .update({
          ...validation.data,
          updated_at: new Date().toISOString()
        })
        .eq('id', user!.id)
        .select()
        .single()

      if (error) {
        handleSupabaseError(error, 'Update user profile')
      }

      return createApiResponse({ user: data as User })
    }

    createApiError('Method not allowed', 405)

  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    handleSupabaseError(error, 'User API operation')
  }
})
