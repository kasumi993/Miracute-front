export interface AnalyticsEvent {
  event: string
  properties?: Record<string, any>
  user_id?: string
  timestamp?: string
}

export interface ProductView {
  product_id: string
  product_name: string
  product_slug: string
  category?: string
  price?: number
}

export interface SearchEvent {
  query: string
  results_count: number
  filters?: Record<string, any>
}

export interface ConversionEvent {
  event_type: 'add_to_cart' | 'purchase' | 'download' | 'wishlist_add'
  product_id?: string
  order_id?: string
  value?: number
}

/**
 * Analytics composable for client-side tracking
 */
export const useAnalytics = () => {
  const user = useSupabaseUser()
  
  /**
   * Track a generic event
   */
  const trackEvent = async (event: string, properties?: Record<string, any>) => {
    try {
      await $fetch('/api/analytics/track', {
        method: 'POST',
        body: {
          event,
          properties: {
            ...properties,
            url: window.location.href,
            referrer: document.referrer,
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          },
          user_id: user.value?.id
        }
      })
    } catch (error) {
      console.error('Failed to track event:', error)
    }
  }

  /**
   * Track product view
   */
  const trackProductView = async (product: ProductView) => {
    await trackEvent('product_view', {
      product_id: product.product_id,
      product_name: product.product_name,
      product_slug: product.product_slug,
      category: product.category,
      price: product.price
    })
  }

  /**
   * Track search events
   */
  const trackSearch = async (searchData: SearchEvent) => {
    await trackEvent('search', {
      query: searchData.query,
      results_count: searchData.results_count,
      filters: searchData.filters
    })
  }

  /**
   * Track conversion events
   */
  const trackConversion = async (conversion: ConversionEvent) => {
    await trackEvent('conversion', {
      event_type: conversion.event_type,
      product_id: conversion.product_id,
      order_id: conversion.order_id,
      value: conversion.value
    })
  }

  /**
   * Track page view manually (complement to server-side tracking)
   */
  const trackPageView = async (path?: string) => {
    const currentPath = path || useRoute().fullPath
    
    await trackEvent('page_view', {
      path: currentPath,
      title: document.title
    })
  }

  /**
   * Track user interactions
   */
  const trackInteraction = async (interaction: string, element?: string, data?: any) => {
    await trackEvent('interaction', {
      interaction,
      element,
      data
    })
  }

  /**
   * Track form events
   */
  const trackForm = async (action: 'start' | 'submit' | 'abandon', formName: string, data?: any) => {
    await trackEvent('form_interaction', {
      action,
      form_name: formName,
      data
    })
  }

  /**
   * Track download events
   */
  const trackDownload = async (productId: string, productName: string, fileType?: string) => {
    await trackEvent('download', {
      product_id: productId,
      product_name: productName,
      file_type: fileType
    })
  }

  /**
   * Track cart events
   */
  const trackCart = async (action: 'add' | 'remove' | 'update', productId: string, quantity?: number) => {
    await trackEvent('cart_action', {
      action,
      product_id: productId,
      quantity
    })
  }

  /**
   * Track user authentication events
   */
  const trackAuth = async (action: 'login' | 'logout' | 'register', method?: string) => {
    await trackEvent('auth', {
      action,
      method
    })
  }

  /**
   * Helper to automatically track route changes
   */
  const setupRouteTracking = () => {
    const router = useRouter()
    
    router.afterEach((to) => {
      // Track page view on route change
      trackPageView(to.fullPath)
    })
  }

  /**
   * Helper to track scroll depth
   */
  const trackScrollDepth = () => {
    if (process.client) {
      let maxScrollDepth = 0
      let scrollTimeoutId: NodeJS.Timeout
      
      const handleScroll = () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight
        const scrollDepth = Math.round((scrollTop / documentHeight) * 100)
        
        if (scrollDepth > maxScrollDepth) {
          maxScrollDepth = scrollDepth
        }
        
        // Debounce scroll tracking
        clearTimeout(scrollTimeoutId)
        scrollTimeoutId = setTimeout(() => {
          if (maxScrollDepth >= 25 && maxScrollDepth % 25 === 0) {
            trackEvent('scroll_depth', {
              depth: maxScrollDepth,
              path: useRoute().fullPath
            })
          }
        }, 500)
      }
      
      window.addEventListener('scroll', handleScroll, { passive: true })
      
      // Cleanup
      onUnmounted(() => {
        window.removeEventListener('scroll', handleScroll)
        clearTimeout(scrollTimeoutId)
      })
    }
  }

  /**
   * Track time spent on page
   */
  const trackTimeOnPage = () => {
    if (process.client) {
      const startTime = Date.now()
      
      const trackPageTime = () => {
        const timeSpent = Date.now() - startTime
        if (timeSpent > 5000) { // Only track if more than 5 seconds
          trackEvent('time_on_page', {
            duration: Math.round(timeSpent / 1000), // in seconds
            path: useRoute().fullPath
          })
        }
      }
      
      // Track when user leaves page
      window.addEventListener('beforeunload', trackPageTime)
      
      onUnmounted(() => {
        trackPageTime()
        window.removeEventListener('beforeunload', trackPageTime)
      })
    }
  }

  return {
    trackEvent,
    trackProductView,
    trackSearch,
    trackConversion,
    trackPageView,
    trackInteraction,
    trackForm,
    trackDownload,
    trackCart,
    trackAuth,
    setupRouteTracking,
    trackScrollDepth,
    trackTimeOnPage
  }
}