/**
 * Professional Analytics Store
 * Centralized analytics tracking with proper state management
 */

import { defineStore } from 'pinia'
import { apiService } from '@/services'
import type { AnalyticsEvent, AnalyticsTrackingState } from '@/types/admin/analytics'

export const useAnalyticsTrackingStore = defineStore('analytics-tracking', {
  state: (): AnalyticsTrackingState => ({
    visitorId: null,
    sessionId: null,
    isInitialized: false,
    eventQueue: [],
    isProcessing: false
  }),

  getters: {
    hasVisitorId: (state): boolean => !!state.visitorId,
    hasSessionId: (state): boolean => !!state.sessionId,
    queueLength: (state): number => state.eventQueue.length
  },

  actions: {
    /**
     * Initialize analytics tracking
     */
    initialize(): void {
      if (this.isInitialized || !process.client) {return}

      // Generate or get visitor ID from localStorage
      let visitorId = localStorage.getItem('visitor_id')
      if (!visitorId) {
        visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('visitor_id', visitorId)
      }
      this.visitorId = visitorId

      // Generate or get session ID from sessionStorage
      let sessionId = sessionStorage.getItem('session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('session_id', sessionId)
      }
      this.sessionId = sessionId

      this.isInitialized = true

      // Process any queued events
      this.processEventQueue()
    },

    /**
     * Track page view
     */
    async trackPageView(path?: string, title?: string): Promise<void> {
      if (!process.client) {return}

      const route = useRoute()
      const event: AnalyticsEvent = {
        event_type: 'page_view',
        page_path: path || route.fullPath,
        page_title: title || document.title,
        visitor_id: this.visitorId,
        session_id: this.sessionId,
        user_agent: navigator.userAgent,
        referrer: document.referrer
      }

      await this.trackEvent(event)
    },

    /**
     * Track product view
     */
    async trackProductView(productId: string | number, productTitle?: string): Promise<void> {
      if (!process.client) {return}

      const event: AnalyticsEvent = {
        event_type: 'product_view',
        page_path: useRoute().fullPath,
        page_title: productTitle || document.title,
        visitor_id: this.visitorId,
        session_id: this.sessionId,
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        product_id: productId
      }

      await this.trackEvent(event)
    },

    /**
     * Track add to cart
     */
    async trackAddToCart(productId: string | number): Promise<void> {
      if (!process.client) {return}

      const event: AnalyticsEvent = {
        event_type: 'add_to_cart',
        page_path: useRoute().fullPath,
        page_title: document.title,
        visitor_id: this.visitorId,
        session_id: this.sessionId,
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        product_id: productId
      }

      await this.trackEvent(event)
    },

    /**
     * Track custom event
     */
    async trackCustomEvent(eventType: string, data?: Record<string, unknown>): Promise<void> {
      if (!process.client) {return}

      const event: AnalyticsEvent = {
        event_type: eventType,
        page_path: useRoute().fullPath,
        page_title: document.title,
        visitor_id: this.visitorId,
        session_id: this.sessionId,
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        ...data
      }

      await this.trackEvent(event)
    },

    /**
     * Internal track event method
     */
    async trackEvent(event: AnalyticsEvent): Promise<void> {
      if (!this.isInitialized) {
        // Queue event for later processing
        this.eventQueue.push(event)
        return
      }

      try {
        await apiService.post('/analytics/track', event)
      } catch (error) {
        console.warn('Failed to track analytics event:', error)
        // Could implement retry logic or offline storage here
      }
    },

    /**
     * Process queued events
     */
    async processEventQueue(): Promise<void> {
      if (this.isProcessing || this.eventQueue.length === 0) {return}

      this.isProcessing = true

      try {
        const events = [...this.eventQueue]
        this.eventQueue = []

        for (const event of events) {
          await this.trackEvent(event)
        }
      } catch (error) {
        console.error('Failed to process analytics event queue:', error)
      } finally {
        this.isProcessing = false
      }
    },

    /**
     * Clear all analytics data
     */
    clearAnalyticsData(): void {
      if (process.client) {
        localStorage.removeItem('visitor_id')
        sessionStorage.removeItem('session_id')
      }

      this.visitorId = null
      this.sessionId = null
      this.isInitialized = false
      this.eventQueue = []
      this.isProcessing = false
    }
  }
})
