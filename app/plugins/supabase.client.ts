export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN') {
      // User signed in
    } else if (event === 'SIGNED_OUT') {
      // User signed out
    } else if (event === 'TOKEN_REFRESHED') {
      // Token refreshed
    }
  })

  if (import.meta.client) {
    if (user.value && !user.value.user_metadata?.full_name) {
      // Could show a prompt to complete profile
    }
  }
})