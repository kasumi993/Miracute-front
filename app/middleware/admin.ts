/**
 * Professional Admin Authentication Middleware
 * Secure, database-first admin verification with proper error handling
 */

import type { RouteLocationNormalized } from 'vue-router'
import { authService } from '@/services'

/**
 * Require user to have admin role
 * Checks authentication and admin status from database (not metadata)
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

      // Check authentication first
      if (!authState.isAuthenticated || !authState.user) {
        return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
      }

      // Check email verification
      if (!authState.user.emailConfirmed) {
        return navigateTo('/auth/verify-email')
      }

      // Check admin status - if profile isn't loaded or user isn't admin, deny access
      if (!authState.profile || authState.profile.role !== 'admin') {
        throw createError({
          statusCode: 403,
          statusMessage: 'Admin access required'
        })
      }

    } catch (error: any) {
      // If it's already a create error (403), let it through
      if (error.statusCode === 403) {
        throw error
      }

      // For other errors, redirect to login
      return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  }
)
