import { defineStore } from 'pinia'
import { AnalyticsService } from '~/services'

export interface PageView {
  id: string
  url: string
  title: string
  referrer: string | null
  timestamp: number
  sessionId: string
  userId?: string
  duration?: number
  metadata?: Record<string, any>
}

export interface UserEvent {
  id: string
  type: 'click' | 'scroll' | 'form_submit' | 'search' | 'purchase' | 'add_to_cart' | 'remove_from_cart' | 'wishlist_add' | 'custom'
  element?: string
  value?: string | number
  metadata?: Record<string, any>
  timestamp: number
  sessionId: string
  userId?: string
  pageUrl: string
}

export interface UserSession {
  id: string
  userId?: string
  startTime: number
  endTime?: number
  pageViews: PageView[]
  events: UserEvent[]
  device: {
    type: 'desktop' | 'mobile' | 'tablet'
    browser: string
    os: string
    screenResolution: string
  }
  location?: {
    country: string
    city: string
    timezone: string
  }
  utmParams?: {
    source?: string
    medium?: string
    campaign?: string
    content?: string
    term?: string
  }
}

export interface ConversionFunnel {
  step: string
  name: string
  users: number
  conversionRate: number
  dropOffRate: number
}

export interface AnalyticsMetrics {
  pageViews: {
    total: number
    unique: number
    bounceRate: number
    averageSessionDuration: number
  }
  userBehavior: {
    newUsers: number
    returningUsers: number
    totalSessions: number
    averagePageViews: number
  }
  ecommerce: {
    totalRevenue: number
    conversionRate: number
    averageOrderValue: number
    cartAbandonmentRate: number
  }
  topPages: Array<{
    url: string
    title: string
    views: number
    uniqueViews: number
    averageDuration: number
  }>
  topReferrers: Array<{
    source: string
    visits: number
    conversionRate: number
  }>
  conversionFunnel: ConversionFunnel[]
}

interface AnalyticsState {
  // Current session
  currentSession: UserSession | null
  sessionId: string | null

  // Event queue for batch sending
  eventQueue: UserEvent[]
  pageViewQueue: PageView[]

  // Analytics data
  metrics: AnalyticsMetrics | null
  realtimeUsers: number

  // User tracking
  userId: string | null
  isTrackingEnabled: boolean
  cookieConsent: boolean

  // Performance tracking
  performanceMetrics: {
    pageLoadTime: number
    firstContentfulPaint: number
    largestContentfulPaint: number
    cumulativeLayoutShift: number
  } | null

  // Heatmap and behavior data
  scrollDepth: number
  timeOnPage: number
  pageStartTime: number

  // Loading states
  loading: {
    metrics: boolean
    sending: boolean
  }

  // Configuration
  config: {
    enableAutoTracking: boolean
    enableEcommerce: boolean
    enableHeatmaps: boolean
    batchSize: number
    flushInterval: number
    cookieDomain: string
  }

  // Error tracking
  error: string | null
  lastFlush: number | null
}

