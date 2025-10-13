import { useUserStore } from '~/stores/auth/user'

/**
 * Shared auth state initialization for middleware
 * Returns the user store with guaranteed initialized state
 */
export async function ensureAuthState() {
  const userStore = useUserStore()

  // Ensure auth state is initialized (fallback if plugin failed)
  if (!userStore.isInitialized) {
    await userStore.loadAuthState()
  }

  return userStore
}

/**
 * Check if middleware should run on current environment
 */
export function shouldRunMiddleware(): boolean {
  // Only run on client-side where auth state is available
  return import.meta.client
}