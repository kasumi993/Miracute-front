import { defineStore } from 'pinia'
import type { User } from '@supabase/supabase-js'
import type { Database } from '~/types/database'
import { AuthService } from '~/services'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  isInitialized: boolean
}

export const useUserStore = defineStore('user', {
  state: (): AuthState => ({
    user: null,
    profile: null,
    loading: false,
    error: null,
    isInitialized: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.profile?.role === 'admin',
    isCustomer: (state) => state.profile?.role === 'customer',

    fullName: (state) => {
      if (!state.profile) return null
      const { first_name, last_name } = state.profile
      if (first_name && last_name) return `${first_name} ${last_name}`
      return first_name || last_name || state.user?.email || 'User'
    },

    initials: (state) => {
      if (!state.profile) return 'U'
      const { first_name, last_name } = state.profile
      if (first_name && last_name) {
        return `${first_name.charAt(0)}${last_name.charAt(0)}`.toUpperCase()
      }
      if (first_name) return first_name.charAt(0).toUpperCase()
      return state.user?.email?.charAt(0).toUpperCase() || 'U'
    },

    userEmail: (state) => state.user?.email || state.profile?.email,

    hasProfile: (state) => !!state.profile,

    userCountry: (state) => state.profile?.country,

    createdAt: (state) => state.profile?.created_at
  },

  actions: {
    // Set user data
    setUser(user: User | null) {
      this.user = user
      if (!user) {
        this.profile = null
      }
    },

    setProfile(profile: UserProfile | null) {
      this.profile = profile
    },

    setLoading(loading: boolean) {
      this.loading = loading
    },

    setError(error: string | null) {
      this.error = error
    },

    setInitialized(initialized: boolean) {
      this.isInitialized = initialized
    },

    // Initialize auth state
    async initialize() {
      if (this.isInitialized) return

      this.setLoading(true)
      try {
        const supabase = useSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          this.setUser(session.user)
          await this.fetchProfile()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        this.setLoading(false)
        this.setInitialized(true)
      }
    },

    // Fetch user profile using AuthService
    async fetchProfile() {
      if (!this.user) return

      this.setLoading(true)
      this.setError(null)

      try {
        const response = await AuthService.getUser()

        if (response.success && response.data?.user) {
          this.setProfile(response.data.user)
        } else {
          throw new Error(response.error || 'Failed to fetch user profile')
        }
      } catch (error: any) {
        console.error('Error fetching user profile:', error)
        this.setError('Failed to fetch user profile')
      } finally {
        this.setLoading(false)
      }
    },

    // Update user profile using AuthService
    async updateProfile(updates: Partial<UserProfile>) {
      if (!this.user || !this.profile) return

      this.setLoading(true)
      this.setError(null)

      try {
        const response = await AuthService.updateUser(updates)

        if (response.success && response.data?.user) {
          this.setProfile(response.data.user)
          return response.data.user
        } else {
          throw new Error(response.error || 'Failed to update profile')
        }
      } catch (error: any) {
        console.error('Error updating profile:', error)
        this.setError('Failed to update profile')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // Create user profile
    async createProfile(userData: {
      user_id: string
      email: string
      first_name?: string
      last_name?: string
      avatar_url?: string
    }) {
      this.setLoading(true)
      this.setError(null)

      try {
        const response = await AuthService.createUserProfile(userData)

        if (response.success && response.data?.user) {
          this.setProfile(response.data.user)
          return response.data.user
        } else {
          throw new Error(response.error || 'Failed to create profile')
        }
      } catch (error: any) {
        console.error('Error creating profile:', error)
        this.setError('Failed to create profile')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    // Sign out
    async signOut() {
      try {
        const supabase = useSupabaseClient()
        await supabase.auth.signOut()
        this.reset()
        await navigateTo('/auth/login')
      } catch (error: any) {
        console.error('Error signing out:', error)
        this.setError('Failed to sign out')
      }
    },

    // Utility methods
    clearError() {
      this.setError(null)
    },

    reset() {
      this.user = null
      this.profile = null
      this.loading = false
      this.error = null
      this.isInitialized = false
    },

    // Check if user has permission
    hasPermission(permission: string): boolean {
      if (!this.profile) return false
      if (this.isAdmin) return true

      // Add permission checking logic here
      return false
    },

    // Check if user can access admin features
    requireAdmin(): boolean {
      if (!this.isAuthenticated) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Authentication required'
        })
      }

      if (!this.isAdmin) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Admin access required'
        })
      }

      return true
    }
  },

})