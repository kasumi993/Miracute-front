// Unified loading and error state management
export const useLoadingState = (key?: string) => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const data = ref<any>(null)

  // Execute async function with loading and error handling
  const execute = async <T>(
    fn: () => Promise<T>,
    options: {
      onSuccess?: (result: T) => void
      onError?: (error: Error) => void
      showErrorToast?: boolean
      successMessage?: string
    } = {}
  ): Promise<T | null> => {
    loading.value = true
    error.value = null

    try {
      const result = await fn()
      data.value = result

      // Handle success
      if (options.onSuccess) {
        options.onSuccess(result)
      }

      if (options.successMessage) {
        useToast().success(options.successMessage)
      }

      return result
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'An error occurred'
      error.value = errorMessage

      // Handle error
      if (options.onError) {
        options.onError(err as Error)
      }

      if (options.showErrorToast !== false) {
        useToast().error(errorMessage)
      }

      console.error(`Loading state error${key ? ` [${key}]` : ''}:`, err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Reset state
  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Set loading state manually
  const setLoading = (state: boolean) => {
    loading.value = state
  }

  // Set error manually
  const setError = (message: string | null) => {
    error.value = message
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    data: readonly(data),
    execute,
    reset,
    clearError,
    setLoading,
    setError
  }
}

// Global loading state for app-wide loading indicators
export const useGlobalLoading = () => {
  const loading = useState('global.loading', () => false)
  const error = useState('global.error', () => null as string | null)

  const setGlobalLoading = (state: boolean) => {
    loading.value = state
  }

  const setGlobalError = (message: string | null) => {
    error.value = message
  }

  const clearGlobalError = () => {
    error.value = null
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    setGlobalLoading,
    setGlobalError,
    clearGlobalError
  }
}