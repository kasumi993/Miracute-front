<template>
  <div class="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Header -->
      <div class="text-center">
        <!-- Logo -->
        <NuxtLink to="/" class="inline-flex items-center space-x-3 mb-8">
          <NuxtImg 
            src="/logo.png" 
            alt="Miracute Logo" 
            width="120"
          />
        </NuxtLink>
        
        <h2 class="text-3xl font-heading font-medium text-gray-900">Welcome to Miracute</h2>
        <p class="mt-2 text-gray-600">Sign in or create an account to access your templates</p>
      </div>

      <!-- Simple Authentication -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <!-- Magic Link Form -->
        <div class="mb-8">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Sign In / Register</h3>
          <p class="text-sm text-gray-600 mb-4">Enter your email to sign in or create a new account</p>
          <form @submit.prevent="sendMagicLink" class="space-y-4">
            <div>
              <label for="email" class="form-label">Email address</label>
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                :class="[
                  'form-input',
                  errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-brand-sage'
                ]"
                placeholder="Enter your email address"
              >
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isLoading" class="flex items-center justify-center space-x-2">
                <Icon name="heroicons:envelope" class="w-5 h-5" />
                <span>Continue with Email</span>
              </span>
              <span v-else class="flex items-center justify-center space-x-2">
                <Icon name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
                <span>Sending...</span>
              </span>
            </button>
          </form>

          <!-- Success Message -->
          <div v-if="showSuccess" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center space-x-2">
              <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-600" />
              <p class="text-sm text-green-800">
                Check your email! We've sent you a secure link to sign in or create your account.
              </p>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center space-x-2">
              <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-red-600" />
              <p class="text-sm text-red-800">{{ errorMessage }}</p>
            </div>
          </div>

          <p class="mt-3 text-sm text-gray-600">
            We'll send you a secure link to access your account instantly. For new users, this will automatically create your account. No password required!
          </p>
          
          <div class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div class="flex items-start space-x-2">
              <Icon name="heroicons:information-circle" class="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div class="text-xs text-blue-800">
                <p class="font-medium">Magic Link Tips:</p>
                <ul class="mt-1 space-y-0.5 text-blue-700">
                  <li>• Click the link directly from your email app</li>
                  <li>• Each link can only be used once</li>
                  <li>• Links expire after 1 hour</li>
                  <li>• Use the same device/browser where possible</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Alternative: Simple Registration -->
        <div class="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex items-start space-x-2">
            <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div class="text-sm text-yellow-800">
              <p class="font-medium">Having trouble with magic links?</p>
              <p class="mt-1">Magic links can be unreliable in development. Try Google sign-in as an alternative.</p>
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <!-- Google Sign In -->
        <div class="mt-8">
          <button
            @click="signInWithGoogle"
            :disabled="isLoading"
            class="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <!-- Info Box -->
        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-start space-x-3">
            <Icon name="heroicons:information-circle" class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div class="text-sm text-blue-800">
              <p class="font-medium mb-1">Why create an account?</p>
              <ul class="text-xs space-y-1 text-blue-700">
                <li>• Access your purchased templates anytime</li>
                <li>• Download your files as many times as needed</li>
                <li>• Manage your newsletter preferences</li>
                <li>• Faster checkout for future purchases</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Back to Home -->
      <div class="text-center">
        <NuxtLink to="/" class="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center space-x-1">
          <Icon name="heroicons:arrow-left" class="w-4 h-4" />
          <span>Back to Miracute</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
// Middleware
definePageMeta({
  middleware: 'guest',
  layout: 'auth'
})

// SEO
useSeoMeta({
  title: 'Access Your Downloads | Miracute',
  description: 'Sign in to access your purchased templates and downloads. Simple authentication with magic link or Google.',
  robots: 'noindex, nofollow'
})

// Composables
const supabase = useSupabaseClient()
const route = useRoute()

