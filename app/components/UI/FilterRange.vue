<template>
  <div class="flex items-center space-x-2" :class="wrapperClass">
    <span v-if="label" :class="labelClass">{{ label }}</span>
    <div class="flex items-center space-x-1">
      <input
        v-model="localMin"
        @input="handleMinChange"
        type="number"
        :placeholder="minPlaceholder"
        :class="inputClass"
        :disabled="disabled"
        :min="min"
        :max="max"
        :step="step"
      >
      <span class="text-gray-400">-</span>
      <input
        v-model="localMax"
        @input="handleMaxChange"
        type="number"
        :placeholder="maxPlaceholder"
        :class="inputClass"
        :disabled="disabled"
        :min="min"
        :max="max"
        :step="step"
      >
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({ min: '', max: '' })
  },
  label: {
    type: String,
    default: ''
  },
  minPlaceholder: {
    type: String,
    default: 'Min'
  },
  maxPlaceholder: {
    type: String,
    default: 'Max'
  },
  min: {
    type: [Number, String],
    default: 0
  },
  max: {
    type: [Number, String],
    default: undefined
  },
  step: {
    type: [Number, String],
    default: 1
  },
  disabled: {
    type: Boolean,
    default: false
  },
  debounceMs: {
    type: Number,
    default: 1000
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

const emit = defineEmits(['update:modelValue', 'change'])

const localMin = ref(props.modelValue.min || '')
const localMax = ref(props.modelValue.max || '')

const wrapperClass = computed(() => 'flex-shrink-0')

const labelClass = computed(() => {
  const sizeClasses = {
    sm: 'text-xs text-gray-600 whitespace-nowrap',
    md: 'text-sm text-gray-600 whitespace-nowrap',
    lg: 'text-base text-gray-600 whitespace-nowrap'
  }
  return sizeClasses[props.size]
})

const inputClass = computed(() => {
  const baseClasses = 'border border-gray-300 focus:ring-2 focus:ring-brand-sage focus:border-transparent text-gray-900'

  const sizeClasses = {
    sm: 'w-14 px-1.5 py-1 text-xs',
    md: 'w-16 px-2 py-2 text-sm',
    lg: 'w-20 px-3 py-2.5 text-base'
  }

  const variantClasses = {
    default: 'rounded-lg',
    rounded: 'rounded-xl',
    minimal: 'rounded-md border-gray-200 bg-gray-50 focus:bg-white'
  }

  const disabledClasses = props.disabled ? 'opacity-50 cursor-not-allowed' : ''

  return `${baseClasses} ${sizeClasses[props.size]} ${variantClasses[props.variant]} ${disabledClasses}`
})

const debouncedEmit = debounce(() => {
  const value = {
    min: localMin.value,
    max: localMax.value
  }
  emit('update:modelValue', value)
  emit('change', value)
}, props.debounceMs)

const handleMinChange = () => {
  debouncedEmit()
}

const handleMaxChange = () => {
  debouncedEmit()
}

watch(() => props.modelValue, (newValue) => {
  localMin.value = newValue.min || ''
  localMax.value = newValue.max || ''
}, { deep: true })

function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}
</script>