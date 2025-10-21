import { serverSupabaseClient } from '#supabase/server'
import type { Database, ApiResponse } from '@/types/database'
import { createApiResponse, createApiError } from '../../utils/api/apiResponse'
import { z } from 'zod'

// Define a simple schema for the request body
const magicLinkSchema = z.object({
  email: z.string().email(),
  // Can optionally pass initial sign-up metadata
  metadata: z.object({
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      marketingOptIn: z.boolean().optional(),
      // Add a flag to indicate if this is a sign-up attempt for internal logic
      isSignUp: z.boolean().optional() 
  }).optional()
})

export default defineEventHandler(async (event): Promise<ApiResponse<null>> => {
  try {
    const body = await readBody(event)
    const validation = magicLinkSchema.safeParse(body)

    if (!validation.success) {
      throw createApiError('Invalid email provided', 400)
    }

    const { email, metadata } = validation.data
    const supabase = serverSupabaseClient<Database>(event)

    // The redirect URL is critical: it must point to the client-side callback page
    const baseUrl = useRuntimeConfig().public.siteUrl || getRequestURL(event).origin
    const redirectTo = `${baseUrl}/auth/callback`
    
    // Transform client metadata keys to Supabase's snake_case user_metadata
    const userData = {
      first_name: metadata?.firstName,
      last_name: metadata?.lastName,
      marketing_opt_in: metadata?.marketingOptIn
    }

    // Use signInWithOtp for both sign-up and sign-in
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: metadata?.isSignUp, // Control sign-up vs sign-in
        data: userData
      }
    })

    if (error) {
      // Supabase error handling logic from previous utils would be used here
      throw createApiError(error.message, 400) 
    }

    return createApiResponse(null, 'Magic link sent. Check your email.')
  } catch (error: any) {
    if (error.statusCode) { throw error }
    throw createApiError(error.message || 'Failed to send magic link.', 500)
  }
})