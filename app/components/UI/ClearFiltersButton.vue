<template>
  <UIButton
    @click="$emit('clear')"
    :variant="variant"
    :size="size"
    :disabled="disabled"
    :class="buttonClass"
    type="button"
  >
    <Icon name="heroicons:x-mark" :class="iconClass" />
    {{ label }}
  </UIButton>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  variant?: 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  block?: boolean
}

interface Emits {
  (e: 'clear'): void
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Clear Filters',
  variant: 'secondary',
  size: 'md',
  disabled: false,
  block: false
})

defineEmits<Emits>()

const buttonClass = computed(() => {
  return props.block ? 'w-full' : ''
})

const iconClass = computed(() => {
  const sizeClasses = {
    sm: 'w-3 h-3 mr-1.5',
    md: 'w-4 h-4 mr-2',
    lg: 'w-5 h-5 mr-2'
  }
  return sizeClasses[props.size]
})
</script>