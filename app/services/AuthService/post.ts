import type { ApiResponse, UserProfile } from '@/types'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService({ baseUrl: '/api/auth' })

interface MagicLinkSignUpData {
  email: string
  firstName?: string
  lastName?: string
  marketingOptIn?: boolean
}

/**
 * Initiates Magic Link sign up/sign in (calls server/api/auth/magic-link.post.ts)
 */
export const sendMagicLink = async (data: {
  email: string
  metadata?: Omit<MagicLinkSignUpData, 'email'> & { isSignUp: boolean }
}): Promise<ApiResponse<null>> => {
  return baseService.post<null>('/magic-link', data)
}

/**
 * Initiates Google OAuth (calls server/api/auth/google.post.ts)
 * Returns the secure redirect URL provided by the server.
 */
export const initiateGoogleSignIn = async (): Promise<ApiResponse<{ redirectTo: string }>> => {
  return baseService.post<{ redirectTo: string }>('/google', {})
}

/**
 * Create user profile (calls server/api/auth/create-user-profile.post.ts)
 * Used internally by the store/initialization process if a profile doesn't exist.
 */
export const createUserProfile = async (userData: {
  user_id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  role?: 'customer' | 'admin'
}): Promise<ApiResponse<{ user: UserProfile }>> => {
  return baseService.post<{ user: UserProfile }>('/create-user-profile', userData)
}
