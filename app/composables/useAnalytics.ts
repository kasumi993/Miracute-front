/**
 * Analytics Composable
 * Simplified interface to the analytics store
 */

import { useAnalyticsStore } from '~/stores/analytics'

export const useAnalytics = () => {
  const analyticsStore = useAnalyticsStore()

  // Initialize analytics if not already initialized
  if (!analyticsStore.isInitialized && process.client) {
    analyticsStore.initialize()
  }

  return {
    // Store state
    visitorId: computed(() => analyticsStore.visitorId),
    sessionId: computed(() => analyticsStore.sessionId),
    isInitialized: computed(() => analyticsStore.isInitialized),
    queueLength: computed(() => analyticsStore.queueLength),

    // Tracking methods
    trackPageView: (path?: string, title?: string) =>
      analyticsStore.trackPageView(path, title),

    trackProductView: (productId: string | number, productTitle?: string) =>
      analyticsStore.trackProductView(productId, productTitle),

    trackAddToCart: (productId: string | number) =>
      analyticsStore.trackAddToCart(productId),

    trackEvent: (eventType: string, data?: Record<string, unknown>) =>
      analyticsStore.trackCustomEvent(eventType, data),

    // Utility methods
    initialize: () => analyticsStore.initialize(),
    clearData: () => analyticsStore.clearAnalyticsData(),

    // Getters
    getVisitorId: () => analyticsStore.visitorId,
    getSessionId: () => analyticsStore.sessionId
  }
}
