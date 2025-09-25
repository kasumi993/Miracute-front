/**
 * Professional Authentication Middleware
 * Centralized, secure authentication checking with proper error handling
 */

import type { RouteLocationNormalized } from 'vue-router'
import { authService } from '@/services'

/**
 * Require user to be authenticated
 * Redirects to login if not authenticated
 */
export default defineNuxtRouteMiddleware(
  async (to: RouteLocationNormalized) => {
    // Skip on server-side during SSR
    if (process.server) {return}

    try {
      // Initialize auth service once
      await authService.initialize()

      // Get current auth state after initialization
      const authState = authService.getAuthState()

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
