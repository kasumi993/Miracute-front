import type { ApiResponse } from '@/types'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

/**
 * Simple TemplateTypeService - matches real API endpoints
 */

/**
 * Get all active template types
 */
export const getTemplateTypes = async (): Promise<ApiResponse<any[]>> => {
  return baseService.get('/template-types')
}

/**
 * Get template type by ID (if endpoint exists)
 */
export const getTemplateType = async (id: string): Promise<ApiResponse<any>> => {
  return baseService.get(`/template-types/${id}`)
}