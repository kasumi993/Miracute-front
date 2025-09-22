export default defineNuxtPlugin(async () => {
  const user = useSupabaseUser()

  // Import user store
  const { useUserStore } = await import('~/stores/auth/user')
  const userStore = useUserStore()

  // Initialize user store when client-side
  if (import.meta.client) {
    await userStore.initialize()

    // Watch for user changes and update store
    watch(user, (newUser) => {
      if (newUser) {
        userStore.fetchProfile()
      } else {
        userStore.reset()
      }
    }, { immediate: false })
  }
})
