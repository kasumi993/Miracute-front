import type { ApiResponse } from '~/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

/**
 * Get current user profile
 */
export const getUser = async (): Promise<ApiResponse<any>> => {
  return baseService.get<any>('/auth/user')
}

/**
 * Check if current user is admin
 */
export const checkAdmin = async (): Promise<ApiResponse<{ isAdmin: boolean }>> => {
  return baseService.get<{ isAdmin: boolean }>('/auth/admin-check')
}