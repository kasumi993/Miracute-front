import type { ApiResponse } from '~/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

/**
 * Create user profile
 */
export const createUserProfile = async (userData: {
  user_id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  role?: 'customer' | 'admin'
}): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/auth/create-user-profile', userData)
}