// Client-side plugin to handle hydration edge cases
export default defineNuxtPlugin({
  name: 'hydration-fix',
  setup() {
    // Only run on client side
    if (process.server) {return}

    // Handle any potential hydration mismatches during app initialization
    const nuxtApp = useNuxtApp()

    // Wait for hydration to complete
    nuxtApp.hook('app:mounted', () => {
      // Clear any potential server-rendered state that could cause mismatches
      if (typeof window !== 'undefined') {
        // Fix any localStorage/sessionStorage dependent components
        nextTick(() => {
          // Trigger a re-render for any components that depend on client-only state
          const event = new CustomEvent('hydration-complete')
          window.dispatchEvent(event)
        })
      }
    })

    // Error boundary for hydration mismatches
    nuxtApp.hook('vue:error', (error) => {
      if (error.message?.includes('Hydration')) {
        console.warn('Hydration mismatch detected:', error)
        // Don't let hydration errors crash the app
        return true
      }
    })
  }
})
