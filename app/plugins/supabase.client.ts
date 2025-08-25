export default defineNuxtPlugin(async () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Handle auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      // User signed in
      console.log('User signed in:', session?.user?.email)
    } else if (event === 'SIGNED_OUT') {
      // User signed out - clear any cached data
      console.log('User signed out')
      
      // Clear cart for guest users (cart will be saved to localStorage)
      // The cart composable handles this automatically
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('Token refreshed')
    }
  })

  // Initialize any client-side functionality
  if (process.client) {
    // You can add any client-side initialization here
    
    // For example, check if user needs to update their profile
    if (user.value && !user.value.user_metadata?.full_name) {
      // Could show a prompt to complete profile
    }
  }
})