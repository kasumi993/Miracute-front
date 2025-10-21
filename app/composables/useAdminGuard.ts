// Unified admin access guard composable
import { useAuth } from './useAuth'
import { authService } from '~/services/AuthService' // Direct import to avoid circular dependency
import { useUserStore } from '~/stores/auth/user'

export const useAdminGuard = () => {
  const auth = useAuth()
  const userStore = useUserStore()
  const isCheckingAccess = ref(true)
  const hasAdminAccess = ref(false)
  const adminError = ref<string | null>(null)
  const { getLoginUrl } = useAuthRedirect() // Access to redirect helper

  const checkAdminAccess = async () => {
    isCheckingAccess.value = true
    adminError.value = null

    try {
      // Ensure auth state is initialized (fallback if plugin failed)
      if (!auth.isAuthenticated.value && !userStore.isInitialized) {
        await auth.loadAuthState()
      }

      // Check auth state
      if (!auth.isAuthenticated.value) {
        adminError.value = 'Authentication required'
        if (import.meta.client) {
          // Get current path safely for client-side redirect
          let currentPath = '/'
          try {
            currentPath = useRoute().fullPath
          } catch (error) {
            // Fallback to window location if useRoute fails
            currentPath = window.location.pathname + window.location.search
          }
          window.location.replace(getLoginUrl(currentPath)) // Redirect to login
        }
        return false
      }
      
      // 3. Check client-side role (fast check after initialization)
      if (userStore.isAdmin) {
          hasAdminAccess.value = true
          return true
      }

      // 4. (Optional) Re-check admin status via API for server consistency, especially if role is customer/unknown
      try {
        const response = await authService.checkAdmin()

        if (!response.success || !response.data?.isAdmin) {
          adminError.value = 'Admin access required'
          if (import.meta.client) {
            window.location.replace('/?error=admin-required') // Redirect to home
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
