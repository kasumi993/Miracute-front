import type { ApiResponse } from '@/types'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService({ baseUrl: '/api' })

export interface OrderAnalytics {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  // ... autres champs d'analyse
}

/**
 * Get order analytics for admin dashboard
 */
export const getOrderAnalytics = async (
  dateFrom?: string,
  dateTo?: string
): Promise<ApiResponse<OrderAnalytics>> => {
  const query: Record<string, string> = {}
  if (dateFrom) {query.dateFrom = dateFrom}
  if (dateTo) {query.dateTo = dateTo}

  return baseService.get<OrderAnalytics>('/admin/orders/analytics', query)
}