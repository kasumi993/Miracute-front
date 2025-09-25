import type { ApiResponse } from '@/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

/**
 * Update user profile
 */
export const updateUser = async (updates: any): Promise<ApiResponse<any>> => {
  return baseService.patch<any>('/auth/user', updates)
}
