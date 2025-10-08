import type { ApiResponse } from '@/types/database'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

export interface AnalyticsEventData {
  event: string
  category?: string
  action?: string
  label?: string
  value?: number
  properties?: Record<string, any>
  userId?: string
  sessionId?: string
  timestamp?: string
}

export interface ConversionEventData {
  type: 'purchase' | 'signup' | 'download' | 'lead' | 'custom'
  value?: number
  currency?: string
  productId?: string
  orderId?: string
  campaignId?: string
  properties?: Record<string, any>
}

export interface UserIdentificationData {
  userId: string
  traits?: {
    email?: string
    name?: string
    age?: number
    gender?: string
    location?: string
    plan?: string
    [key: string]: any
  }
}

export interface PageViewData {
  path: string
  title?: string
  referrer?: string
  userId?: string
  sessionId?: string
  properties?: Record<string, any>
}

export interface CustomReportData {
  name: string
  description?: string
  metrics: string[]
  dimensions: string[]
  filters?: Array<{ field: string; operator: string; value: any }>
  dateRange: { start: string; end: string }
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly'
    recipients: string[]
  }
}

/**
 * Track a custom analytics event
 */
export const trackEvent = async (data: AnalyticsEventData): Promise<ApiResponse<{ success: boolean; eventId: string }>> => {
  return baseService.post<{ success: boolean; eventId: string }>('/analytics/events', data)
}

/**
 * Track multiple events in batch
 */
export const trackEventsBatch = async (events: AnalyticsEventData[]): Promise<ApiResponse<{ success: boolean; processed: number; errors: string[] }>> => {
  return baseService.post<{ success: boolean; processed: number; errors: string[] }>('/analytics/events/batch', { events })
}

/**
 * Track page view
 */
export const trackPageView = async (data: PageViewData): Promise<ApiResponse<{ success: boolean; viewId: string }>> => {
  const trackData = {
    event_type: 'page_view',
    page_path: data.path,
    page_title: data.title,
    referrer: data.referrer,
    visitor_id: data.userId,
    session_id: data.sessionId,
    ...data.properties
  }
  return baseService.post<{ success: boolean; viewId: string }>('/analytics/track', trackData)
}

/**
 * Track conversion event
 */
export const trackConversion = async (data: ConversionEventData): Promise<ApiResponse<{ success: boolean; conversionId: string }>> => {
  return baseService.post<{ success: boolean; conversionId: string }>('/analytics/conversions', data)
}

/**
 * Identify user for analytics tracking
 */
export const identifyUser = async (data: UserIdentificationData): Promise<ApiResponse<{ success: boolean; userId: string }>> => {
  return baseService.post<{ success: boolean; userId: string }>('/analytics/identify', data)
}

/**
 * Track user session start
 */
export const startSession = async (data: {
  userId?: string
  sessionId: string
  userAgent?: string
  ip?: string
  referrer?: string
  utm?: Record<string, string>
}): Promise<ApiResponse<{ success: boolean; sessionId: string }>> => {
  return baseService.post<{ success: boolean; sessionId: string }>('/analytics/sessions/start', data)
}

/**
 * Track user session end
 */
export const endSession = async (data: {
  sessionId: string
  duration?: number
  pageViews?: number
  events?: number
}): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>('/analytics/sessions/end', data)
}

/**
 * Create custom analytics report
 */
export const createCustomReport = async (data: CustomReportData): Promise<ApiResponse<{ success: boolean; reportId: string; message: string }>> => {
  return baseService.post<{ success: boolean; reportId: string; message: string }>('/analytics/reports', data)
}

/**
 * Update custom analytics report
 */
export const updateCustomReport = async (reportId: string, data: Partial<CustomReportData>): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>(`/analytics/reports/${reportId}`, data)
}

/**
 * Delete custom analytics report
 */
export const deleteCustomReport = async (reportId: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>(`/analytics/reports/${reportId}/delete`, {})
}

/**
 * Generate and export analytics report
 */
export const exportReport = async (data: {
  type: 'traffic' | 'ecommerce' | 'behavior' | 'custom'
  format: 'csv' | 'pdf' | 'xlsx'
  period: 'day' | 'week' | 'month' | 'year'
  startDate?: string
  endDate?: string
  reportId?: string
  email?: string
}): Promise<ApiResponse<{ success: boolean; downloadUrl: string; expiresAt: string }>> => {
  return baseService.post<{ success: boolean; downloadUrl: string; expiresAt: string }>('/analytics/export', data)
}

/**
 * Set up analytics goal
 */
export const createAnalyticsGoal = async (data: {
  name: string
  type: 'pageview' | 'event' | 'conversion' | 'revenue'
  conditions: Array<{ field: string; operator: string; value: any }>
  value?: number
  active?: boolean
}): Promise<ApiResponse<{ success: boolean; goalId: string; message: string }>> => {
  return baseService.post<{ success: boolean; goalId: string; message: string }>('/analytics/goals', data)
}

/**
 * Update analytics goal
 */
export const updateAnalyticsGoal = async (goalId: string, data: {
  name?: string
  conditions?: Array<{ field: string; operator: string; value: any }>
  value?: number
  active?: boolean
}): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  return baseService.post<{ success: boolean; message: string }>(`/analytics/goals/${goalId}`, data)
}

/**
 * Configure analytics integration
 */
export const configureIntegration = async (data: {
  provider: 'google_analytics' | 'facebook_pixel' | 'hotjar' | 'mixpanel' | 'segment'
  config: Record<string, any>
  active?: boolean
}): Promise<ApiResponse<{ success: boolean; integrationId: string; message: string }>> => {
  return baseService.post<{ success: boolean; integrationId: string; message: string }>('/analytics/integrations', data)
}

/**
 * Test analytics integration
 */
export const testIntegration = async (integrationId: string): Promise<ApiResponse<{ success: boolean; status: string; details: any }>> => {
  return baseService.post<{ success: boolean; status: string; details: any }>(`/analytics/integrations/${integrationId}/test`, {})
}

/**
 * Archive old analytics data
 */
export const archiveAnalyticsData = async (data: {
  beforeDate: string
  keepSummaries?: boolean
  includeRawEvents?: boolean
}): Promise<ApiResponse<{ success: boolean; archivedRecords: number; archiveId: string }>> => {
  return baseService.post<{ success: boolean; archivedRecords: number; archiveId: string }>('/analytics/archive', data)
}

/**
 * Import analytics data from external source
 */
export const importAnalyticsData = async (data: {
  source: string
  format: 'csv' | 'json'
  file: File
  mapping: Record<string, string>
  validateOnly?: boolean
}): Promise<ApiResponse<{ success: boolean; imported: number; errors: string[] }>> => {
  const formData = new FormData()
  formData.append('file', data.file)
  formData.append('source', data.source)
  formData.append('format', data.format)
  formData.append('mapping', JSON.stringify(data.mapping))
  if (data.validateOnly) {formData.append('validateOnly', 'true')}

  return baseService.post<{ success: boolean; imported: number; errors: string[] }>('/analytics/import', formData)
}
