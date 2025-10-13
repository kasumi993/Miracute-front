import type { RouteLocationNormalized } from 'vue-router'
import { ensureAuthState, shouldRunMiddleware } from '~/utils/middleware-auth'

/**
 * Redirects authenticated users away from guest-only pages (like login/signup).
 * If user is already logged in, redirect to their intended destination or account page.
 */
export default defineNuxtRouteMiddleware(
  async (to: RouteLocationNormalized) => {
    if (!shouldRunMiddleware()) return

    const userStore = await ensureAuthState()

    if (userStore.isAuthenticatedAndValid) {
      const redirect = to.query.redirect as string
      if (redirect && redirect.startsWith('/')) {
        return navigateTo(redirect)
      }

      // Default redirect to account page
      return navigateTo('/account')
    }
  }
)
