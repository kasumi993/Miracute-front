export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()

  if (!user.value) {
    const redirectTo = to.fullPath
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`)
  }

  if (process.client) {
    const supabase = useSupabaseClient()

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        return navigateTo('/auth/login')
      }

      const userRole = session.user.app_metadata?.role

      if (userRole !== 'admin') {
        return navigateTo('/?error=not-admin')
      }

    } catch (error: any) {
      console.error('Admin middleware error:', error)
      return navigateTo('/?error=admin-middleware-error')
    }
  }
})