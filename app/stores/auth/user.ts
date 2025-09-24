/**
 * Professional User Store - Refactored
 * Replaces scattered auth logic with clean service integration
 */

import { defineStore } from 'pinia'
import type { AuthUser, UserProfile, UserRole, AuthState } from '~/types/api'
import { authService } from '~/services/core/AuthenticationService'
import {
  AuthenticationError,
  AuthorizationError,
  ErrorLogger
} from '~/utils/errors'

export const useUserStore = defineStore('user', {
  state: (): AuthState & { isInitialized: boolean } => ({
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isInitialized: false
  }),

  getters: {
    // Authentication status
    isAuthenticated: (state): boolean => state.isAuthenticated && !!state.user,
    isLoading: (state): boolean => state.isLoading,
    hasError: (state): boolean => !!state.error,

    // User information
    currentUser: (state): AuthUser | null => state.user,
    currentProfile: (state): UserProfile | null => state.profile,
    userEmail: (state): string | null => state.user?.email || state.profile?.email || null,

    // User display information
    fullName: (state): string => {
      if (!state.profile) return state.user?.email || 'User'

      const { firstName, lastName, fullName } = state.profile
      if (fullName) return fullName
      if (firstName && lastName) return `${firstName} ${lastName}`
      return firstName || lastName || state.user?.email || 'User'
    },

    displayName: (state): string => {
      if (!state.profile) return state.user?.email?.split('@')[0] || 'User'
      return state.profile.firstName || state.user?.email?.split('@')[0] || 'User'
    },

    initials: (state): string => {
      if (!state.profile) return state.user?.email?.charAt(0).toUpperCase() || 'U'

      const { firstName, lastName } = state.profile
      if (firstName && lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
      }
      if (firstName) return firstName.charAt(0).toUpperCase()
      return state.user?.email?.charAt(0).toUpperCase() || 'U'
    },

    avatarUrl: (state): string | null => {
      return state.profile?.avatarUrl || state.user?.userMetadata.avatar_url || null
    },

    // Role-based access
    userRole: (state): UserRole => state.profile?.role || 'customer',
    isAdmin: (state): boolean => state.profile?.role === 'admin',
    isCustomer: (state): boolean => state.profile?.role === 'customer',
    isModerator: (state): boolean => state.profile?.role === 'moderator',

    // Profile information
    hasCompleteProfile: (state): boolean => {
      if (!state.profile) return false
      return !!(state.profile.firstName && state.profile.lastName)
    },

    isEmailVerified: (state): boolean => {
      return state.user?.emailConfirmed || false
    },

    // Location and preferences
    userCountry: (state): string | null => state.profile?.country || null,
    marketingOptIn: (state): boolean => state.profile?.marketingOptIn || false,

    // Account timestamps
    accountCreatedAt: (state): string | null => {
      return state.profile?.createdAt || state.user?.createdAt || null
    },

    lastUpdatedAt: (state): string | null => {
      return state.profile?.updatedAt || state.user?.updatedAt || null
    }
  },

  actions: {
    // ==========================================
    // Initialization
    // ==========================================

    /**
     * Initialize the auth state - called on app startup
     */
    async initialize(): Promise<void> {
      if (this.isInitialized) return

      this.setLoading(true)

      try {
        // Initialize the auth service
        await authService.initialize()

        // Sync state from auth service
        this.syncFromAuthService()

        this.isInitialized = true

      } catch (error) {
        this.handleError(error, 'Failed to initialize authentication')
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Sync store state from auth service
     */
    syncFromAuthService(): void {
      const authState = authService.getAuthState()

      this.user = authState.user
      this.profile = authState.profile
      this.isAuthenticated = authState.isAuthenticated
      this.isLoading = authState.isLoading
      this.error = authState.error
    },

    // ==========================================
    // Authentication Actions
    // ==========================================

    /**
     * Sign up new user
     */
    async signUp(credentials: {
      email: string
      password: string
      firstName?: string
      lastName?: string
      marketingOptIn?: boolean
    }): Promise<void> {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await authService.signUp(credentials)

        if (response.success) {
          this.syncFromAuthService()
          await navigateTo('/auth/verify-email')
        } else {
          throw new Error(response.error || 'Sign up failed')
        }

      } catch (error) {
        this.handleError(error, 'Sign up failed')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Sign in existing user
     */
    async signIn(credentials: {
      email: string
      password: string
      rememberMe?: boolean
    }): Promise<void> {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await authService.signIn(credentials)

        if (response.success) {
          this.syncFromAuthService()

          // Redirect based on user role
          if (this.isAdmin) {
            await navigateTo('/dashboard')
          } else {
            await navigateTo('/')
          }
        } else {
          throw new Error(response.error || 'Sign in failed')
        }

      } catch (error) {
        this.handleError(error, 'Sign in failed')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Sign out current user
     */
    async signOut(): Promise<void> {
      this.setLoading(true)

      try {
        await authService.signOut()
        this.clearAuthState()

      } catch (error) {
        this.handleError(error, 'Sign out failed')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Request password reset
     */
    async requestPasswordReset(email: string, redirectUrl?: string): Promise<void> {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await authService.requestPasswordReset({ email, redirectUrl })

        if (!response.success) {
          throw new Error(response.error || 'Password reset request failed')
        }

      } catch (error) {
        this.handleError(error, 'Password reset request failed')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Update password
     */
    async updatePassword(newPassword: string, confirmPassword: string): Promise<void> {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await authService.updatePassword({ newPassword, confirmPassword })

        if (!response.success) {
          throw new Error(response.error || 'Password update failed')
        }

      } catch (error) {
        this.handleError(error, 'Password update failed')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // ==========================================
    // Profile Management
    // ==========================================

    /**
     * Fetch current user profile
     */
    async fetchProfile(): Promise<void> {
      if (!this.isAuthenticated) {
        throw new AuthenticationError('Must be authenticated to fetch profile')
      }

      this.setLoading(true)

      try {
        const response = await authService.getCurrentProfile()

        if (response.success && response.data) {
          this.profile = response.data
        } else {
          throw new Error(response.error || 'Failed to fetch profile')
        }

      } catch (error) {
        this.handleError(error, 'Failed to fetch profile')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Update user profile
     */
    async updateProfile(updates: {
      firstName?: string
      lastName?: string
      avatarUrl?: string
      country?: string
      phoneNumber?: string
      dateOfBirth?: string
      marketingOptIn?: boolean
    }): Promise<void> {
      if (!this.isAuthenticated) {
        throw new AuthenticationError('Must be authenticated to update profile')
      }

      this.setLoading(true)
      this.clearError()

      try {
        const response = await authService.updateProfile(updates)

        if (response.success && response.data) {
          this.profile = response.data
        } else {
          throw new Error(response.error || 'Profile update failed')
        }

      } catch (error) {
        this.handleError(error, 'Profile update failed')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // ==========================================
    // Authorization Helpers
    // ==========================================

    /**
     * Require authentication (throws if not authenticated)
     */
    requireAuth(): void {
      if (!this.isAuthenticated) {
        throw new AuthenticationError('Authentication required')
      }
    },

    /**
     * Require admin role (throws if not admin)
     */
    requireAdmin(): void {
      this.requireAuth()

      if (!this.isAdmin) {
        throw new AuthorizationError('Admin access required')
      }
    },

    /**
     * Check if user has specific role
     */
    hasRole(role: UserRole): boolean {
      return this.userRole === role
    },

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole(roles: UserRole[]): boolean {
      return roles.includes(this.userRole)
    },

    /**
     * Check permission (extensible for future role-based permissions)
     */
    hasPermission(permission: string): boolean {
      // Admin has all permissions
      if (this.isAdmin) return true

      // TODO: Implement granular permission system
      switch (permission) {
        case 'view_orders':
          return this.isAuthenticated
        case 'manage_products':
          return this.isAdmin
        case 'moderate_reviews':
          return this.isAdmin || this.isModerator
        default:
          return false
      }
    },

    // ==========================================
    // State Management
    // ==========================================

    setLoading(loading: boolean): void {
      this.isLoading = loading
    },

    clearError(): void {
      this.error = null
    },

    setError(error: string): void {
      this.error = error
    },

    clearAuthState(): void {
      this.user = null
      this.profile = null
      this.isAuthenticated = false
      this.isLoading = false
      this.error = null
    },

    /**
     * Handle errors with consistent logging and user feedback
     */
    handleError(error: unknown, context: string): void {
      const errorMessage = error instanceof Error ? error.message : String(error)

      this.setError(errorMessage)

      ErrorLogger.log(
        error instanceof Error ? error : new Error(errorMessage),
        {
          userId: this.user?.id,
          context,
          timestamp: new Date().toISOString()
        }
      )

      // Show user-friendly toast notification
      const { $toast } = useNuxtApp()
      if ($toast) {
        $toast.error(errorMessage)
      }
    },

    // ==========================================
    // Utility Methods
    // ==========================================

    /**
     * Get user's preferred display name for UI
     */
    getDisplayName(): string {
      return this.displayName
    },

    /**
     * Get user's initials for avatar fallback
     */
    getInitials(): string {
      return this.initials
    },

    /**
     * Check if profile needs completion
     */
    needsProfileCompletion(): boolean {
      return !this.hasCompleteProfile && this.isAuthenticated
    },

    /**
     * Get user's timezone (future enhancement)
     */
    getTimezone(): string {
      // TODO: Implement timezone detection/storage
      return Intl.DateTimeFormat().resolvedOptions().timeZone
    },

    /**
     * Get user's locale preference (future enhancement)
     */
    getLocale(): string {
      // TODO: Implement locale preference storage
      return 'en-US'
    },

    /**
     * Export user data (GDPR compliance)
     */
    async exportUserData(): Promise<void> {
      this.requireAuth()

      try {
        // TODO: Implement user data export
        const userData = {
          user: this.user,
          profile: this.profile,
          exportedAt: new Date().toISOString()
        }

        // Trigger download
        const blob = new Blob([JSON.stringify(userData, null, 2)], {
          type: 'application/json'
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `user-data-${this.user?.id}.json`
        a.click()
        URL.revokeObjectURL(url)

      } catch (error) {
        this.handleError(error, 'Failed to export user data')
        throw error
      }
    },

    /**
     * Delete user account (GDPR compliance)
     */
    async deleteAccount(confirmation: string): Promise<void> {
      this.requireAuth()

      if (confirmation !== 'DELETE') {
        throw new ValidationError('Invalid confirmation', 'confirmation')
      }

      this.setLoading(true)

      try {
        // TODO: Implement account deletion
        // await authService.deleteAccount()

        this.clearAuthState()
        await navigateTo('/')

      } catch (error) {
        this.handleError(error, 'Account deletion failed')
        throw error
      } finally {
        this.setLoading(false)
      }
    }
  }
})