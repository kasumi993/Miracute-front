<template>
  <div v-if="hasError" class="error-boundary">
    <div class="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg border border-red-200">
      <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
        <Icon name="heroicons:exclamation-triangle" class="w-6 h-6 text-red-600" />
      </div>

      <h3 class="text-lg font-medium text-gray-900 text-center mb-2">
        Something went wrong
      </h3>

      <p class="text-sm text-gray-600 text-center mb-6">
        {{ fallbackMessage || "We're sorry, but something unexpected happened. Please try refreshing the page." }}
      </p>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          @click="retry"
          variant="primary"
          size="sm"
        >
          Try Again
        </Button>

        <Button
          @click="goHome"
          variant="ghost"
          size="sm"
        >
          Go Home
        </Button>
      </div>

      <details v-if="showDetails && error" class="mt-4">
        <summary class="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
          Error Details
        </summary>
        <pre class="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-auto max-h-32">{{ error }}</pre>
      </details>
    </div>
  </div>

  <slot v-else />
</template>

<script setup lang="ts">
interface Props {
  fallbackMessage?: string
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fallbackMessage: '',
  showDetails: false
})

const hasError = ref(false)
const error = ref<Error | null>(null)

const retry = () => {
  hasError.value = false
  error.value = null
  nextTick(() => {
    // Force re-render of children
    window.location.reload()
  })
}

const goHome = () => {
  navigateTo('/')
}

// Handle errors from child components
onErrorCaptured((err, instance, info) => {
  console.error('Error captured by boundary:', err)
  console.error('Instance:', instance)
  console.error('Info:', info)

  hasError.value = true
  error.value = err

  // Send to analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'exception', {
      description: err.toString(),
      fatal: false
    })
  }

  // Prevent the error from propagating up
  return false
})
</script>

<style scoped>
.error-boundary {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>