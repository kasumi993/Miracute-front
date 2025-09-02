<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        @click="handleCancel"
      ></div>
      
      <!-- Modal -->
      <div class="flex min-h-full items-center justify-center p-4">
        <div 
          class="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all"
          @click.stop
        >
          <!-- Icon -->
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full" :class="iconBgClass">
            <Icon :name="iconName" class="h-6 w-6" :class="iconClass" />
          </div>
          
          <!-- Content -->
          <div class="mt-3 text-center">
            <h3 class="text-lg font-medium text-gray-900">
              {{ title }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">
                {{ message }}
              </p>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              @click="handleConfirm"
              type="button"
              :disabled="isLoading"
              class="inline-flex w-full justify-center rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:col-start-2"
              :class="confirmButtonClass"
            >
              <Icon v-if="isLoading" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
              {{ isLoading ? loadingText : confirmText }}
            </button>
            
            <button
              @click="handleCancel"
              type="button"
              :disabled="isLoading"
              class="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50 sm:col-start-1 sm:mt-0"
            >
              {{ cancelText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  loadingText?: string
  isLoading?: boolean
  variant?: 'danger' | 'warning' | 'info'
}

interface Emits {
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Are you sure?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  loadingText: 'Processing...',
  isLoading: false,
  variant: 'danger'
})

const emit = defineEmits<Emits>()

// Computed classes based on variant
const iconName = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'heroicons:exclamation-triangle'
    case 'warning':
      return 'heroicons:exclamation-triangle'
    case 'info':
      return 'heroicons:information-circle'
    default:
      return 'heroicons:exclamation-triangle'
  }
})

const iconBgClass = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'bg-red-100'
    case 'warning':
      return 'bg-yellow-100'
    case 'info':
      return 'bg-blue-100'
    default:
      return 'bg-red-100'
  }
})

const iconClass = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'text-red-600'
    case 'warning':
      return 'text-yellow-600'
    case 'info':
      return 'text-blue-600'
    default:
      return 'text-red-600'
  }
})

const confirmButtonClass = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'bg-red-600 hover:bg-red-500 focus-visible:outline-red-600 disabled:opacity-50'
    case 'warning':
      return 'bg-yellow-600 hover:bg-yellow-500 focus-visible:outline-yellow-600 disabled:opacity-50'
    case 'info':
      return 'bg-blue-600 hover:bg-blue-500 focus-visible:outline-blue-600 disabled:opacity-50'
    default:
      return 'bg-red-600 hover:bg-red-500 focus-visible:outline-red-600 disabled:opacity-50'
  }
})

// Event handlers
const handleConfirm = () => {
  if (!props.isLoading) {
    emit('confirm')
  }
}

const handleCancel = () => {
  if (!props.isLoading) {
    emit('cancel')
    emit('close')
  }
}

// Close modal on Escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen && !props.isLoading) {
    handleCancel()
  }
}

// Add/remove event listener
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', handleKeydown)
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKeydown)
    // Restore body scroll
    document.body.style.overflow = ''
  }
})

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>