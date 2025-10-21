import { serverSupabaseClient } from '#supabase/server'
import type { Database, ApiResponse } from '@/types/database'
import { createApiResponse, createApiError } from '../../utils/api/apiResponse'

// The response will now contain the redirect URL
interface GoogleSignInResponse {
    redirectTo: string
}

export default defineEventHandler(async (event): Promise<ApiResponse<GoogleSignInResponse>> => {
  try {
    const supabase = serverSupabaseClient<Database>(event)
    
    const baseUrl = useRuntimeConfig().public.siteUrl || getRequestURL(event).origin
    const redirectTo = `${baseUrl}/auth/callback`

    // Supabase redirects the user via the `data.url`
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo
      }
    })

    if (error) {
      throw createApiError(error.message, 400)
    }

    // The client will receive this URL and navigate to it
    return createApiResponse({ redirectTo: data.url! }, 'OAuth redirect URL generated.')
  } catch (error: any) {
    if (error.statusCode) { throw error }
    throw createApiError(error.message || 'Failed to initiate Google sign-in.', 500)
  }
})