export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  // Check if user is authenticated
  if (!user.value) {
    const redirectTo = to.fullPath
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`)
  }

  try {
    // Check if user has admin role
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.value.id)
      .single()

    if (error) {
      console.error('Error checking user role:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to verify admin access'
      })
    }

    // Check if user is admin
    if (userProfile?.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      })
    }

  } catch (error: any) {
    // Handle different types of errors
    if (error.statusCode === 403) {
      // User is not admin - redirect to home
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not have permission to access this area'
      })
    }

    // Other errors - redirect to login
    const redirectTo = to.fullPath
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`)
  }
})