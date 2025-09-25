import type { ApiResponse } from '@/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

export interface CategoryData {
  name: string
  slug?: string
  description?: string
  parentId?: string
  image?: File | string
  icon?: File | string
  isActive?: boolean
  isFeatured?: boolean
  sortOrder?: number
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
  customFields?: Record<string, any>
}

export interface CategorySeoData {
  metaTitle: string
  metaDescription: string
  metaKeywords: string[]
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
}

export interface CategoryReorderData {
  categoryId: string
  newPosition: number
  parentId?: string
}

/**
 * Create a new category
 */
export const createCategory = async (data: CategoryData): Promise<ApiResponse<{ success: boolean; categoryId: string; message: string }>> => {
  const formData = new FormData()

  // Add text fields
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'image' && key !== 'icon' && value !== undefined) {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value))
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, value.toString())
      }
    }
  })

  // Add files
  if (data.image instanceof File) {
    formData.append('image', data.image)
  }
  if (data.icon instanceof File) {
    formData.append('icon', data.icon)
  }

  return baseService.post<{ success: boolean; categoryId: string; message: string }>('/categories', formData)
}

/**
 * Update an existing category
 */
export const updateCategory = async (categoryId: string, data: Partial<CategoryData>): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  const formData = new FormData()

  // Add text fields
  Object.entries(data).forEach(([key, value]) => {
    if (key !== 'image' && key !== 'icon' && value !== undefined) {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value))
      } else if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, value.toString())
      }
    }
  })

  // Add files
  if (data.image instanceof File) {
    formData.append('image', data.image)
  }
  if (data.icon instanceof File) {
    formData.append('icon', data.icon)
  }

  return baseService.post<{ success: boolean; message: string }>(`/categories/${categoryId}`, formData)
}

/**
 * Delete a category
 */
export const deleteCategory = async (categoryId: string, moveProductsTo?: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  const data: any = {}
  if (moveProductsTo) {data.moveProductsTo = moveProductsTo}
  return baseService.post<{ success: boolean; message: string }>(`/categories/${categoryId}/delete`, data)
}

/**
 * Move category to different parent
 */
export const moveCategory = async (categoryId: string, newParentId?: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>(`/categories/${categoryId}/move`, { newParentId })
}

/**
 * Reorder categories
 */
export const reorderCategories = async (reorderData: CategoryReorderData[]): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>('/categories/reorder', { categories: reorderData })
}

/**
 * Toggle category active status
 */
export const toggleCategoryStatus = async (categoryId: string, isActive: boolean): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>(`/categories/${categoryId}/toggle-status`, { isActive })
}

/**
 * Toggle category featured status
 */
export const toggleCategoryFeatured = async (categoryId: string, isFeatured: boolean): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>(`/categories/${categoryId}/toggle-featured`, { isFeatured })
}

/**
 * Bulk update categories
 */
export const bulkUpdateCategories = async (data: {
  categoryIds: string[]
  updates: {
    isActive?: boolean
    isFeatured?: boolean
    parentId?: string
    tags?: string[]
  }
}): Promise<ApiResponse<{ success: boolean; updated: number; errors: string[] }>> => {
  return baseService.post<{ success: boolean; updated: number; errors: string[] }>('/categories/bulk-update', data)
}

/**
 * Duplicate a category
 */
export const duplicateCategory = async (categoryId: string, data: {
  name: string
  slug?: string
  includeProducts?: boolean
  includeSubcategories?: boolean
}): Promise<ApiResponse<{ success: boolean; newCategoryId: string; message: string }>> => {
  return baseService.post<{ success: boolean; newCategoryId: string; message: string }>(`/categories/${categoryId}/duplicate`, data)
}

/**
 * Update category SEO data
 */
export const updateCategorySeo = async (categoryId: string, data: CategorySeoData): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>(`/categories/${categoryId}/seo`, data)
}

/**
 * Import categories from CSV/file
 */
export const importCategories = async (data: {
  file: File
  format: 'csv' | 'json' | 'xlsx'
  mapping: Record<string, string>
  updateExisting?: boolean
  createHierarchy?: boolean
}): Promise<ApiResponse<{ success: boolean; imported: number; updated: number; errors: string[] }>> => {
  const formData = new FormData()
  formData.append('file', data.file)
  formData.append('format', data.format)
  formData.append('mapping', JSON.stringify(data.mapping))
  if (data.updateExisting) {formData.append('updateExisting', 'true')}
  if (data.createHierarchy) {formData.append('createHierarchy', 'true')}

  return baseService.post<{ success: boolean; imported: number; updated: number; errors: string[] }>('/categories/import', formData)
}

/**
 * Export categories to file
 */
export const exportCategories = async (data: {
  format: 'csv' | 'json' | 'xlsx'
  includeSubcategories?: boolean
  includeStats?: boolean
  categoryIds?: string[]
}): Promise<ApiResponse<{ success: boolean; downloadUrl: string; expiresAt: string }>> => {
  return baseService.post<{ success: boolean; downloadUrl: string; expiresAt: string }>('/categories/export', data)
}

/**
 * Merge categories
 */
export const mergeCategories = async (data: {
  sourceCategoryIds: string[]
  targetCategoryId: string
  mergeProducts?: boolean
  mergeSubcategories?: boolean
  deleteSourceCategories?: boolean
}): Promise<ApiResponse<{ success: boolean; mergedProducts: number; mergedSubcategories: number; message: string }>> => {
  return baseService.post<{ success: boolean; mergedProducts: number; mergedSubcategories: number; message: string }>('/categories/merge', data)
}

/**
 * Generate category suggestions based on products
 */
export const generateCategorySuggestions = async (data: {
  productIds?: string[]
  useAI?: boolean
  maxSuggestions?: number
}): Promise<ApiResponse<{ suggestions: Array<{ name: string; description: string; confidence: number; parentCategory?: string }> }>> => {
  return baseService.post<{ suggestions: Array<{ name: string; description: string; confidence: number; parentCategory?: string }> }>('/categories/suggestions', data)
}

/**
 * Optimize category structure
 */
export const optimizeCategoryStructure = async (data: {
  maxDepth?: number
  minProductsPerCategory?: number
  autoMergeEmptyCategories?: boolean
  suggestions?: boolean
}): Promise<ApiResponse<{
  success: boolean
  optimizations: Array<{ type: string; description: string; impact: string }>
  autoApplied: number
  suggestions: Array<{ action: string; categoryId: string; description: string }>
}>> => {
  return baseService.post<{
    success: boolean
    optimizations: Array<{ type: string; description: string; impact: string }>
    autoApplied: number
    suggestions: Array<{ action: string; categoryId: string; description: string }>
  }>('/categories/optimize', data)
}
