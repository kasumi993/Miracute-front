export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const userStore = useUserStore()

  // If no user, redirect to login
  if (!user.value) {
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }

  // Initialize user store if not already done
  if (!userStore.isInitialized) {
    await userStore.initialize()
  }

  // Check if user has admin role
  if (!userStore.isAdmin) {
    console.log('Admin middleware: Access denied for user:', user.value.email)
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Admin privileges required.'
    })
  }

  console.log('Admin middleware: Access granted for admin user:', user.value.email)
})