export const useAnalyticsStore = defineStore('analytics', {
  state: (): AnalyticsState => ({
    currentSession: null,
    sessionId: null,

    eventQueue: [],
    pageViewQueue: [],

    metrics: null,
    realtimeUsers: 0,

    userId: null,
    isTrackingEnabled: true,
    cookieConsent: false,

    performanceMetrics: null,

    scrollDepth: 0,
    timeOnPage: 0,
    pageStartTime: 0,

    loading: {
      metrics: false,
      sending: false
    },

    config: {
      enableAutoTracking: true,
      enableEcommerce: true,
      enableHeatmaps: false,
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      cookieDomain: ''
    },

    error: null,
    lastFlush: null
  }),

  getters: {
    // Session info
    hasActiveSession: (state) => !!state.currentSession && !!state.sessionId,

    sessionDuration: (state) => {
      if (!state.currentSession) return 0
      const endTime = state.currentSession.endTime || Date.now()
      return endTime - state.currentSession.startTime
    },

    // Queue management
    hasQueuedEvents: (state) => state.eventQueue.length > 0 || state.pageViewQueue.length > 0,

    queueSize: (state) => state.eventQueue.length + state.pageViewQueue.length,

    shouldFlushQueue: (state) => {
      if (!state.hasQueuedEvents) return false

      const sizeLimitReached = state.queueSize >= state.config.batchSize
      const timeoutReached = state.lastFlush &&
        Date.now() - state.lastFlush > state.config.flushInterval

      return sizeLimitReached || timeoutReached || false
    },

    // Tracking status
    canTrack: (state) => state.isTrackingEnabled && state.cookieConsent,

    // Performance metrics
    hasPerformanceData: (state) => !!state.performanceMetrics,

    isPageLoadFast: (state) => {
      if (!state.performanceMetrics) return null
      return state.performanceMetrics.pageLoadTime < 2000 // Under 2 seconds
    },

    // Behavior metrics
    currentPageTimeSpent: (state) => {
      if (!state.pageStartTime) return 0
      return Date.now() - state.pageStartTime
    },

    isLongSession: (state) => state.sessionDuration > 300000, // 5 minutes

    // Loading states
    isLoading: (state) => Object.values(state.loading).some(loading => loading)
  },

  actions: {
    // Initialization
    initialize(config?: Partial<AnalyticsState['config']>) {
      if (config) {
        this.config = { ...this.config, ...config }
      }

      this.checkCookieConsent()

      if (this.canTrack) {
        this.startSession()
        this.setupAutoTracking()
        this.startPerformanceTracking()
      }
    },

    // Cookie consent management
    checkCookieConsent() {
      if (process.client) {
        const consent = localStorage.getItem('analytics_consent')
        this.cookieConsent = consent === 'true'
      }
    },

    setCookieConsent(consent: boolean) {
      this.cookieConsent = consent

      if (process.client) {
        localStorage.setItem('analytics_consent', consent.toString())
      }

      if (consent && this.isTrackingEnabled) {
        this.startSession()
        this.setupAutoTracking()
      } else if (!consent) {
        this.stopTracking()
      }
    },

    // Session management
    startSession() {
      if (!this.canTrack) return

      const sessionId = this.generateSessionId()
      this.sessionId = sessionId

      const session: UserSession = {
        id: sessionId,
        userId: this.userId || undefined,
        startTime: Date.now(),
        pageViews: [],
        events: [],
        device: this.getDeviceInfo(),
        location: this.getLocationInfo(),
        utmParams: this.getUtmParams()
      }

      this.currentSession = session
      this.pageStartTime = Date.now()
    },

    endSession() {
      if (this.currentSession) {
        this.currentSession.endTime = Date.now()
        this.flushQueue()
      }
    },

    setUserId(userId: string | null) {
      this.userId = userId

      if (this.currentSession) {
        this.currentSession.userId = userId || undefined
      }
    },

    // Page tracking
    trackPageView(url?: string, title?: string, referrer?: string) {
      if (!this.canTrack || !this.sessionId) return

      const pageView: PageView = {
        id: this.generateEventId(),
        url: url || (process.client ? window.location.href : ''),
        title: title || (process.client ? document.title : ''),
        referrer: referrer || (process.client ? document.referrer : null),
        timestamp: Date.now(),
        sessionId: this.sessionId,
        userId: this.userId || undefined
      }

      this.pageViewQueue.push(pageView)

      if (this.currentSession) {
        this.currentSession.pageViews.push(pageView)
      }

      this.pageStartTime = Date.now()
      this.timeOnPage = 0
      this.scrollDepth = 0

      this.checkFlushQueue()
    },

    // Event tracking
    trackEvent(
      type: UserEvent['type'],
      element?: string,
      value?: string | number,
      metadata?: Record<string, any>
    ) {
      if (!this.canTrack || !this.sessionId) return

      const event: UserEvent = {
        id: this.generateEventId(),
        type,
        element,
        value,
        metadata,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        userId: this.userId || undefined,
        pageUrl: process.client ? window.location.href : ''
      }

      this.eventQueue.push(event)

      if (this.currentSession) {
        this.currentSession.events.push(event)
      }

      this.checkFlushQueue()
    },

    // Specific tracking methods
    trackClick(element: string, metadata?: Record<string, any>) {
      this.trackEvent('click', element, undefined, metadata)
    },

    trackScroll(depth: number) {
      if (depth > this.scrollDepth) {
        this.scrollDepth = depth
        this.trackEvent('scroll', undefined, depth, { scrollDepth: depth })
      }
    },

    trackSearch(query: string, results?: number) {
      this.trackEvent('search', undefined, query, {
        query,
        resultsCount: results
      })
    },

    trackFormSubmit(formName: string, success: boolean, errors?: string[]) {
      this.trackEvent('form_submit', formName, success ? 'success' : 'error', {
        success,
        errors
      })
    },

    // E-commerce tracking
    trackPurchase(orderId: string, revenue: number, items: any[]) {
      this.trackEvent('purchase', undefined, revenue, {
        orderId,
        revenue,
        items,
        currency: 'USD'
      })
    },

    trackAddToCart(productId: string, productName: string, price: number, quantity: number) {
      this.trackEvent('add_to_cart', productId, price, {
        productId,
        productName,
        price,
        quantity
      })
    },

    trackRemoveFromCart(productId: string, productName: string) {
      this.trackEvent('remove_from_cart', productId, undefined, {
        productId,
        productName
      })
    },

    trackWishlistAdd(productId: string, productName: string) {
      this.trackEvent('wishlist_add', productId, undefined, {
        productId,
        productName
      })
    },

    // Custom event tracking
    trackCustomEvent(eventName: string, properties?: Record<string, any>) {
      this.trackEvent('custom', eventName, undefined, {
        eventName,
        ...properties
      })
    },

    // Performance tracking
    startPerformanceTracking() {
      if (!process.client || !this.canTrack) return

      // Track page load performance
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.trackPerformanceMetrics()
        }, 100)
      })

      // Track user interactions
      this.setupInteractionTracking()
    },

    trackPerformanceMetrics() {
      if (!process.client) return

      try {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const paintEntries = performance.getEntriesByType('paint')

        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')

        this.performanceMetrics = {
          pageLoadTime: navigation.loadEventEnd - navigation.navigationStart,
          firstContentfulPaint: fcp ? fcp.startTime : 0,
          largestContentfulPaint: 0, // Would need additional setup
          cumulativeLayoutShift: 0 // Would need additional setup
        }

        // Track performance as event
        this.trackEvent('custom', 'performance_metrics', undefined, this.performanceMetrics)
      } catch (error) {
        console.warn('Performance tracking error:', error)
      }
    },

    // Auto tracking setup
    setupAutoTracking() {
      if (!process.client || !this.config.enableAutoTracking) return

      // Track initial page view
      this.trackPageView()

      // Track page visibility changes
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.updateTimeOnPage()
          this.flushQueue()
        }
      })

      // Track before page unload
      window.addEventListener('beforeunload', () => {
        this.updateTimeOnPage()
        this.endSession()
      })

      // Track route changes (for SPAs)
      if (window.history) {
        const originalPushState = window.history.pushState
        const originalReplaceState = window.history.replaceState

        window.history.pushState = function(...args) {
          originalPushState.apply(window.history, args)
          setTimeout(() => useAnalyticsStore().trackPageView(), 100)
        }

        window.history.replaceState = function(...args) {
          originalReplaceState.apply(window.history, args)
          setTimeout(() => useAnalyticsStore().trackPageView(), 100)
        }

        window.addEventListener('popstate', () => {
          setTimeout(() => this.trackPageView(), 100)
        })
      }
    },

    setupInteractionTracking() {
      if (!process.client) return

      // Track scroll depth
      let ticking = false
      const trackScroll = () => {
        const scrollTop = window.pageYOffset
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0

        this.trackScroll(scrollPercent)
        ticking = false
      }

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(trackScroll)
          ticking = true
        }
      })

      // Track clicks on important elements
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement

        // Track button clicks
        if (target.tagName === 'BUTTON' || target.closest('button')) {
          const button = target.tagName === 'BUTTON' ? target : target.closest('button')!
          this.trackClick('button', {
            text: button.textContent?.trim(),
            id: button.id,
            className: button.className
          })
        }

        // Track link clicks
        if (target.tagName === 'A' || target.closest('a')) {
          const link = target.tagName === 'A' ? target : target.closest('a')!
          this.trackClick('link', {
            href: (link as HTMLAnchorElement).href,
            text: link.textContent?.trim()
          })
        }
      })
    },

    // Queue management
    checkFlushQueue() {
      if (this.shouldFlushQueue) {
        this.flushQueue()
      }
    },

    async flushQueue() {
      if (!this.canTrack || this.loading.sending || !this.hasQueuedEvents) return

      this.setLoading('sending', true)

      try {
        const data = {
          sessionId: this.sessionId,
          userId: this.userId,
          pageViews: [...this.pageViewQueue],
          events: [...this.eventQueue],
          timestamp: Date.now()
        }

        const response = await AnalyticsService.sendEvents(data)

        if (response.success) {
          this.pageViewQueue = []
          this.eventQueue = []
          this.lastFlush = Date.now()
        } else {
          throw new Error(response.error || 'Failed to send analytics data')
        }
      } catch (error: any) {
        console.error('Analytics flush error:', error)
        this.error = error.message
      } finally {
        this.setLoading('sending', false)
      }
    },

    // Analytics data fetching
    async fetchAnalytics(dateRange?: { start: string; end: string }) {
      this.setLoading('metrics', true)
      this.error = null

      try {
        const response = await AnalyticsService.getAnalytics(dateRange)

        if (response.success && response.data) {
          this.metrics = response.data
        } else {
          throw new Error(response.error || 'Failed to fetch analytics')
        }
      } catch (error: any) {
        console.error('Error fetching analytics:', error)
        this.error = error.message
      } finally {
        this.setLoading('metrics', false)
      }
    },

    // Utility methods
    updateTimeOnPage() {
      if (this.pageStartTime) {
        this.timeOnPage = Date.now() - this.pageStartTime

        // Update the latest page view duration
        if (this.pageViewQueue.length > 0) {
          const latestPageView = this.pageViewQueue[this.pageViewQueue.length - 1]
          latestPageView.duration = this.timeOnPage
        }
      }
    },

    setLoading(type: keyof AnalyticsState['loading'], loading: boolean) {
      this.loading[type] = loading
    },

    clearError() {
      this.error = null
    },

    stopTracking() {
      this.isTrackingEnabled = false
      this.endSession()
      this.eventQueue = []
      this.pageViewQueue = []
    },

    resumeTracking() {
      this.isTrackingEnabled = true
      if (this.cookieConsent) {
        this.startSession()
      }
    },

    // Helper methods
    generateSessionId(): string {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },

    generateEventId(): string {
      return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    },

    getDeviceInfo() {
      if (!process.client) {
        return {
          type: 'desktop' as const,
          browser: 'unknown',
          os: 'unknown',
          screenResolution: 'unknown'
        }
      }

      const userAgent = navigator.userAgent
      const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent)
      const isTablet = /iPad|Tablet/.test(userAgent)

      return {
        type: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
        browser: this.getBrowserName(userAgent),
        os: this.getOSName(userAgent),
        screenResolution: `${window.screen.width}x${window.screen.height}`
      }
    },

    getBrowserName(userAgent: string): string {
      if (userAgent.includes('Firefox')) return 'Firefox'
      if (userAgent.includes('Chrome')) return 'Chrome'
      if (userAgent.includes('Safari')) return 'Safari'
      if (userAgent.includes('Edge')) return 'Edge'
      return 'Unknown'
    },

    getOSName(userAgent: string): string {
      if (userAgent.includes('Windows')) return 'Windows'
      if (userAgent.includes('Mac')) return 'macOS'
      if (userAgent.includes('Linux')) return 'Linux'
      if (userAgent.includes('Android')) return 'Android'
      if (userAgent.includes('iOS')) return 'iOS'
      return 'Unknown'
    },

    getLocationInfo() {
      // This would typically be filled by a geolocation service
      return undefined
    },

    getUtmParams() {
      if (!process.client) return undefined

      const urlParams = new URLSearchParams(window.location.search)
      const utmParams = {
        source: urlParams.get('utm_source'),
        medium: urlParams.get('utm_medium'),
        campaign: urlParams.get('utm_campaign'),
        content: urlParams.get('utm_content'),
        term: urlParams.get('utm_term')
      }

      // Only return if at least one UTM parameter exists
      return Object.values(utmParams).some(value => value !== null) ? utmParams : undefined
    }
  },

})