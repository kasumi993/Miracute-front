import type { SupabaseClient } from '@supabase/supabase-js'

export interface PageView {
  path: string
  user_id?: string
  session_id: string
  user_agent?: string
  referrer?: string
  ip_address?: string
  created_at?: string
}

export interface BusinessMetrics {
  totalViews: number
  uniqueVisitors: number
  viewsToday: number
  popularPages: Array<{
    path: string
    views: number
  }>
  conversionRate: number
  averageSessionDuration: number
}

export class AnalyticsTracker {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  /**
   * Track a page view
   */
  async trackPageView(data: PageView): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('page_views')
        .insert({
          path: data.path,
          user_id: data.user_id,
          session_id: data.session_id,
          user_agent: data.user_agent,
          referrer: data.referrer,
          ip_address: data.ip_address,
          created_at: data.created_at || new Date().toISOString()
        })

      if (error) {
        console.error('Error tracking page view:', error)
      }
    } catch (error) {
      console.error('Failed to track page view:', error)
    }
  }

  /**
   * Get page views for today
   */
  async getViewsToday(): Promise<number> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const { count, error } = await this.supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())

      if (error) {
        console.error('Error getting views today:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Failed to get views today:', error)
      return 0
    }
  }

  /**
   * Get unique visitors for a time period
   */
  async getUniqueVisitors(days: number = 30): Promise<number> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await this.supabase
        .from('page_views')
        .select('session_id')
        .gte('created_at', startDate.toISOString())

      if (error) {
        console.error('Error getting unique visitors:', error)
        return 0
      }

      const uniqueSessions = new Set(data?.map(view => view.session_id) || [])
      return uniqueSessions.size
    } catch (error) {
      console.error('Failed to get unique visitors:', error)
      return 0
    }
  }

  /**
   * Get popular pages
   */
  async getPopularPages(limit: number = 10, days: number = 30): Promise<Array<{ path: string; views: number }>> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await this.supabase
        .from('page_views')
        .select('path')
        .gte('created_at', startDate.toISOString())

      if (error) {
        console.error('Error getting popular pages:', error)
        return []
      }

      // Count views per page
      const pageViews: Record<string, number> = {}
      data?.forEach(view => {
        pageViews[view.path] = (pageViews[view.path] || 0) + 1
      })

      // Sort and return top pages
      return Object.entries(pageViews)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([path, views]) => ({ path, views }))
    } catch (error) {
      console.error('Failed to get popular pages:', error)
      return []
    }
  }

  /**
   * Calculate conversion rate (orders vs page views)
   */
  async getConversionRate(days: number = 30): Promise<number> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const [viewsResult, ordersResult] = await Promise.all([
        this.supabase
          .from('page_views')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString()),
        this.supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', startDate.toISOString())
          .neq('status', 'cancelled')
      ])

      const totalViews = viewsResult.count || 0
      const totalOrders = ordersResult.count || 0

      if (totalViews === 0) {return 0}
      return (totalOrders / totalViews) * 100
    } catch (error) {
      console.error('Failed to calculate conversion rate:', error)
      return 0
    }
  }

  /**
   * Get comprehensive business metrics
   */
  async getBusinessMetrics(days: number = 30): Promise<BusinessMetrics> {
    try {
      const [
        totalViews,
        uniqueVisitors,
        viewsToday,
        popularPages,
        conversionRate
      ] = await Promise.all([
        this.getTotalViews(days),
        this.getUniqueVisitors(days),
        this.getViewsToday(),
        this.getPopularPages(5, days),
        this.getConversionRate(days)
      ])

      return {
        totalViews,
        uniqueVisitors,
        viewsToday,
        popularPages,
        conversionRate,
        averageSessionDuration: 0 // TODO: Implement session duration tracking
      }
    } catch (error) {
      console.error('Failed to get business metrics:', error)
      return {
        totalViews: 0,
        uniqueVisitors: 0,
        viewsToday: 0,
        popularPages: [],
        conversionRate: 0,
        averageSessionDuration: 0
      }
    }
  }

  /**
   * Get total page views for a time period
   */
  private async getTotalViews(days: number): Promise<number> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { count, error } = await this.supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())

      if (error) {
        console.error('Error getting total views:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('Failed to get total views:', error)
      return 0
    }
  }
}

/**
 * Helper function to create analytics tracker instance
 */
export function createAnalyticsTracker(supabase: SupabaseClient): AnalyticsTracker {
  return new AnalyticsTracker(supabase)
}

/**
 * Generate a session ID for tracking
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Extract relevant data from request headers
 */
export function extractRequestData(request: any) {
  return {
    user_agent: request.headers?.['user-agent'] || '',
    referrer: request.headers?.referer || request.headers?.referrer || '',
    ip_address: request.headers?.['x-forwarded-for']?.split(',')[0] ||
                request.headers?.['x-real-ip'] ||
                request.connection?.remoteAddress ||
                request.socket?.remoteAddress || ''
  }
}
