<template>
  <div class="bg-gradient-to-r from-brand-brown to-amber-800 rounded-2xl p-8 text-white">
    <div class="max-w-md mx-auto text-center">
      <h3 class="text-2xl font-heading font-medium mb-2">
        Stay in the Loop! ✨
      </h3>
      <p class="text-white/90 mb-6 text-sm">
        Get first access to new templates, exclusive discounts, and design tips straight from the designer.
      </p>
      
      <form @submit.prevent="subscribe" class="space-y-4">
        <div class="flex flex-col sm:flex-row gap-3">
          <input
            v-model="email"
            type="email"
            required
            placeholder="Enter your email address"
            :disabled="isSubmitting"
            class="flex-1 px-4 py-3 rounded-lg border-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white disabled:opacity-50"
          />
          <button
            type="submit"
            :disabled="isSubmitting || !email"
            class="px-6 py-3 bg-white text-brand-brown font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <span v-if="!isSubmitting">Subscribe</span>
            <span v-else class="flex items-center justify-center space-x-2">
              <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
              <span>Subscribing...</span>
            </span>
          </button>
        </div>
        
        <p class="text-xs text-white/70">
          No spam, unsubscribe anytime. We respect your privacy.
        </p>
      </form>
      
      <!-- Success Message -->
      <div v-if="showSuccess" class="mt-4 p-3 bg-green-500 bg-opacity-20 border border-green-300 rounded-lg">
        <p class="text-sm font-medium">
          {{ successMessage }}
        </p>
      </div>
      
      <!-- Error Message -->
      <div v-if="showError" class="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-300 rounded-lg">
        <p class="text-sm font-medium">
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  source?: string
  showTitle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  source: 'newsletter_widget',
  showTitle: true
})

// State
const email = ref('')
const isSubmitting = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Subscribe to newsletter
const subscribe = async () => {
  if (!email.value.trim()) return
  
  isSubmitting.value = true
  showSuccess.value = false
  showError.value = false
  
  try {
    const response = await $fetch('/api/newsletter/subscribe', {
      method: 'POST',
      body: {
        email: email.value.trim(),
        source: props.source
      }
    })
    
    if (response.success) {
      successMessage.value = response.message
      showSuccess.value = true
      email.value = '' // Clear email field
      
      // Hide success message after 8 seconds
      setTimeout(() => {
        showSuccess.value = false
      }, 8000)
      
      // Show toast notification
      useToast().success(response.message)
    } else {
      throw new Error(response.message || 'Subscription failed')
    }
    
  } catch (error: any) {
    console.error('Newsletter subscription error:', error)
    errorMessage.value = error.data?.message || error.message || 'Failed to subscribe. Please try again.'
    showError.value = true
    
    // Hide error message after 8 seconds
    setTimeout(() => {
      showError.value = false
    }, 8000)
    
    // Show toast notification
    useToast().error(errorMessage.value)
  } finally {
    isSubmitting.value = false
  }
}
</script>