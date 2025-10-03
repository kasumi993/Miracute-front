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
  robots: 'noindex, nofollow'
})

const { getRedirectUrl } = useAuthRedirect()

// State
const userStore = useUserStore()
const router = useRouter() 
const toast = useToast()

const isLoading = ref(true)
const isSuccess = ref(false)
const error = ref<string | null>(null)
const showResendForm = ref(false)
const retryEmail = ref('')
const isResending = ref(false)
const resendSuccess = ref(false)
const resendError = ref('')

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
    await authService.sendMagicLink(retryEmail.value)

    resendSuccess.value = true
    toast.success('New magic link sent to your email!')
    
  } catch (err) {
    console.error('Resend error:', err)
    resendError.value = err.message || 'Failed to send new magic link'
    toast.error('Failed to send new magic link')
  } finally {
    isResending.value = false
  }
}

// --- Core Logic ---

const performRedirect = () => {
  isLoading.value = false
  isSuccess.value = true
  
  // Utilise l'URL stockée ou la destination par défaut
  const redirectTarget = getRedirectUrl() || '/account'
  
  // Petit délai pour afficher l'état de succès, puis redirection
  setTimeout(() => {
    router.replace(redirectTarget) 
  }, 800)
}

/**
 * Gère le flux de rappel en se fiant à l'état du store.
 * La gestion des tokens Supabase est effectuée par le Pinia Store/Plugin.
 */
const handleCallback = async () => {
  // 1. Attendre que le store termine son initialisation.
  // Cela permet au store de capter l'événement SIGNED_IN ou de vérifier la session.
  await userStore.ensureInitialized()

  // 2. Vérification de l'état final du store
  if (userStore.isAuthenticatedAndValid) {
    // Si l'utilisateur est valide, on redirige.
    performRedirect()
  } else {
    // Si l'état n'est pas valide après l'initialisation, c'est une erreur de lien.
    error.value = 'Authentication failed. The magic link may have expired or been used already. Please request a new one.'
    isLoading.value = false
  }
}

// --- Initialization ---

// Lance la gestion du rappel dès que le composant est monté et que les composables sont prêts.
handleCallback()
</script>