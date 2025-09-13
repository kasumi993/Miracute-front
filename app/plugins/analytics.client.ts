export default defineNuxtPlugin(() => {
  const { trackPageView } = useAnalytics()
  const router = useRouter()

  // Track initial page view
  if (process.client) {
    nextTick(() => {
      trackPageView()
    })
  }

  // Track page views on route changes
  router.afterEach((to, from) => {
    if (process.client && to.path !== from.path) {
      nextTick(() => {
        trackPageView()
      })
    }
  })
})
