<template>
  <div class="min-h-screen bg-neutral-50 flex items-center justify-center">
    <div class="max-w-md w-full text-center">
      <!-- Loading State -->
      <div v-if="isLoading" class="space-y-6">
        <div class="w-16 h-16 bg-brand-sage rounded-full flex items-center justify-center mx-auto">
          <Icon name="heroicons:arrow-path" class="w-8 h-8 text-white animate-spin" />
        </div>
        <div>
          <h1 class="text-2xl font-heading font-medium text-gray-900 mb-2">
            Completing Sign In
          </h1>
          <p class="text-gray-600">Please wait while we redirect you...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="space-y-6">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <Icon name="heroicons:exclamation-triangle" class="w-8 h-8 text-red-600" />
        </div>
        <div>
          <h1 class="text-2xl font-heading font-medium text-gray-900 mb-2">
            Sign In Failed
          </h1>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          <div class="space-y-3">
            <NuxtLink to="/auth/login" class="btn-primary">
              Try Again
            </NuxtLink>
            <NuxtLink to="/" class="block text-sm text-gray-500 hover:text-gray-700">
              Back to Home
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// SEO
useSeoMeta({
  title: 'Completing Sign In | Miracute',
  description: 'Completing your authentication...',
  robots: 'noindex, nofollow'
})

// Composables
const supabase = useSupabaseClient()
const route = useRoute()
const router = useRouter()

// State
const isLoading = ref(true)
const error = ref('')

// Handle authentication callback
const handleCallback = async () => {
  try {
    // Get the session from the URL
    const { data, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      throw authError
    }

    if (!data.session) {
      throw new Error('No session found. Please try signing in again.')
    }

    // Success! Determine where to redirect
    let redirectTo = '/account' // Default fallback

    // Check for redirect parameter in URL
    if (route.query.redirect && typeof route.query.redirect === 'string') {
      redirectTo = route.query.redirect
    }
    // Check for next parameter (common auth pattern)
    else if (route.query.next && typeof route.query.next === 'string') {
      redirectTo = route.query.next
    }
    // Check for returnTo parameter
    else if (route.query.returnTo && typeof route.query.returnTo === 'string') {
      redirectTo = route.query.returnTo
    }

    // Small delay to show loading state, then redirect
    setTimeout(() => {
      navigateTo(redirectTo, { replace: true })
    }, 1500)

  } catch (err) {
    console.error('Auth callback error:', err)
    error.value = err.message || 'Authentication failed. Please try again.'
    isLoading.value = false
  }
}

// Initialize callback handling
onMounted(() => {
  handleCallback()
})
</script>