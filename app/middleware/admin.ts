export default defineNuxtRouteMiddleware(() => {
  // Simple middleware that just ensures we're on client side
  // The actual admin check is handled by page components with proper loading states
  if (import.meta.server) {
    return
  }

  // Let the page component handle the admin verification with loading state
})
