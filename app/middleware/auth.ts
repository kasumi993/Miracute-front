import type { RouteLocationNormalized } from 'vue-router'
import { ensureAuthState, shouldRunMiddleware } from '~/utils/middleware-auth'

/**
 * Requires user to be authenticated.
 * Redirects to login page if user is not authenticated.
 */
export default defineNuxtRouteMiddleware(
  async (to: RouteLocationNormalized) => {
    if (!shouldRunMiddleware()) return

    const userStore = await ensureAuthState()

    if (!userStore.isAuthenticatedAndValid) {
      return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  }
)