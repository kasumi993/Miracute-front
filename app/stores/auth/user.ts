/**
 * Professional User Store - Refactored
 * Handles state, lifecycle listeners, error handling, and redirects.
 * Calls pure functions from the services/auth layer.
 */

import { defineStore } from 'pinia'
import type { AuthUser, UserProfile, UserRole, AuthState } from '@/types'
import { authService } from '@/services'
import {
  AuthenticationError,
  AuthorizationError,
  ErrorLogger
} from '~/utils/errors'

// Helper function to transform Supabase user object into internal AuthUser type
const transformSupabaseUser = (supabaseUser: any): AuthUser => ({
    id: supabaseUser.id,
    email: supabaseUser.email,
    emailConfirmed: !!supabaseUser.email_confirmed_at,
    phone: supabaseUser.phone,
    createdAt: supabaseUser.created_at,
    updatedAt: supabaseUser.updated_at,
    userMetadata: supabaseUser.user_metadata || {},
    appMetadata: supabaseUser.app_metadata || {}
})

// Helper function to map metadata to profile creation payload
const mapMetadataToProfile = (supabaseUser: any): Omit<UserProfile, 'createdAt' | 'updatedAt' | 'role'> => {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email,
    firstName: supabaseUser.user_metadata?.first_name, 
    lastName: supabaseUser.user_metadata?.last_name,
    avatarUrl: supabaseUser.user_metadata?.avatar_url,
    country: supabaseUser.user_metadata?.country,
    phoneNumber: supabaseUser.user_metadata?.phone_number,
    dateOfBirth: supabaseUser.user_metadata?.date_of_birth,
    marketingOptIn: supabaseUser.user_metadata?.marketing_opt_in || false,
    fullName: supabaseUser.user_metadata?.full_name,
  }
}

let initializationPromise: Promise<void> | null = null

