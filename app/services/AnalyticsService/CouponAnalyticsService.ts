import { BaseApiService } from '../BaseApiService'
import type { ApiResponse } from '@/types/database'

const baseService = new BaseApiService()

export interface CouponAnalyticsSummary {
  total_usages: number
  total_savings: number
  unique_coupons_used: number
  average_discount: number
}

export interface CouponUsageStats {
  coupon_code: string
  usage_count: number
  total_discount: number
  total_savings: number
}

export interface CouponAnalyticsData {
  period: string
  summary: CouponAnalyticsSummary
  top_coupons: CouponUsageStats[]
  period_start: string
  period_end: string
}

export interface CouponAnalyticsParams {
  period?: '7d' | '30d' | '90d' | '1y'
  limit?: number
}

export const CouponAnalyticsService = {
  async getCouponAnalytics(params?: CouponAnalyticsParams): Promise<ApiResponse<CouponAnalyticsData>> {
    return baseService.get('/analytics/coupons', params)
  }
}