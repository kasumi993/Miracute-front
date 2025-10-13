import { useUserStore } from '~/stores/auth/user' 

/**
 * If user is authenticated, redirect them away from guest-only pages
 */
export default defineNuxtRouteMiddleware(
  async (to) => {
    const userStore = useUserStore()
    // Ensure auth state is initialized (fallback if plugin failed)
    if (!userStore.isInitialized) {
      await userStore.loadAuthState()
    }

    if (userStore.isAuthenticatedAndValid) {
      const redirect = to.query.redirect as string
      if (redirect && redirect.startsWith('/')) {
        return navigateTo(redirect)
      }

      // Default redirect to account page
      return navigateTo('/account')
    }
  }
)
