export const useAuthRedirect = () => {
  // Store the current page before redirecting to auth
  const storeCurrentPage = (currentPath?: string) => {
    // Get current path from parameter or useRoute (only if not in middleware context)
    let pathToStore = currentPath
    if (!pathToStore) {
      try {
        const route = useRoute()
        pathToStore = route.fullPath
      } catch (error) {
        // If useRoute fails (e.g., in middleware), skip storing
        console.warn('Could not access route for storing current page:', error)
        return
      }
    }

    // Don't store auth pages or api routes
    const excludePaths = ['/auth/', '/api/']
    if (!excludePaths.some(path => pathToStore.startsWith(path))) {
      localStorage.setItem('auth_redirect_to', pathToStore)
    }
  }

  // Get the stored redirect URL or provide a smart default
  const getRedirectUrl = (fallback = '/', currentRoute?: any) => {
    // Use provided route or try to get current route
    let route = currentRoute
    if (!route) {
      try {
        route = useRoute()
      } catch (error) {
        // If useRoute fails (e.g., in middleware), skip query parameter checks
        console.warn('Could not access route for redirect URL:', error)
      }
    }

    // Priority order for redirect:
    // 1. URL parameter (redirect, next, returnTo)
    // 2. Stored path in localStorage
    // 3. Provided fallback
    // 4. Home page

    // Check URL parameters first (if route is available)
    if (route?.query) {
      if (route.query.redirect && typeof route.query.redirect === 'string') {
        return route.query.redirect
      }
      if (route.query.next && typeof route.query.next === 'string') {
        return route.query.next
      }
      if (route.query.returnTo && typeof route.query.returnTo === 'string') {
        return route.query.returnTo
      }
    }

    // Check localStorage
    try {
      const storedPath = localStorage.getItem('auth_redirect_to')
      if (storedPath) {
        // Clean up after use
        localStorage.removeItem('auth_redirect_to')
        return storedPath
      }
    } catch (error) {
      console.warn('Could not access localStorage for redirect:', error)
    }

    return fallback
  }

  // Generate login URL with current page as redirect
  const getLoginUrl = (currentPath?: string) => {
    // Use provided path or try to get from route
    let redirectPath = currentPath
    if (!redirectPath) {
      try {
        const route = useRoute()
        redirectPath = route.fullPath
      } catch (error) {
        // If useRoute fails, default to home
        redirectPath = '/'
      }
    }

    // Don't redirect to auth pages themselves
    if (redirectPath.startsWith('/auth/')) {
      return '/auth/login'
    }

    return `/auth/login?redirect=${encodeURIComponent(redirectPath)}`
  }

  // Clear stored redirect (useful for cleanup)
  const clearStoredRedirect = () => {
    try {
      localStorage.removeItem('auth_redirect_to')
    } catch (error) {
      console.warn('Could not clear stored redirect:', error)
    }
  }

  // Redirect after successful auth with smart fallback
  const redirectAfterAuth = (customRedirect?: string) => {
    const redirectUrl = customRedirect || getRedirectUrl('/account')
    return navigateTo(redirectUrl, { replace: true })
  }

  return {
    storeCurrentPage,
    getRedirectUrl,
    getLoginUrl,
    clearStoredRedirect,
    redirectAfterAuth
  }
}
