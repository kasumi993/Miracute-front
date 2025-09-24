/**
 * Professional Authentication Middleware
 * Centralized, secure authentication checking with proper error handling
 */

import type { RouteLocationNormalized } from 'vue-router'
import { authService } from '~/services/core/AuthenticationService'

/**
 * Require user to be authenticated
 * Redirects to login if not authenticated
 */
export default defineNuxtRouteMiddleware(
  async (to: RouteLocationNormalized) => {
    // Skip on server-side during SSR
    if (process.server) return

    try {
      // Get current auth state
      const authState = authService.getAuthState()

      // If not initialized, initialize auth service
      if (!authState.user && !authState.isLoading) {
        await authService.initialize()
        const updatedState = authService.getAuthState()

        if (!updatedState.isAuthenticated) {
          return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
        }
      }

      // If not authenticated, redirect to login
      if (!authState.isAuthenticated) {
        return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
      }

      // Check if email is verified (optional - uncomment if needed)
      // if (!authState.user?.emailConfirmed) {
      //   return navigateTo('/auth/verify-email')
      // }

    } catch (error) {
      console.error('Auth middleware error:', error)
      return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  }
)