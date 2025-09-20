<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <Icon name="heroicons:exclamation-triangle" class="h-6 w-6 text-red-600" />
          </div>

          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            {{ getErrorTitle() }}
          </h2>

          <p class="text-gray-600 mb-6">
            {{ getErrorMessage() }}
          </p>

          <div class="space-y-3">
            <Button
              @click="handleError"
              class="w-full"
              variant="primary"
            >
              {{ getRetryText() }}
            </Button>

            <Button
              @click="goHome"
              class="w-full"
              variant="ghost"
            >
              Go to Homepage
            </Button>
          </div>

          <details v-if="isDev && error" class="mt-6 text-left">
            <summary class="text-sm text-gray-500 cursor-pointer">
              Error Details (Development)
            </summary>
            <div class="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
              <div><strong>Status:</strong> {{ error.statusCode }}</div>
              <div><strong>Message:</strong> {{ error.statusMessage }}</div>
              <div v-if="error.stack"><strong>Stack:</strong></div>
              <pre v-if="error.stack" class="whitespace-pre-wrap">{{ error.stack }}</pre>
            </div>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface NuxtError {
  statusCode: number
  statusMessage: string
  stack?: string
  data?: any
}

const props = defineProps<{
  error: NuxtError
}>()

const isDev = process.dev

const getErrorTitle = () => {
  switch (props.error.statusCode) {
    case 404:
      return 'Page Not Found'
    case 403:
      return 'Access Forbidden'
    case 500:
      return 'Server Error'
    default:
      return 'Something went wrong'
  }
}

const getErrorMessage = () => {
  switch (props.error.statusCode) {
    case 404:
      return "The page you're looking for doesn't exist or has been moved."
    case 403:
      return "You don't have permission to access this page."
    case 500:
      return "We're experiencing technical difficulties. Please try again later."
    default:
      return "An unexpected error occurred. We're working to fix it."
  }
}

const getRetryText = () => {
  switch (props.error.statusCode) {
    case 404:
      return 'Go Back'
    case 403:
      return 'Sign In'
    default:
      return 'Try Again'
  }
}

const handleError = () => {
  if (props.error.statusCode === 404) {
    // Go back or to home
    if (window.history.length > 1) {
      window.history.back()
    } else {
      goHome()
    }
  } else if (props.error.statusCode === 403) {
    // Redirect to login
    navigateTo('/auth/login')
  } else {
    // Reload page
    window.location.reload()
  }
}

const goHome = () => {
  navigateTo('/')
}

// Clear error on unmount to prevent error state persistence
onUnmounted(() => {
  clearError()
})
</script>