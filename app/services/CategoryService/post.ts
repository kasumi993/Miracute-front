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
  is_active?: boolean
  sort_order?: number
}): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/categories', categoryData)
}

/**
 * Update an existing category
 */
export const updateCategory = async (id: string, categoryData: {
  name?: string
  slug?: string
  description?: string
  is_active?: boolean
  sort_order?: number
}): Promise<ApiResponse<any>> => {
  return baseService.put<any>(`/categories/${id}`, categoryData)
}

/**
 * Delete a category
 */
export const deleteCategory = async (id: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/categories/${id}`)
}

/**
 * Bulk delete categories
 */
export const bulkDeleteCategories = async (categoryIds: string[]): Promise<ApiResponse<{ deleted: number }>> => {
  return baseService.request<{ deleted: number }>('/categories/bulk-delete', {
    method: 'DELETE',
    body: { ids: categoryIds }
  })
}

/**
 * Delete category image
 */
export const deleteCategoryImage = async (categoryId: string): Promise<ApiResponse<void>> => {
  return baseService.delete<void>(`/admin/categories/${categoryId}/image`)
}

/**
 * Create sample categories (for testing)
 */
export const createSampleCategories = async (): Promise<ApiResponse<void>> => {
  return baseService.post<void>('/categories/sample')
}