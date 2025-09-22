// Unified admin access guard composable
export const useAdminGuard = () => {
  const auth = useAuth()
  const isCheckingAccess = ref(true)
  const hasAdminAccess = ref(false)
  const adminError = ref<string | null>(null)

  // Check admin access on initialization
  const checkAdminAccess = async () => {
    isCheckingAccess.value = true
    adminError.value = null

    try {
      // Ensure auth is initialized
      await auth.initialize()

      // Check if user is authenticated
      if (!auth.isAuthenticated.value) {
        adminError.value = 'Authentication required'
        if (import.meta.client) {
          const currentPath = useRoute().fullPath
          window.location.replace(`/auth/login?redirect=${encodeURIComponent(currentPath)}`)
        }
        return false
      }

      // Check admin status via API for server consistency
      try {
        const { AdminService } = await import('~/services')
        const response = await AdminService.checkAccess()

        if (!response.isAdmin) {
          adminError.value = 'Admin access required'
          if (import.meta.client) {
            window.location.replace('/?error=admin-required')
          }
          return false
        }
      } catch (apiError: unknown) {
        console.error('Admin access API check failed:', apiError)
        adminError.value = 'Access verification failed'
        if (import.meta.client) {
          window.location.replace('/auth/login?error=auth-error')
        }
        return false
      }

      hasAdminAccess.value = true
      return true
    } catch (error: unknown) {
      console.error('Admin access check failed:', error)
      adminError.value = (error as Error).message || 'Access check failed'
      hasAdminAccess.value = false

      if (import.meta.client) {
        window.location.replace('/')
      }
      return false
    } finally {
      isCheckingAccess.value = false
    }
  }

  // Require admin access (for use in pages)
  const requireAdminAccess = async () => {
    const hasAccess = await checkAdminAccess()
    if (!hasAccess) {
      throw createError({
        statusCode: 403,
        statusMessage: adminError.value || 'Admin access required'
      })
    }
  }

  // Initialize check
  onMounted(() => {
    checkAdminAccess()
  })

  return {
    isCheckingAccess: readonly(isCheckingAccess),
    hasAdminAccess: readonly(hasAdminAccess),
    adminError: readonly(adminError),
    checkAdminAccess,
    requireAdminAccess
  }
}
