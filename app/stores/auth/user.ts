import { defineStore } from 'pinia'
import type { AuthUser, UserProfile } from '@/types'
import { authService } from '@/services'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as AuthUser | null,
    profile: null as UserProfile | null,
    isAuthenticated: false,
    isLoading: false,
    error: null as string | null,
    isInitialized: false
  }),

  getters: {
    // Authentication status
    isAuthenticatedAndValid: (state): boolean => state.isAuthenticated && !!state.user,
    currentUser: (state): AuthUser | null => state.user,
    currentProfile: (state): UserProfile | null => state.profile,
    userEmail: (state): string | null => state.user?.email || state.profile?.email || null,

    // User display information
    displayName: (state): string => {
      if (state.profile?.firstName) {
        return state.profile.firstName
      }
      return state.user?.email?.split('@')[0] || 'User'
    },

    initials: (state): string => {
      if (state.profile?.firstName && state.profile?.lastName) {
        return `${state.profile.firstName.charAt(0)}${state.profile.lastName.charAt(0)}`.toUpperCase()
      }
      if (state.profile?.firstName) {
        return state.profile.firstName.charAt(0).toUpperCase()
      }
      return state.user?.email?.charAt(0).toUpperCase() || 'U'
    },

    // Role-based access
    isAdmin: (state): boolean => state.profile?.role === 'admin'
  },

  actions: {
    // Initialize authentication
    async initialize(): Promise<void> {
      if (this.isInitialized) return

      this.setLoading(true)

      try {
        const sessionResponse = await authService.getSession()
        if (sessionResponse?.data?.session?.user) {
          this.setUser(sessionResponse.data.session.user)
          await this.loadProfile()
        }
        this.isInitialized = true
      } catch (error) {
        console.warn('Auth initialization failed:', error)
      } finally {
        this.setLoading(false)
      }
    },

    async ensureInitialized(): Promise<void> {
      if (!this.isInitialized) {
        await this.initialize()
      }
    },

    // Authentication actions
    async signUp(data: {
      email: string
      firstName?: string
      lastName?: string
      marketingOptIn?: boolean
    }): Promise<void> {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await authService.sendMagicLink({
          email: data.email,
          metadata: { ...data, isSignUp: true }
        })

        if (!response.success) {
          throw new Error(response.error || 'Sign up failed')
        }
      } finally {
        this.setLoading(false)
      }
    },

    async signInWithMagicLink(email: string): Promise<void> {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await authService.sendMagicLink({
          email,
          metadata: { isSignUp: false }
        })

        if (!response.success) {
          throw new Error(response.error || 'Sign in failed')
        }
      } finally {
        this.setLoading(false)
      }
    },

    async signInWithGoogle(): Promise<void> {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await authService.initiateGoogleSignIn()

        if (response.success && response.data?.redirectTo) {
          window.location.href = response.data.redirectTo
        } else {
          throw new Error(response.error || 'Failed to initiate Google sign in')
        }
      } finally {
        this.setLoading(false)
      }
    },

    async signOut(): Promise<void> {
      this.setLoading(true)

      try {
        await authService.signOut()
      } catch (error) {
        console.warn('Auth service signOut failed:', error)
      }

      this.clearAuthState()

      try {
        await navigateTo('/auth/login')
      } catch {
        window.location.href = '/auth/login'
      }

      this.setLoading(false)
    },

    // Profile management
    async loadProfile(): Promise<void> {
      if (!this.isAuthenticated) return

      try {
        const response = await authService.getCurrentProfile()
        if (response.success && response.data?.user) {
          this.profile = response.data.user
        }
      } catch (error) {
        console.warn('Failed to load profile:', error)
      }
    },

    async updateProfile(updates: Record<string, any>): Promise<void> {
      if (!this.isAuthenticated) {
        throw new Error('Must be authenticated to update profile')
      }

      this.setLoading(true)
      this.clearError()

      try {
        const response = await authService.updateProfile(updates)

        if (response.success && response.data?.user) {
          this.profile = response.data.user
        } else {
          throw new Error(response.error || 'Profile update failed')
        }
      } finally {
        this.setLoading(false)
      }
    },

    // State management helpers
    setUser(supabaseUser: any): void {
      this.user = {
        id: supabaseUser.id,
        email: supabaseUser.email,
        emailConfirmed: !!supabaseUser.email_confirmed_at,
        phone: supabaseUser.phone,
        createdAt: supabaseUser.created_at,
        updatedAt: supabaseUser.updated_at,
        userMetadata: supabaseUser.user_metadata || {},
        appMetadata: supabaseUser.app_metadata || {}
      }
      this.isAuthenticated = true
    },

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
      this.error = null
    },

    // Authorization helpers
    requireAuth(): void {
      if (!this.isAuthenticated) {
        throw new Error('Authentication required')
      }
    },

    requireAdmin(): void {
      this.requireAuth()
      if (!this.isAdmin) {
        throw new Error('Admin access required')
      }
    }
  }
})