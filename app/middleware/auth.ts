import { useUserStore } from '~/stores/auth/user'
import type { RouteLocationNormalized } from 'vue-router'

/**
 * Requires user to be authenticated.
 * Redirects to login page if user is not authenticated.
 */
export default defineNuxtRouteMiddleware(
  async (to: RouteLocationNormalized) => {
    const userStore = useUserStore()

    // Ensure auth state is initialized (fallback if plugin failed)
    if (!userStore.isInitialized) {
      await userStore.loadAuthState()
    }

    // Check if authenticated
    if (!userStore.isAuthenticatedAndValid) {
      return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  }
)