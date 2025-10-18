import type { ApiResponse } from '@/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

/**
 * Create a new category
 */
export const createCategory = async (categoryData: {
  name: string
  slug?: string
  description?: string
  parent_id?: string
  is_active?: boolean
  sort_order?: number
}): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/categories', categoryData)
}

/**
 * Create sample categories (for testing)
 */
export const createSampleCategories = async (): Promise<ApiResponse<void>> => {
  return baseService.post<void>('/categories/sample')
}