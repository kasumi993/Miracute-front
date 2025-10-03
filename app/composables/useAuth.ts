// Unified authentication composable - single source of truth for auth state
import { useUserStore } from '~/stores/auth/user'

export const useAuth = () => {
  const userStore = useUserStore()

  return {
    // Computed properties - always use store state for reactivity
    user: computed(() => userStore.currentProfile), // Primary profile data
    authUser: computed(() => userStore.currentUser), // Raw Supabase user data
    isAuthenticated: computed(() => userStore.isAuthenticatedAndValid),
    isAdmin: computed(() => userStore.isAdmin),
    isLoading: computed(() => userStore.isCurrentlyLoading),
    authError: computed(() => userStore.error),

    // User display helpers (delegated to getters for optimized computation)
    userInitials: computed(() => userStore.initials),
    displayName: computed(() => userStore.displayName),

    // Methods - delegate all state-changing and API logic to the store
    initialize: () => userStore.initialize(),
    fetchProfile: () => userStore.fetchProfile(),
    updateProfile: (data: Record<string, unknown>) => userStore.updateProfile(data),

    // Auth actions - delegate to store actions which handle API, state, and redirects
    async signUpWithMagicLink(data: { email: string, firstName?: string, lastName?: string, marketingOptIn?: boolean }) {
      await userStore.signUp(data)
    },
    async signInWithMagicLink(email: string) {
      await userStore.signInWithMagicLink(email)
    },
    async signInWithGoogle() {
      // The store handles the API call to get the redirect URL and navigates the browser
      await userStore.signInWithGoogle()
    },
    signOut: () => userStore.signOut(),

    // Admin helpers - use store methods which contain the necessary logic
    requireAdmin: () => userStore.requireAdmin(),

    // Auth guards for components
    requireAuth: () => userStore.requireAuth(),
  }
}
