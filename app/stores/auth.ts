import { defineStore } from 'pinia'
import type { User } from '@supabase/supabase-js'
import type { Database } from '~/types/database'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    profile: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.profile?.role === 'admin',
    fullName: (state) => {
      if (!state.profile) {return null}
      const { first_name, last_name } = state.profile
      if (first_name && last_name) {return `${first_name} ${last_name}`}
      return first_name || last_name || state.user?.email || 'User'
    }
  },

  actions: {
    setUser(user: User | null) {
      this.user = user
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

    async fetchProfile() {
      if (!this.user) {return}

      this.setLoading(true)
      this.setError(null)

      try {
        const supabase = useSupabaseClient<Database>()
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', this.user.id)
          .single()

        if (error) {throw error}
        this.setProfile(data)
      } catch (error: any) {
        console.error('Error fetching user profile:', error)
        this.setError('Failed to fetch user profile')
      } finally {
        this.setLoading(false)
      }
    },

    async updateProfile(updates: Partial<UserProfile>) {
      if (!this.user || !this.profile) {return}

      this.setLoading(true)
      this.setError(null)

      try {
        const supabase = useSupabaseClient<Database>()
        const { data, error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', this.user.id)
          .select()
          .single()

        if (error) {throw error}
        this.setProfile(data)
        return data
      } catch (error: any) {
        console.error('Error updating profile:', error)
        this.setError('Failed to update profile')
        throw error
      } finally {
        this.setLoading(false)
      }
    },

    async signOut() {
      try {
        const supabase = useSupabaseClient()
        await supabase.auth.signOut()
        this.setUser(null)
        this.setProfile(null)
        await navigateTo('/auth/login')
      } catch (error: any) {
        console.error('Error signing out:', error)
        this.setError('Failed to sign out')
      }
    },

    clearError() {
      this.setError(null)
    },

    reset() {
      this.user = null
      this.profile = null
      this.loading = false
      this.error = null
    }
  }
})
