import type { DownloadToken, ApiResponse } from '@/types'
import { validateRequired } from '~/utils/errors'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService({ baseUrl: '/api' })

/**
 * Get download tokens for an order
 */
export const getDownloadTokens = async (orderId: string): Promise<ApiResponse<DownloadToken[]>> => {
  validateRequired(orderId, 'Order ID')
  return baseService.get<DownloadToken[]>(`/orders/${orderId}/downloads`)
}

/**
 * Regenerate new download token
 */
export const regenerateDownloadToken = async (
  orderId: string,
  productId: string
): Promise<ApiResponse<DownloadToken>> => {
  validateRequired(orderId, 'Order ID')
  validateRequired(productId, 'Product ID')
  return baseService.post<DownloadToken>(`/orders/${orderId}/regenerate-token`, { productId })
}

/**
 * Track download usage
 */
export const trackDownload = async (token: string): Promise<ApiResponse<{ downloadUrl: string; remainingDownloads: number }>> => {
  validateRequired(token, 'Download token')
  return baseService.post<{ downloadUrl: string; remainingDownloads: number }>(
    '/downloads/track',
    { token }
  )
}