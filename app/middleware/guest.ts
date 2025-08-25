export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // If user is authenticated, redirect them away from guest-only pages
  if (user.value) {
    // Check for redirect parameter from query
    const redirect = to.query.redirect as string
    
    if (redirect && redirect.startsWith('/')) {
      return navigateTo(redirect)
    }
    
    // Default redirect to account page
    return navigateTo('/account')
  }
})