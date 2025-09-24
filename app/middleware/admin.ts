/**
 * Professional Admin Authentication Middleware
 * Secure, database-first admin verification with proper error handling
 */

import type { RouteLocationNormalized } from 'vue-router'
import { authService } from '~/services/core/AuthenticationService'

/**
 * Require user to have admin role
 * Checks authentication and admin status from database (not metadata)
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
      }

      const updatedState = authService.getAuthState()

      // Check authentication first
      if (!updatedState.isAuthenticated || !updatedState.user) {
        console.warn('Admin middleware: User not authenticated')
        return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
      }

      // Check email verification
      if (!updatedState.user.emailConfirmed) {
        console.warn('Admin middleware: Email not verified')
        return navigateTo('/auth/verify-email')
      }

      // Check admin status from database (most reliable)
      if (!authService.isAdmin()) {
        console.error('Admin middleware: Access denied - insufficient permissions')
        throw createError({
          statusCode: 403,
          statusMessage: 'Admin access required'
        })
      }

      console.log('Admin middleware: Access granted for:', updatedState.user.email)

    } catch (error: any) {
      console.error('Admin middleware error:', error)

      // If it's already a create error (403), let it through
      if (error.statusCode === 403) {
        throw error
      }

      // For other errors, redirect to login
      return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  }
)