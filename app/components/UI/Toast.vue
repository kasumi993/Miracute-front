<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="transform translate-x-full opacity-0"
        enter-to-class="transform translate-x-0 opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="transform translate-x-0 opacity-100"
        leave-to-class="transform translate-x-full opacity-0"
      >
        <div
          v-for="toast in toasts.value"
          :key="toast.id"
          :class="[
            'max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden',
            getToastClasses(toast.type)
          ]"
        >
          <div class="p-4">
            <div class="flex items-start">
              <div class="flex-shrink-0">
                <Icon :name="getToastIcon(toast.type)" 
                      :class="getIconClasses(toast.type)" 
                      class="w-5 h-5" />
              </div>
              
              <div class="ml-3 w-0 flex-1 pt-0.5">
                <p :class="getTextClasses(toast.type)" 
                   class="text-sm font-medium">
                  {{ toast.message }}
                </p>
              </div>
              
              <div v-if="toast.closable" class="ml-4 flex-shrink-0 flex">
                <button @click="remove(toast.id)"
                        :class="getCloseButtonClasses(toast.type)"
                        class="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2">
                  <span class="sr-only">Close</span>
                  <Icon name="heroicons:x-mark" class="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts, remove } = useToast()

const getToastClasses = (type: string) => {
  const classes = {
    success: 'bg-green-50 border border-green-200',
    error: 'bg-red-50 border border-red-200',
    warning: 'bg-yellow-50 border border-yellow-200',
    info: 'bg-blue-50 border border-blue-200'
  }
  return classes[type] || classes.info
}

const getToastIcon = (type: string) => {
  const icons = {
    success: 'heroicons:check-circle',
    error: 'heroicons:exclamation-circle',
    warning: 'heroicons:exclamation-triangle',
    info: 'heroicons:information-circle'
  }
  return icons[type] || icons.info
}

const getIconClasses = (type: string) => {
  const classes = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400'
  }
  return classes[type] || classes.info
}

const getTextClasses = (type: string) => {
  const classes = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  }
  return classes[type] || classes.info
}

const getCloseButtonClasses = (type: string) => {
  const classes = {
    success: 'text-green-400 hover:text-green-600 focus:ring-green-500',
    error: 'text-red-400 hover:text-red-600 focus:ring-red-500',
    warning: 'text-yellow-400 hover:text-yellow-600 focus:ring-yellow-500',
    info: 'text-blue-400 hover:text-blue-600 focus:ring-blue-500'
  }
  return classes[type] || classes.info
}
</script>