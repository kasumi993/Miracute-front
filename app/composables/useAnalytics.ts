import { AnalyticsService } from '~/services'

export const useAnalytics = () => {
  // Generate or get visitor ID from localStorage
  const getVisitorId = () => {
    if (process.client) {
      let visitorId = localStorage.getItem('visitor_id')
      if (!visitorId) {
        visitorId = `visitor_${  Date.now()  }_${  Math.random().toString(36).substr(2, 9)}`
        localStorage.setItem('visitor_id', visitorId)
      }
      return visitorId
    }
    return null
  }

  // Generate or get session ID from sessionStorage
  const getSessionId = () => {
    if (process.client) {
      let sessionId = sessionStorage.getItem('session_id')
      if (!sessionId) {
        sessionId = `session_${  Date.now()  }_${  Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('session_id', sessionId)
      }
      return sessionId
    }
    return null
  }

  // Track page view
  const trackPageView = async (path?: string, title?: string) => {
    if (!process.client) {return}

    const route = useRoute()
    const pagePath = path || route.fullPath
    const pageTitle = title || document.title

    try {
      await AnalyticsService.trackPageView({
        event_type: 'page_view',
        page_path: pagePath,
        page_title: pageTitle,
        visitor_id: getVisitorId(),
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
        referrer: document.referrer
      })
    } catch (error) {
      console.error('Failed to track page view:', error)
    }
  }

  // Track add to cart
  const trackAddToCart = async (productId: number | string) => {
    if (!process.client) {return}

    try {
      await AnalyticsService.trackEvent({
        event_type: 'add_to_cart',
        page_path: useRoute().fullPath,
        page_title: document.title,
        visitor_id: getVisitorId(),
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        product_id: productId
      })
    } catch (error) {
      console.error('Failed to track add to cart:', error)
    }
  }

  // Track product view
  const trackProductView = async (productId: number | string, productTitle?: string) => {
    if (!process.client) {return}

    try {
      await AnalyticsService.trackEvent({
        event_type: 'product_view',
        page_path: useRoute().fullPath,
        page_title: productTitle || document.title,
        visitor_id: getVisitorId(),
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        product_id: productId
      })
    } catch (error) {
      console.error('Failed to track product view:', error)
    }
  }

  // Track custom event
  const trackEvent = async (eventType: string, data?: any) => {
    if (!process.client) {return}

    try {
      await AnalyticsService.trackEvent({
        event_type: eventType,
        page_path: useRoute().fullPath,
        page_title: document.title,
        visitor_id: getVisitorId(),
        session_id: getSessionId(),
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        ...data
      })
    } catch (error) {
      console.error('Failed to track event:', error)
    }
  }

  return {
    getVisitorId,
    getSessionId,
    trackPageView,
    trackAddToCart,
    trackProductView,
    trackEvent
  }
}
