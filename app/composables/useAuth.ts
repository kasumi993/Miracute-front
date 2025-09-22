// Unified authentication composable - single source of truth for auth state
import { useUserStore } from '~/stores/auth/user'

export const useAuth = () => {
  const userStore = useUserStore()
  const supabaseUser = useSupabaseUser()
  const supabase = useSupabaseClient()

  return {
    // Computed properties - always use store state
    user: computed(() => userStore.profile),
    authUser: computed(() => supabaseUser.value),
    isAuthenticated: computed(() => userStore.isAuthenticated),
    isAdmin: computed(() => userStore.isAdmin),
    isLoading: computed(() => userStore.loading.profile),

    // User display helpers
    userInitials: computed(() => {
      const profile = userStore.profile
      if (!profile) {
        return 'U'
      }

      if (profile.first_name && profile.last_name) {
        return `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase()
      }

      if (profile.first_name) {
        return profile.first_name.charAt(0).toUpperCase()
      }

      return supabaseUser.value?.email?.charAt(0).toUpperCase() || 'U'
    }),

    displayName: computed(() => {
      const profile = userStore.profile
      if (!profile) {
        return supabaseUser.value?.email || 'User'
      }

      if (profile.first_name && profile.last_name) {
        return `${profile.first_name} ${profile.last_name}`
      }

      return profile.first_name || supabaseUser.value?.email || 'User'
    }),

    // Methods - delegate to store
    initialize: () => userStore.initialize(),
    fetchProfile: () => userStore.fetchProfile(),
    updateProfile: (data: Record<string, unknown>) => userStore.updateProfile(data),

    // Auth actions
    signOut: async () => {
      try {
        await supabase.auth.signOut()
        userStore.reset()
        await navigateTo('/auth/login')
        return { success: true }
      } catch (error: unknown) {
        console.error('Sign out error:', error)
        return { success: false, error: (error as Error).message }
      }
    },

    // Admin helpers
    requireAdmin: () => {
      if (!userStore.isAdmin) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Admin access required'
        })
      }
    },

    // Auth guards for components
    requireAuth: () => {
      if (!userStore.isAuthenticated) {
        throw createError({
          statusCode: 401,
          statusMessage: 'Authentication required'
        })
      }
    }
  }
}