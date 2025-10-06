import type { ApiResponse, UserProfile } from '@/types'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService({ baseUrl: '/api' })

/**
 * Get current user profile (calls server/api/users/profile.get.ts)
 */
export const getCurrentProfile = async (): Promise<ApiResponse<{ user: UserProfile }>> => {
  return baseService.get<{ user: UserProfile }>('/users/profile')
}

/**
 * Check if current user is admin (calls server/api/auth/admin-check.ts)
 */
export const checkAdmin = async (): Promise<ApiResponse<{ isAdmin: boolean }>> => {
  return baseService.get<{ isAdmin: boolean }>('/auth/admin-check')
}
