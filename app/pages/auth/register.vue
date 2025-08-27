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
            width="40" 
            height="40" 
            class="w-10 h-10"
          />
          <span class="text-3xl font-heading font-medium text-gray-900">miracute</span>
        </NuxtLink>
        
        <h2 class="text-2xl font-heading font-medium text-gray-900">Create your account</h2>
        <p class="mt-2 text-gray-600">Join thousands of happy customers</p>
      </div>

      <!-- Registration Form -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Full Name -->
          <div>
            <label for="fullName" class="form-label">Full name</label>
            <input
              id="fullName"
              v-model="form.fullName"
              type="text"
              autocomplete="name"
              required
              :class="[
                'form-input',
                errors.fullName ? 'border-red-500 focus:ring-red-500' : 'focus:ring-brand-sage'
              ]"
              placeholder="Enter your full name"
            >
            <p v-if="errors.fullName" class="mt-1 text-sm text-red-600">{{ errors.fullName }}</p>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="form-label">Email address</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              required
              :class="[
                'form-input',
                errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-brand-sage'
              ]"
              placeholder="Enter your email"
            >
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="form-label">Password</label>
            <div class="relative">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                required
                :class="[
                  'form-input pr-10',
                  errors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-brand-sage'
                ]"
                placeholder="Create a password"
              >
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Icon 
                  :name="showPassword ? 'heroicons:eye-slash' : 'heroicons:eye'"
                  class="h-5 w-5 text-gray-400 hover:text-gray-500"
                />
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
            
            <!-- Password strength indicator -->
            <div class="mt-2">
              <div class="flex space-x-1">
                <div :class="[
                  'h-1 flex-1 rounded',
                  passwordStrength >= 1 ? 'bg-red-500' : 'bg-gray-200'
                ]"></div>
                <div :class="[
                  'h-1 flex-1 rounded',
                  passwordStrength >= 2 ? 'bg-yellow-500' : 'bg-gray-200'
                ]"></div>
                <div :class="[
                  'h-1 flex-1 rounded',
                  passwordStrength >= 3 ? 'bg-green-500' : 'bg-gray-200'
                ]"></div>
              </div>
              <p class="text-xs text-gray-600 mt-1">
                {{ passwordStrengthText }}
              </p>
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="form-label">Confirm password</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              :class="[
                'form-input',
                errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'focus:ring-brand-sage'
              ]"
              placeholder="Confirm your password"
            >
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
          </div>

          <!-- Terms and Privacy -->
          <div class="space-y-3">
            <label class="flex items-start space-x-2">
              <input
                v-model="form.agreeToTerms"
                type="checkbox"
                required
                class="h-4 w-4 text-brand-sage focus:ring-brand-sage border-gray-300 rounded mt-0.5"
              >
              <span class="text-sm text-gray-700">
                I agree to the 
                <NuxtLink to="/terms" class="text-brand-brown hover:text-brand-brown/80 font-medium">
                  Terms of Service
                </NuxtLink>
                and 
                <NuxtLink to="/privacy" class="text-brand-brown hover:text-brand-brown/80 font-medium">
                  Privacy Policy
                </NuxtLink>
              </span>
            </label>

            <label class="flex items-start space-x-2">
              <input
                v-model="form.subscribeNewsletter"
                type="checkbox"
                class="h-4 w-4 text-brand-sage focus:ring-brand-sage border-gray-300 rounded mt-0.5"
              >
              <span class="text-sm text-gray-700">
                Send me updates about new templates and design tips
              </span>
            </label>
          </div>

          <!-- Error Message -->
          <div v-if="auth.error.value" 
               class="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center space-x-2">
              <Icon name="heroicons:exclamation-circle" class="w-5 h-5 text-red-500" />
              <p class="text-sm text-red-700">{{ auth.error.value }}</p>
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="auth.isLoading.value || !form.agreeToTerms"
            class="btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!auth.isLoading.value">Create account</span>
            <span v-else class="flex items-center justify-center space-x-2">
              <Icon name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
              <span>Creating account...</span>
            </span>
          </button>
        </form>

        <!-- Divider -->
        <div class="mt-8">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <!-- Social Registration Buttons -->
          <div class="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              class="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>

            <button
              type="button"
              class="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Icon name="heroicons:envelope" class="w-5 h-5 mr-2" />
              Magic Link
            </button>
          </div>
        </div>
      </div>

      <!-- Sign In Link -->
      <div class="text-center">
        <p class="text-gray-600">
          Already have an account?
          <NuxtLink to="/auth/login" class="font-medium text-brand-brown hover:text-brand-brown/80 ml-1">
            Sign in
          </NuxtLink>
        </p>
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
  title: 'Sign Up | Miracute',
  description: 'Create a Miracute account to access beautiful website templates and manage your digital downloads.',
  robots: 'noindex, nofollow'
})

// Composables
const auth = useAuth()
const route = useRoute()

// Form state
const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
  subscribeNewsletter: true
})

const showPassword = ref(false)
const errors = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Password strength
const passwordStrength = computed(() => {
  const password = form.password
  let strength = 0
  
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++
  
  return Math.min(3, Math.floor(strength / 2))
})

const passwordStrengthText = computed(() => {
  switch (passwordStrength.value) {
    case 0: return 'Too weak'
    case 1: return 'Weak'
    case 2: return 'Good'
    case 3: return 'Strong'
    default: return ''
  }
})

// Methods
const validateForm = () => {
  // Clear previous errors
  errors.fullName = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  
  let isValid = true

  // Full name validation
  if (!form.fullName.trim()) {
    errors.fullName = 'Full name is required'
    isValid = false
  } else if (form.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters'
    isValid = false
  }

  // Email validation
  if (!form.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  // Password validation
  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
    isValid = false
  } else if (passwordStrength.value < 2) {
    errors.password = 'Password is too weak. Use a mix of letters, numbers, and symbols.'
    isValid = false
  }

  // Confirm password validation
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  // Clear auth errors
  auth.clearError()
  
  if (!validateForm()) {
    return
  }

  try {
    await auth.signUp(form.email, form.password, form.fullName)
    
    // Success - redirect to intended page or welcome
    const redirect = route.query.redirect
    const destination = redirect && redirect.startsWith('/') ? redirect : '/account'
    
    await navigateTo(destination)
    
    useToast().success('Welcome to Miracute! Please check your email to confirm your account.')
    
  } catch (error) {
    // Handle specific errors
    if (error.message?.includes('already registered')) {
      errors.email = 'An account with this email already exists'
    }
    console.error('Registration failed:', error)
  }
}

// Auto-focus full name input
onMounted(() => {
  const nameInput = document.getElementById('fullName')
  if (nameInput) {
    nameInput.focus()
  }
})
</script>