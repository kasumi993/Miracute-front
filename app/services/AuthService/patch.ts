import type { ApiResponse, UserProfile } from '@/types'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService({ baseUrl: '/api' })

/**
 * Update user profile (calls server/api/users/profile.patch.ts)
 */
export const updateProfile = async (updates: Record<string, any>): Promise<ApiResponse<{ user: UserProfile }>> => {
  return baseService.patch<{ user: UserProfile }>('/users/profile', updates)
}
