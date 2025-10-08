// Types for analytics and dashboard analytics

export interface AnalyticsMetrics {
  visitors: number
  visitorsChange: number
  pageViews: number
  pageViewsChange: number
  productViews: number
  addToCarts: number
  topPages: Array<{
    url: string
    title: string
    views: number
    uniqueViews: number
  }>
}

export interface AnalyticsDashboardState {
  // Analytics data for dashboard
  metrics: AnalyticsMetrics | null

  // Loading states
  loading: {
    analytics: boolean
  }

  // Error tracking
  error: string | null
}

// Analytics tracking types
export interface AnalyticsEvent {
  event_type: string
  page_path: string
  page_title: string
  visitor_id: string | null
  session_id: string | null
  user_agent?: string
  referrer?: string
  product_id?: string | number
  [key: string]: unknown
}

export interface AnalyticsTrackingState {
  visitorId: string | null
  sessionId: string | null
  isInitialized: boolean
  eventQueue: AnalyticsEvent[]
  isProcessing: boolean
}