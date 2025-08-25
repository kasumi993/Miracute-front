export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // Check if user is authenticated
  if (!user.value) {
    // Store the intended destination
    const redirectTo = to.fullPath
    
    // Redirect to login with return URL
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`)
  }
})