export default defineNuxtPlugin((nuxtApp) => {
  // Global error handler for unhandled errors
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    console.error('Vue error:', error)
    console.error('Component instance:', instance)
    console.error('Error info:', info)

    // Send error to analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error?.toString() || 'Unknown error',
        fatal: false
      })
    }

    // Show user-friendly error message
    const toast = useToast()
    toast.error('Something went wrong. Please try again.')
  }

  // Handle promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)

    // Prevent the default browser behavior
    event.preventDefault()

    // Send to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: event.reason?.toString() || 'Unhandled promise rejection',
        fatal: false
      })
    }

    // Show user notification
    const toast = useToast()
    toast.error('An unexpected error occurred.')
  })
})
