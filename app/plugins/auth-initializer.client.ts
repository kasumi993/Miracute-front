import { useUserStore } from '~/stores/auth/user'

/**
 * Client-side plugin that initializes the authentication store on app startup.
 * This ensures auth state is available to components and middleware without
 * requiring manual initialization calls.
 */
export default defineNuxtPlugin(async () => {
  const userStore = useUserStore()

  // Initialize auth state - the store method handles initialization checks internally
  await userStore.loadAuthState()
})