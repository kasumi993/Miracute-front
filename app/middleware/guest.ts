import { useUserStore } from '~/stores/auth/user' 

/**
 * If user is authenticated, redirect them away from guest-only pages
 */
export default defineNuxtRouteMiddleware(
  async (to) => {
    const userStore = useUserStore()
    await userStore.ensureInitialized() 

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
