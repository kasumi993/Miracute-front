export default defineNuxtPlugin(() => {
  const { setupRouteTracking, trackPageView } = useAnalytics()
  
  // Setup automatic route tracking
  setupRouteTracking()
  
  // Track initial page view
  trackPageView()
  
  // Optional: Setup scroll depth and time tracking for key pages
  const route = useRoute()
  if (route.path.includes('/templates/') || route.path === '/templates') {
    const { trackScrollDepth, trackTimeOnPage } = useAnalytics()
    trackScrollDepth()
    trackTimeOnPage()
  }
})