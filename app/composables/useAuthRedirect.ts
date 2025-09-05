export const useAuthRedirect = () => {
  // Store the current page before redirecting to auth
  const storeCurrentPage = () => {
    const route = useRoute()
    const currentPath = route.fullPath
    
    // Don't store auth pages or api routes
    const excludePaths = ['/auth/', '/api/']
    if (!excludePaths.some(path => currentPath.startsWith(path))) {
      localStorage.setItem('auth_redirect_to', currentPath)
    }
  }
  
  // Get the stored redirect URL or provide a smart default
  const getRedirectUrl = (fallback = '/') => {
    const route = useRoute()
    
    // Priority order for redirect:
    // 1. URL parameter (redirect, next, returnTo)
    // 2. Stored path in localStorage
    // 3. Provided fallback
    // 4. Home page
    
    // Check URL parameters first
    if (route.query.redirect && typeof route.query.redirect === 'string') {
      return route.query.redirect
    }
    if (route.query.next && typeof route.query.next === 'string') {
      return route.query.next
    }
    if (route.query.returnTo && typeof route.query.returnTo === 'string') {
      return route.query.returnTo
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
    const route = useRoute()
    const redirectPath = currentPath || route.fullPath
    
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