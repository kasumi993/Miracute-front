import type { ApiResponse } from '@/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

/**
 * Get all categories
 */
export const getCategories = async (filter: 'active' | 'all' = 'active'): Promise<ApiResponse<any[]>> => {
  const query = filter === 'all' ? { filter: 'all' } : { filter: 'active' }
  return baseService.get<any[]>('/categories', query)
}

/**
 * Get single category by ID
 */
export const getCategory = async (categoryId: string): Promise<ApiResponse<any>> => {
  return baseService.get<any>(`/categories/${categoryId}`)
}

/**
 * Get category by slug
 */
export const getCategoryBySlug = async (slug: string): Promise<ApiResponse<any>> => {
  return baseService.get<any>(`/categories/slug/${slug}`)
}

/**
 * Search categories
 */
export const searchCategories = async (query: string, page?: number, limit?: number): Promise<ApiResponse<any[]>> => {
  const params: any = { q: query }
  if (page) params.page = page
  if (limit) params.limit = limit
  return baseService.get<any[]>('/categories/search', params)
}