export const useUserStore = defineStore('user', {
  state: (): AuthState & { isInitialized: boolean, isInitialLoad: boolean } => ({
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isInitialized: false,
    isInitialLoad: true // Flag to indicate the very first load
  }),

  getters: {
    // Authentication status
    isAuthenticatedAndValid: (state): boolean => state.isAuthenticated && !!state.user,
    isCurrentlyLoading: (state): boolean => state.isLoading,
    hasError: (state): boolean => !!state.error,

    // User information
    currentUser: (state): AuthUser | null => state.user,
    currentProfile: (state): UserProfile | null => state.profile,
    userEmail: (state): string | null => state.user?.email || state.profile?.email || null,

    // User display information
    fullName: (state): string => {
      if (!state.profile) {return state.user?.email || 'User'}
      const { firstName, lastName, fullName } = state.profile
      if (fullName) {return fullName}
      if (firstName && lastName) {return `${firstName} ${lastName}`}
      return firstName || lastName || state.user?.email || 'User'
    },
    displayName: (state): string => {
      if (!state.profile) {return state.user?.email?.split('@')[0] || 'User'}
      return state.profile.firstName || state.user?.email?.split('@')[0] || 'User'
    },
    initials: (state): string => {
      if (!state.profile) {return state.user?.email?.charAt(0).toUpperCase() || 'U'}
      const { firstName, lastName } = state.profile
      if (firstName && lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
      }
      if (firstName) {return firstName.charAt(0).toUpperCase()}
      return state.user?.email?.charAt(0).toUpperCase() || 'U'
    },
    avatarUrl: (state): string | null => {
      return state.profile?.avatarUrl || state.user?.userMetadata.avatar_url || null
    },

    // Role-based access
    userRole: (state): UserRole => state.profile?.role || 'customer',
    isAdmin: (state): boolean => state.profile?.role === 'admin',
    hasCompleteProfile: (state): boolean => {
      if (!state.profile) {return false}
      return !!(state.profile.firstName && state.profile.lastName)
    },
    isEmailVerified: (state): boolean => {
      return state.user?.emailConfirmed || false
    },
  },

  actions: {
    // ==========================================
    // Core Lifecycle & Listeners (Owned by Store)
    // ==========================================
    
    // Internal helper to fetch or create profile after successful authentication
    async _fetchOrCreateProfile(supabaseUser: any): Promise<void> {
      try {
        const response = await authService.getCurrentProfile()

        if (response.success && response.data?.user) {
          this.profile = response.data.user
        } else {
          // If profile is not found (PGRST116), create it
          const createPayload = mapMetadataToProfile(supabaseUser)

          const creationResponse = await authService.createUserProfile({
            user_id: supabaseUser.id,
            email: supabaseUser.email,
            first_name: createPayload.firstName,
            last_name: createPayload.lastName,
            avatar_url: createPayload.avatarUrl,
            role: (supabaseUser.user_metadata?.role as UserRole) || 'customer'
          })

          if (creationResponse.success && creationResponse.data?.user) {
            this.profile = creationResponse.data.user
          } else {
            console.error('Failed to create user profile after successful auth:', creationResponse.error)
          }
        }
      } catch (error) {
        // Log the failure to fetch/create but don't clear auth state
        console.error('Error in _fetchOrCreateProfile:', error)
      }
    },

    async _handleAuthSuccess(session: any): Promise<void> {
      const user = session?.user
      if (!user) { return }
      
      this.user = transformSupabaseUser(user)
      this.isAuthenticated = true
      
      // Fetch or create profile
      await this._fetchOrCreateProfile(user)
    },

    async _handleAuthStateChange(event: string, session: any): Promise<void> {
      switch (event) {
        case 'SIGNED_IN':
        case 'INITIAL_SESSION':
          await this._handleAuthSuccess(session)
          break
        case 'SIGNED_OUT':
          this.clearAuthState()
          break
        case 'TOKEN_REFRESHED':
          // Update the user object only
          if (session?.user) {
            this.user = transformSupabaseUser(session.user)
          }
          break
      }
      if (this.isInitialLoad) {
        this.isInitialLoad = false // <-- Marquer la fin du chargement initial
      } else {
        this.setLoading(false) // Utiliser isLoading pour les changements post-initialisation
      }
    },

    /**
     * Initialize the auth state and set up the global listener.
     */
    async initialize(): Promise<void> {
      if (this.isInitialized) { 
        return initializationPromise || Promise.resolve() 
      }

      if (initializationPromise) {
          return initializationPromise // Empêcher les appels multiples
      }

      initializationPromise = new Promise(async (resolve, reject) => {
        this.setLoading(true)
        
        try {
          // 1. Get initial session
          const sessionResponse = await authService.getSession()

          if (!sessionResponse) {
              // Gérer l'échec total (le service n'a rien retourné)
              console.warn("Auth service did not return a session response.")
              return 
          }

          // Maintenant, on peut déstructurer en toute sécurité
          const {  data: { session }, error } = sessionResponse 

          if (error) {
            throw new AuthenticationError('Failed to get initial session')
          }

          // 2. Process initial session data
          await this._handleAuthStateChange('INITIAL_SESSION', session)

          // 3. Start listener for real-time updates (Magic Link/OAuth callbacks)
          authService.onAuthStateChange(async (event, session) => {
            await this._handleAuthStateChange(event, session)
          })
          
          this.isInitialized = true
          resolve() // Résoudre la promesse après succès
        } catch (error) {
          this.handleError(error, 'Failed to initialize authentication')
          // Ne pas rejeter, laisser la fonction se terminer pour que le flag soit désactivé
          resolve() 
        } finally {
          this.setLoading(false) 
        }
      })
      
      return initializationPromise
    },

    async ensureInitialized(): Promise<void> {
      if (this.isInitialized) {
          return
      }
      await this.initialize()
    },

    // ==========================================
    // Authentication Actions (Calls Service API)
    // ==========================================

    /**
     * Sign up new user with Magic Link
     */
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
          metadata: { ...data, isSignUp: true } // Pass metadata to server
        })

        if (response.success) {
          // Success message handled by useAuth composable/UI layer
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
     * Sign in existing user with Magic Link
     */
    async signInWithMagicLink(email: string): Promise<void> {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await authService.sendMagicLink({
          email,
          metadata: { isSignUp: false } 
        })

        if (response.success) {
          // Success message handled by useAuth composable/UI layer
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
     * Initiates Google OAuth flow (via server API)
     */
    async signInWithGoogle(): Promise<void> {
      this.setLoading(true)
      this.clearError()

      try {
        const response = await authService.initiateGoogleSignIn()

        if (response.success && response.data?.redirectTo) {
          // 💥 BUSINESS LOGIC: Perform the redirect on the client
          window.location.href = response.data.redirectTo
        } else {
          throw new Error(response.error || 'Failed to initiate Google sign in')
        }
      } catch (error) {
        this.handleError(error, 'Google sign in failed')
        throw error
      } finally {
        // Loading flag reset by the browser redirect, but set here defensively
        this.setLoading(false)
      }
    },

    /**
     * Sign out current user (calls service to clear session, then clears state)
     */
    async signOut(): Promise<void> {
      this.setLoading(true)

      try {
        // 💥 API CALL: Clears client-side session storage/cookies
        await authService.signOut()
        
        this.clearAuthState()
        
        // 💥 BUSINESS LOGIC: Redirect after sign out
        await navigateTo('/auth/login')

      } catch (error) {
        this.handleError(error, 'Sign out failed')
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

        if (response.success && response.data?.user) {
          this.profile = response.data.user
        } else {
          // If no profile (user exists but row deleted/not created yet)
          this.profile = null 
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
    async updateProfile(updates: Record<string, any>): Promise<void> {
      if (!this.isAuthenticated) {
        throw new AuthenticationError('Must be authenticated to update profile')
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
    requireAuth(): void {
      if (!this.isAuthenticated) {
        throw new AuthenticationError('Authentication required')
      }
    },

    requireAdmin(): void {
      this.requireAuth()
      if (!this.isAdmin) {
        throw new AuthorizationError('Admin access required')
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
        { userId: this.user?.id, context, timestamp: new Date().toISOString() }
      )
      const { $toast } = useNuxtApp()
      if ($toast) { $toast.error(errorMessage) }
    },
  }
})
