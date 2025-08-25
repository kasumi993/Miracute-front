<template>
  <div :class="containerClasses">
    <div v-if="variant === 'spinner'" :class="spinnerClasses" />
    <div v-else-if="variant === 'dots'" class="flex space-x-1">
      <div
        v-for="i in 3"
        :key="i"
        :class="dotClasses"
        :style="{ animationDelay: `${(i - 1) * 0.15}s` }"
      />
    </div>
    <div v-else-if="variant === 'pulse'" :class="pulseClasses" />
    <div v-else-if="variant === 'bars'" class="flex space-x-1">
      <div
        v-for="i in 4"
        :key="i"
        :class="barClasses"
        :style="{ animationDelay: `${(i - 1) * 0.1}s` }"
      />
    </div>
    
    <span v-if="text" :class="textClasses">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  color?: 'primary' | 'white' | 'gray'
  center?: boolean
}

const props = withDefaults(defineProps<LoadingProps>(), {
  variant: 'spinner',
  size: 'md',
  color: 'primary',
  center: false
})

const sizeMap = {
  sm: { width: 'w-4 h-4', text: 'text-sm' },
  md: { width: 'w-6 h-6', text: 'text-base' },
  lg: { width: 'w-8 h-8', text: 'text-lg' },
  xl: { width: 'w-12 h-12', text: 'text-xl' }
}

const colorMap = {
  primary: 'border-gray-900',
  white: 'border-white',
  gray: 'border-gray-500'
}

const containerClasses = computed(() => {
  const classes = ['flex items-center']
  
  if (props.center) {
    classes.push('justify-center')
  }
  
  if (props.text) {
    classes.push('gap-3')
  }
  
  return classes.join(' ')
})

const spinnerClasses = computed(() => {
  const classes = [
    'animate-spin rounded-full border-2 border-transparent',
    sizeMap[props.size].width
  ]
  
  if (props.color === 'primary') {
    classes.push('border-t-gray-900 border-r-gray-900')
  } else if (props.color === 'white') {
    classes.push('border-t-white border-r-white')
  } else {
    classes.push('border-t-gray-500 border-r-gray-500')
  }
  
  return classes.join(' ')
})

const dotClasses = computed(() => {
  const baseSize = props.size === 'sm' ? 'w-2 h-2' : props.size === 'md' ? 'w-3 h-3' : props.size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
  
  return [
    'rounded-full animate-pulse',
    baseSize,
    props.color === 'primary' ? 'bg-gray-900' : props.color === 'white' ? 'bg-white' : 'bg-gray-500'
  ].join(' ')
})

const pulseClasses = computed(() => {
  return [
    'animate-pulse rounded',
    sizeMap[props.size].width,
    props.color === 'primary' ? 'bg-gray-900' : props.color === 'white' ? 'bg-white' : 'bg-gray-500'
  ].join(' ')
})

const barClasses = computed(() => {
  const width = props.size === 'sm' ? 'w-1' : props.size === 'md' ? 'w-1.5' : props.size === 'lg' ? 'w-2' : 'w-2.5'
  const height = props.size === 'sm' ? 'h-6' : props.size === 'md' ? 'h-8' : props.size === 'lg' ? 'h-10' : 'h-12'
  
  return [
    'animate-bounce rounded-sm',
    width,
    height,
    props.color === 'primary' ? 'bg-gray-900' : props.color === 'white' ? 'bg-white' : 'bg-gray-500'
  ].join(' ')
})

const textClasses = computed(() => {
  return [
    'font-medium',
    sizeMap[props.size].text,
    props.color === 'primary' ? 'text-gray-900' : props.color === 'white' ? 'text-white' : 'text-gray-500'
  ].join(' ')
})
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
</style>