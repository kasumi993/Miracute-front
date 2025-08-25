<template>
  <component
    :is="tag"
    :to="to"
    :href="href"
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <Icon v-if="icon && !iconRight" :name="icon" :class="iconClasses" />
    <Loading v-if="loading" class="w-4 h-4" />
    <span v-if="$slots.default" :class="{ 'sr-only': loading }">
      <slot />
    </span>
    <Icon v-if="icon && iconRight" :name="icon" :class="iconClasses" />
  </component>
</template>

<script setup lang="ts">
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  to?: string
  href?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  icon?: string
  iconRight?: boolean
  block?: boolean
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  iconRight: false,
  block: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const tag = computed(() => {
  if (props.to) return resolveComponent('NuxtLink')
  if (props.href) return 'a'
  return 'button'
})

const buttonClasses = computed(() => {
  const classes = [
    'inline-flex items-center justify-center font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ]

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
    md: 'px-4 py-2 text-base rounded-lg gap-2',
    lg: 'px-6 py-3 text-lg rounded-lg gap-2'
  }
  classes.push(sizeClasses[props.size])

  // Variant classes
  const variantClasses = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
    secondary: 'border-2 border-gray-900 text-gray-900 bg-white hover:bg-gray-900 hover:text-white focus:ring-gray-500',
    soft: 'bg-brand-pink text-gray-900 hover:shadow-md transform hover:-translate-y-0.5 focus:ring-pink-300',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg'
  }
  classes.push(variantClasses[props.variant])

  // Block class
  if (props.block) {
    classes.push('w-full')
  }

  return classes.join(' ')
})

const iconClasses = computed(() => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  return sizeMap[props.size]
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>