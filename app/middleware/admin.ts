export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  
  console.log('Admin middleware - checking user:', user.value?.email)

  // Check if user is authenticated
  if (!user.value) {
    console.log('No user found, redirecting to login')
    const redirectTo = to.fullPath
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`)
  }

  // Only run additional checks on client side to ensure proper auth context
  if (process.client) {
    const supabase = useSupabaseClient()

    try {
      console.log('Checking user role for:', user.value.id)
      
      // Check if user has admin role from JWT metadata
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.log('No session found, redirecting to login')
        return navigateTo('/auth/login')
      }

      // Check JWT claims for admin role
      const userRole = session.user.app_metadata?.role

      if (userRole !== 'admin') {
        console.log('User is not admin, redirecting...')
        return navigateTo('/?error=not-admin')
      }

      console.log('Admin access granted')

    } catch (error: any) {
      console.error('Admin middleware error:', error)
      return navigateTo('/?error=admin-middleware-error')
    }
  }
})