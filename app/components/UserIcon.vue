<template>
  <div
    :class="[
      'rounded-full flex items-center justify-center text-sm font-medium',
      sizeClasses,
      colorClasses,
      { 'animate-pulse': isLoading }
    ]"
  >
    <template v-if="isLoading">
      <!-- Loading skeleton -->
      <div class="w-full h-full bg-gray-300 rounded-full"></div>
    </template>
    <template v-else>
      <!-- User initials -->
      {{ initials }}
    </template>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** User initials to display */
  initials?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Color variant */
  variant?: 'pink' | 'brown' | 'gray'
  /** Loading state */
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initials: '',
  size: 'md',
  variant: 'pink',
  isLoading: false
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-6 h-6 text-xs'
    case 'lg':
      return 'w-10 h-10 text-base'
    default:
      return 'w-8 h-8 text-sm'
  }
})

const colorClasses = computed(() => {
  if (props.isLoading) {
    return 'bg-gray-200'
  }

  switch (props.variant) {
    case 'brown':
      return 'bg-brand-brown text-white'
    case 'gray':
      return 'bg-gray-500 text-white'
    default:
      return 'bg-brand-pink text-gray-700'
  }
})
</script>