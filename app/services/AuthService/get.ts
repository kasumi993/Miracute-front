import type { ApiResponse, UserProfile } from '@/types'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService({ baseUrl: '/api/auth' })

/**
 * Get current user profile (calls server/api/auth/user.ts GET)
 */
export const getCurrentProfile = async (): Promise<ApiResponse<{ user: UserProfile }>> => {
  return baseService.get<{ user: UserProfile }>('/user')
}

/**
 * Check if current user is admin (calls server/api/auth/admin-check.ts)
 */
export const checkAdmin = async (): Promise<ApiResponse<{ isAdmin: boolean }>> => {
  // NOTE: Assuming you have a separate backend endpoint for admin checking
  return baseService.get<{ isAdmin: boolean }>('/admin-check')
}
