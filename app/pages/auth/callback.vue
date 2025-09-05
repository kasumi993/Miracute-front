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

      <!-- Success State -->
      <div v-else-if="isSuccess" class="space-y-6">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <Icon name="heroicons:check" class="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h1 class="text-2xl font-heading font-medium text-gray-900 mb-2">
            Sign In Successful!
          </h1>
          <p class="text-gray-600">Redirecting you now...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="space-y-6">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <Icon name="heroicons:exclamation-triangle" class="w-8 h-8 text-red-600" />
        </div>
        <div>
          <h1 class="text-2xl font-heading font-medium text-gray-900 mb-2">
            Magic Link Issue
          </h1>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          
          <!-- Quick Re-send Form -->
          <div v-if="showResendForm" class="bg-white p-6 rounded-lg border border-gray-200 mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Request a New Magic Link</h3>
            <form @submit.prevent="resendMagicLink" class="space-y-4">
              <div>
                <label for="retry-email" class="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="retry-email"
                  v-model="retryEmail"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-sage focus:border-brand-sage"
                  placeholder="Enter your email"
                >
              </div>
              <div class="flex space-x-3">
                <button
                  type="submit"
                  :disabled="isResending"
                  class="flex-1 bg-brand-sage text-white px-4 py-2 rounded-lg hover:bg-brand-sage-dark disabled:opacity-50"
                >
                  <span v-if="!isResending">Send New Link</span>
                  <span v-else class="flex items-center justify-center">
                    <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin mr-2" />
                    Sending...
                  </span>
                </button>
                <button
                  type="button"
                  @click="showResendForm = false"
                  class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
            
            <div v-if="resendSuccess" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-sm text-green-800">✓ New magic link sent! Check your email.</p>
            </div>
            <div v-if="resendError" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-800">{{ resendError }}</p>
            </div>
          </div>
          
          <div class="space-y-3">
            <button
              v-if="!showResendForm"
              @click="showQuickResend"
              class="btn-primary w-full"
            >
              <Icon name="heroicons:envelope" class="w-4 h-4 mr-2" />
              Send New Magic Link
            </button>
            
            <NuxtLink to="/auth/login" class="block w-full text-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Go to Login Page
            </NuxtLink>
            
            <NuxtLink to="/" class="block text-sm text-gray-500 hover:text-gray-700 text-center">
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
const isSuccess = ref(false)
const error = ref('')
const showResendForm = ref(false)
const retryEmail = ref('')
const isResending = ref(false)
const resendSuccess = ref(false)
const resendError = ref('')

// State to prevent duplicate redirects
const hasRedirected = ref(false)

// Handle authentication callback
const handleCallback = async () => {
  if (hasRedirected.value) {
    console.log('Already redirected, skipping callback handler')
    return
  }

  try {
    console.log('Starting auth callback handler...')
    console.log('Current URL:', window.location.href)
    
    // Check if we have auth parameters in URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const queryParams = new URLSearchParams(window.location.search)
    
    const hasAuthParams = hashParams.get('access_token') || 
                         queryParams.get('code') || 
                         hashParams.get('refresh_token')
    
    console.log('Has auth params:', !!hasAuthParams)
    
    if (hasAuthParams) {
      console.log('Found auth tokens in URL, waiting for auth state change...')
      // Let the auth state change listener handle the redirect
      // Just wait here and let Supabase process the tokens
      return
    }
    
    // If no auth params, check current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('Session error:', sessionError)
      throw sessionError
    }

    if (sessionData.session) {
      console.log('Found existing session, redirecting...')
      performRedirect()
    } else {
      // Wait a bit more for potential auth state changes
      setTimeout(() => {
        if (!hasRedirected.value) {
          console.error('Timeout: No authentication session found')
          error.value = 'Authentication failed. The magic link may have expired or been used already. Please request a new one.'
          isLoading.value = false
        }
      }, 3000)
    }

  } catch (err) {
    console.error('Auth callback error:', err)
    if (!hasRedirected.value) {
      error.value = err.message || 'Authentication failed. Please try again.'
      isLoading.value = false
    }
  }
}

// Centralized redirect function
const performRedirect = () => {
  if (hasRedirected.value) {
    console.log('Already redirected, skipping')
    return
  }
  
  hasRedirected.value = true
  console.log('Performing redirect...')
  
  // Update state to show success
  isLoading.value = false
  isSuccess.value = true
  
  const { getRedirectUrl } = useAuthRedirect()
  const redirectTo = getRedirectUrl('/account')
  
  // Small delay to show success state, then redirect
  setTimeout(() => {
    navigateTo(redirectTo, { replace: true })
  }, 800)
}

// Resend magic link functionality
const showQuickResend = () => {
  showResendForm.value = true
  resendSuccess.value = false
  resendError.value = ''
}

const resendMagicLink = async () => {
  if (!retryEmail.value) return
  
  isResending.value = true
  resendError.value = ''
  resendSuccess.value = false
  
  try {
    // Build redirect URL preserving original destination
    // Use localhost in development, production URL in production
    const isDev = process.dev || window.location.hostname === 'localhost'
    const baseUrl = isDev ? window.location.origin : (useRuntimeConfig().public.siteUrl || window.location.origin)
    const redirectUrl = new URL(`${baseUrl}/auth/callback`)
    if (route.query.redirect) {
      redirectUrl.searchParams.set('redirect', route.query.redirect)
    } else if (route.query.next) {
      redirectUrl.searchParams.set('next', route.query.next)
    } else if (route.query.returnTo) {
      redirectUrl.searchParams.set('returnTo', route.query.returnTo)
    }
    
    console.log('Resend - Development mode:', isDev)
    console.log('Resend - Base URL:', baseUrl)

    const { error: resendErr } = await supabase.auth.signInWithOtp({
      email: retryEmail.value,
      options: {
        emailRedirectTo: redirectUrl.toString(),
        shouldCreateUser: true,
        data: {
          timestamp: Date.now(),
          request_id: Math.random().toString(36).substring(2, 15),
          retry: true
        }
      }
    })

    if (resendErr) {
      throw resendErr
    }

    resendSuccess.value = true
    useToast().success('New magic link sent to your email!')
    
  } catch (err) {
    console.error('Resend error:', err)
    resendError.value = err.message || 'Failed to send new magic link'
    useToast().error('Failed to send new magic link')
  } finally {
    isResending.value = false
  }
}

// Initialize callback handling
onMounted(async () => {
  // Wait a bit for the page to fully load and Supabase to initialize
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state change:', event, session?.user?.email)
    
    if (event === 'SIGNED_IN' && session) {
      console.log('User signed in via state change')
      performRedirect()
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out')
      if (!hasRedirected.value) {
        error.value = 'Authentication session expired. Please try again.'
        isLoading.value = false
      }
    }
  })
  
  // Start the main callback handler
  handleCallback()
})
</script>