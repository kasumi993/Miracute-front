<template>
  <Teleport to="body">
    <Transition
      enter-active-class="duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click="handleBackdropClick"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        
        <!-- Modal Container -->
        <div class="flex min-h-screen items-center justify-center p-4">
          <Transition
            enter-active-class="duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to-class="opacity-100 translate-y-0 sm:scale-100"
            leave-active-class="duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0 sm:scale-100"
            leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div
              v-if="modelValue"
              :class="modalClasses"
              @click.stop
            >
              <!-- Header -->
              <div v-if="title || $slots.header || showClose" class="flex items-center justify-between p-6 border-b border-gray-200">
                <div class="flex items-center">
                  <Icon v-if="icon" :name="icon" class="w-6 h-6 mr-3 text-gray-600" />
                  <h3 v-if="title" class="text-lg font-semibold text-gray-900">
                    {{ title }}
                  </h3>
                  <slot name="header" />
                </div>
                
                <button
                  v-if="showClose"
                  type="button"
                  class="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-md p-1"
                  @click="close"
                >
                  <Icon name="heroicons:x-mark" class="w-5 h-5" />
                </button>
              </div>
              
              <!-- Body -->
              <div :class="bodyClasses">
                <slot />
              </div>
              
              <!-- Footer -->
              <div v-if="$slots.footer" class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                <slot name="footer" />
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface ModalProps {
  modelValue: boolean
  title?: string
  icon?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  showClose?: boolean
  persistent?: boolean
}

const props = withDefaults(defineProps<ModalProps>(), {
  size: 'md',
  closable: true,
  showClose: true,
  persistent: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
}>()

const modalClasses = computed(() => {
  const baseClasses = [
    'relative w-full bg-white rounded-lg shadow-xl transform transition-all'
  ]
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-7xl mx-4'
  }
  
  baseClasses.push(sizeClasses[props.size])
  
  return baseClasses.join(' ')
})

const bodyClasses = computed(() => {
  const classes = ['p-6']
  
  if (!props.title && !props.$slots?.header) {
    classes.push('pt-6')
  }
  
  if (!props.$slots?.footer) {
    classes.push('pb-6')
  }
  
  return classes.join(' ')
})

const close = () => {
  if (props.closable) {
    emit('update:modelValue', false)
    emit('close')
  }
}

const handleBackdropClick = () => {
  if (!props.persistent) {
    close()
  }
}

// Handle escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.modelValue && props.closable && !props.persistent) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Prevent body scroll when modal is open
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>