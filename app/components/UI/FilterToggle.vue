<template>
  <label :class="labelClass" :aria-disabled="disabled">
    <input
      v-model="localValue"
      @change="handleChange"
      type="checkbox"
      :class="checkboxClass"
      :disabled="disabled"
    >
    <span :class="textClass">{{ label }}</span>
  </label>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'rounded', 'minimal'].includes(value)
  }
})

const emit = defineEmits(['update'])

const localValue = ref(props.modelValue)

const labelClass = computed(() => {
  const baseClasses = 'flex items-center space-x-2 cursor-pointer bg-white border border-gray-300 flex-shrink-0'

  const sizeClasses = {
    sm: 'px-2 py-1.5',
    md: 'px-3 py-2.5',
    lg: 'px-4 py-3'
  }

  const variantClasses = {
    default: 'rounded-lg',
    rounded: 'rounded-xl',
    minimal: 'rounded-md border-gray-200 bg-gray-50'
  }

  const disabledClasses = props.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'

  return `${baseClasses} ${sizeClasses[props.size]} ${variantClasses[props.variant]} ${disabledClasses}`
})

const checkboxClass = computed(() => {
  return 'text-brand-sage focus:ring-brand-sage rounded border-gray-300'
})

const textClass = computed(() => {
  const sizeClasses = {
    sm: 'text-xs text-gray-700',
    md: 'text-sm text-gray-700',
    lg: 'text-base text-gray-700'
  }
  return sizeClasses[props.size]
})

const handleChange = () => {
  emit('update', localValue.value)
}

watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue
})
</script>