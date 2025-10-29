import { BaseApiService } from '../BaseApiService'
import type { ApiResponse } from '@/types/database'

const baseService = new BaseApiService()

export interface BundleAnalyticsSummary {
  total_sales: number
  total_revenue: number
  total_savings_given: number
  unique_bundles_sold: number
  average_sale_value: number
}

export interface BundleSalesStats {
  bundle_id: string
  bundle_name: string
  sales_count: number
  total_revenue: number
  total_savings: number
}

export interface BundleAnalyticsData {
  period: string
  summary: BundleAnalyticsSummary
  top_bundles: BundleSalesStats[]
  period_start: string
  period_end: string
}

export interface BundleAnalyticsParams {
  period?: '7d' | '30d' | '90d' | '1y'
  limit?: number
}

export const BundleAnalyticsService = {
  async getBundleAnalytics(params?: BundleAnalyticsParams): Promise<ApiResponse<BundleAnalyticsData>> {
    return baseService.get('/analytics/bundles', params)
  }
}