// Form state
const email = ref('')
const isLoading = ref(false)
const showSuccess = ref(false)
const errorMessage = ref('')
const errors = reactive({
  email: ''
})

// Methods
const validateEmail = () => {
  errors.email = ''
  
  if (!email.value) {
    errors.email = 'Email is required'
    return false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.email = 'Please enter a valid email address'
    return false
  }

  return true
}

const sendMagicLink = async () => {
  if (!validateEmail()) return

  isLoading.value = true
  errorMessage.value = ''
  showSuccess.value = false

  try {
    // Build redirect URL with original destination
    // Use localhost in development, production URL in production
    const isDev = process.dev || window.location.hostname === 'localhost'
    const baseUrl = isDev ? window.location.origin : (useRuntimeConfig().public.siteUrl || window.location.origin)
    const redirectUrl = new URL(`${baseUrl}/auth/callback`)
    if (route.query.redirect) {
      redirectUrl.searchParams.set('redirect', route.query.redirect)
    }
    
    console.log('Development mode:', isDev)
    console.log('Base URL:', baseUrl)
    console.log('Sending magic link with redirect URL:', redirectUrl.toString())

    const { error } = await supabase.auth.signInWithOtp({
      email: email.value,
      options: {
        emailRedirectTo: redirectUrl.toString(),
        shouldCreateUser: true, // Explicitly allow user creation
        data: {
          timestamp: Date.now(),
          request_id: Math.random().toString(36).substring(2, 15)
        }
      }
    })

    if (error) {
      console.error('Auth error details:', error)
      throw error
    }

    showSuccess.value = true
    useToast().success('Magic link sent to your email!')
    
  } catch (error) {
    console.error('Magic link error:', error)
    
    // Provide more specific error messages
    let errorMsg = 'Failed to send magic link. Please try again.'
    
    if (error.message?.includes('Invalid login credentials')) {
      errorMsg = 'There was an issue with your email. Please check and try again.'
    } else if (error.message?.includes('Email not confirmed')) {
      errorMsg = 'Please check your email and click the confirmation link.'
    } else if (error.message?.includes('Email rate limit exceeded') || error.message?.includes('too_many_requests')) {
      errorMsg = 'Too many requests. Please wait a few minutes before requesting another magic link.'
    } else if (error.message?.includes('Invalid email')) {
      errorMsg = 'Please enter a valid email address.'
    } else if (error.message?.includes('Email sending failed')) {
      errorMsg = 'Email delivery failed. Please check your email address and try again.'
    } else if (error.message) {
      errorMsg = error.message
    }
    
    errorMessage.value = errorMsg
    useToast().error(errorMsg)
  } finally {
    isLoading.value = false
  }
}

const signInWithGoogle = async () => {
  if (isLoading.value) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    // Build redirect URL with original destination
    const redirectUrl = new URL(`${window.location.origin}/auth/callback`)
    if (route.query.redirect) {
      redirectUrl.searchParams.set('redirect', route.query.redirect)
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl.toString()
      }
    })

    if (error) throw error

  } catch (error) {
    console.error('Google sign in error:', error)
    
    let errorMsg = 'Failed to sign in with Google. Please try again.'
    if (error.message) {
      errorMsg = error.message
    }
    
    errorMessage.value = errorMsg
    useToast().error(errorMsg)
    isLoading.value = false
  }
}

// Auto-focus email input
onMounted(() => {
  const emailInput = document.getElementById('email')
  if (emailInput) {
    emailInput.focus()
  }
  
  // Check for error parameters in URL
  const error = route.query.error
  if (error === 'admin-required') {
    errorMessage.value = 'Admin access required. Please sign in with an admin account.'
    useToast().error('Admin access required. Please sign in with an admin account.')
  } else if (error === 'auth-error') {
    errorMessage.value = 'Authentication error occurred. Please try signing in again.'
    useToast().error('Authentication error occurred. Please try signing in again.')
  }
})
</script>