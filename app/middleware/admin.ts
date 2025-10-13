import type { RouteLocationNormalized } from 'vue-router'
import { ensureAuthState, shouldRunMiddleware } from '~/utils/middleware-auth'

/**
 * Requires user to have admin role.
 */
export default defineNuxtRouteMiddleware(
  async (to: RouteLocationNormalized) => {
    if (!shouldRunMiddleware()) return

    const userStore = await ensureAuthState()

    // Check authentication first
    if (!userStore.isAuthenticatedAndValid) {
      return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }

    // Check admin role
    if (!userStore.isAdmin) {
      return navigateTo('/auth/login?error=admin-required')
    }
  }
)