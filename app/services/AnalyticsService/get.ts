import type { ApiResponse } from '@/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

/**
 * Get website traffic analytics
 */
export const getTrafficAnalytics = async (
  period: 'day' | 'week' | 'month' | 'year' = 'month',
  startDate?: string,
  endDate?: string
): Promise<ApiResponse<{
  pageViews: number
  uniqueVisitors: number
  sessions: number
  bounceRate: number
  avgSessionDuration: number
  topPages: Array<{ path: string; views: number; uniqueViews: number }>
  referrers: Array<{ source: string; visits: number; percentage: number }>
  devices: Array<{ type: string; count: number; percentage: number }>
}>> => {
  const query: any = { period }
  if (startDate) {query.startDate = startDate}
  if (endDate) {query.endDate = endDate}
  return baseService.get('/analytics/traffic', query)
}

/**
 * Get user behavior analytics
 */
export const getUserBehaviorAnalytics = async (
  period: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<ApiResponse<{
  userJourney: Array<{ step: string; users: number; dropOffRate: number }>
  heatmapData: Array<{ page: string; clicks: Array<{ x: number; y: number; count: number }> }>
  scrollDepth: Array<{ page: string; averageDepth: number; fullScrolls: number }>
  timeOnPage: Array<{ page: string; averageTime: number; medianTime: number }>
  exitPages: Array<{ page: string; exits: number; exitRate: number }>
}>> => {
  return baseService.get('/analytics/user-behavior', { period })
}

/**
 * Get e-commerce analytics
 */
export const getEcommerceAnalytics = async (
  period: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<ApiResponse<{
  revenue: number
  orders: number
  averageOrderValue: number
  conversionRate: number
  cartAbandonmentRate: number
  topProducts: Array<{ id: string; name: string; sales: number; revenue: number }>
  paymentMethods: Array<{ method: string; count: number; percentage: number }>
  customerSegments: Array<{ segment: string; count: number; revenue: number }>
}>> => {
  return baseService.get('/analytics/ecommerce', { period })
}

/**
 * Get conversion funnel analytics
 */
export const getConversionFunnel = async (
  funnelType: 'purchase' | 'signup' | 'download' = 'purchase',
  period: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<ApiResponse<{
  totalEntries: number
  overallConversionRate: number
  steps: Array<{
    name: string
    users: number
    conversionRate: number
    dropOffRate: number
    averageTime: number
  }>
}>> => {
  return baseService.get('/analytics/funnel', { funnelType, period })
}

/**
 * Get real-time analytics
 */
export const getRealTimeAnalytics = async (): Promise<ApiResponse<{
  activeUsers: number
  currentPageViews: number
  topActivePages: Array<{ path: string; activeUsers: number }>
  recentEvents: Array<{ event: string; count: number; timestamp: string }>
  liveConversions: number
  serverStatus: { cpu: number; memory: number; responseTime: number }
}>> => {
  return baseService.get('/analytics/realtime')
}

/**
 * Get SEO analytics
 */
export const getSeoAnalytics = async (
  period: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<ApiResponse<{
  organicTraffic: number
  topKeywords: Array<{ keyword: string; clicks: number; impressions: number; ctr: number; position: number }>
  topPages: Array<{ page: string; clicks: number; impressions: number; ctr: number }>
  backlinks: { total: number; newThisMonth: number; topReferrers: Array<{ domain: string; links: number }> }
  searchConsole: { clicks: number; impressions: number; ctr: number; position: number }
}>> => {
  return baseService.get('/analytics/seo', { period })
}

/**
 * Get customer analytics
 */
export const getCustomerAnalytics = async (
  period: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<ApiResponse<{
  newCustomers: number
  returningCustomers: number
  customerLifetimeValue: number
  churnRate: number
  retentionRate: number
  customerSegmentation: Array<{ segment: string; count: number; value: number }>
  geographicDistribution: Array<{ country: string; customers: number; revenue: number }>
}>> => {
  return baseService.get('/analytics/customers', { period })
}

/**
 * Get product analytics
 */
export const getProductAnalytics = async (
  productId?: string,
  period: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<ApiResponse<{
  views: number
  sales: number
  conversionRate: number
  revenue: number
  averageRating: number
  wishlistAdds: number
  cartAdds: number
  shares: number
  reviews: number
}>> => {
  const query: any = { period }
  if (productId) {query.productId = productId}
  return baseService.get('/analytics/products', query)
}

/**
 * Get marketing campaign analytics
 */
export const getCampaignAnalytics = async (
  campaignId?: string,
  period: 'day' | 'week' | 'month' | 'year' = 'month'
): Promise<ApiResponse<{
  impressions: number
  clicks: number
  conversions: number
  cost: number
  revenue: number
  roi: number
  ctr: number
  cpc: number
  cpa: number
  campaigns: Array<{ id: string; name: string; clicks: number; conversions: number; cost: number; roi: number }>
}>> => {
  const query: any = { period }
  if (campaignId) {query.campaignId = campaignId}
  return baseService.get('/analytics/campaigns', query)
}

/**
 * Get custom analytics report
 */
export const getCustomReport = async (
  reportId: string,
  parameters?: Record<string, any>
): Promise<ApiResponse<{
  reportName: string
  generatedAt: string
  data: any
  charts: Array<{ type: string; data: any; config: any }>
}>> => {
  const query = parameters ? { ...parameters } : undefined
  return baseService.get(`/analytics/reports/${reportId}`, query)
}

/**
 * Get analytics dashboard data
 */
export const getDashboardData = async (
  dashboardType: 'overview' | 'ecommerce' | 'marketing' | 'content' = 'overview'
): Promise<ApiResponse<{
  widgets: Array<{
    id: string
    type: string
    title: string
    data: any
    config: any
  }>
  lastUpdated: string
}>> => {
  return baseService.get('/analytics/dashboard', { type: dashboardType })
}
