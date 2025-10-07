import type { ApiResponse } from '@/types'
import { validateRequired } from '~/utils/errors'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService({ baseUrl: '/api' })

/**
 * Get secure download URL for order item
 */
export const getDownloadUrl = async (orderItemId: string): Promise<ApiResponse<{ downloadUrl: string }>> => {
  validateRequired(orderItemId, 'Order item ID')
  return baseService.get<{ downloadUrl: string }>(`/downloads/${orderItemId}`)
}