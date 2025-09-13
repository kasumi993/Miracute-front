import { useAuthStore } from '~/stores/auth'

export const useAdmin = () => {
  const authStore = useAuthStore()

  const isAdmin = computed(() => authStore.isAdmin)
  const user = computed(() => authStore.user)
  const profile = computed(() => authStore.profile)

  const requireAdmin = () => {
    if (!authStore.isAuthenticated) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    if (!authStore.isAdmin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      })
    }
  }

  const checkAdminAccess = () => {
    return authStore.isAuthenticated && authStore.isAdmin
  }

  return {
    isAdmin: readonly(isAdmin),
    user: readonly(user),
    profile: readonly(profile),
    requireAdmin,
    checkAdminAccess
  }
}
