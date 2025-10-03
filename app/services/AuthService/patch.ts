import type { ApiResponse, UserProfile } from '@/types'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService({ baseUrl: '/api/auth' })

/**
 * Update user profile (calls server/api/auth/user.ts PATCH)
 */
export const updateProfile = async (updates: Record<string, any>): Promise<ApiResponse<{ user: UserProfile }>> => {
  return baseService.patch<{ user: UserProfile }>('/user', updates)
}
