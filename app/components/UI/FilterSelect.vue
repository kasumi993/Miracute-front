<template>
  <div class="relative" :class="wrapperClass">
    <select
      v-model="localValue"
      @change="handleChange"
      :class="selectClass"
      :disabled="disabled"
    >
      <option value="" v-if="placeholder">{{ placeholder }}</option>
      <option
        v-for="option in formattedOptions"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <Icon name="heroicons:chevron-down" :class="iconClass" />
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: ''
  },
  options: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  // Option formatting
  optionValue: {
    type: String,
    default: 'value'
  },
  optionLabel: {
    type: String,
    default: 'label'
  },
  // Styling
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

const localValue = ref(props.modelValue)

const formattedOptions = computed(() => {
  if (!props.options || !Array.isArray(props.options)) {
    return []
  }

  return props.options.map(option => {
    if (typeof option === 'string') {
      return { value: option, label: option }
    }
    if (typeof option === 'object' && option !== null) {
      return {
        value: option[props.optionValue] ?? option.value ?? option.id,
        label: option[props.optionLabel] ?? option.label ?? option.name ?? option.value
      }
    }
    return { value: option, label: String(option) }
  })
})

const wrapperClass = computed(() => 'flex-shrink-0')

const selectClass = computed(() => {
  const baseClasses = 'appearance-none bg-white border border-gray-300 focus:ring-2 focus:ring-brand-sage focus:border-transparent text-gray-900 pr-8'

  const sizeClasses = {
    sm: 'px-2 py-1.5 text-sm min-w-[100px]',
    md: 'px-3 py-2.5 text-sm min-w-[120px]',
    lg: 'px-4 py-3 text-base min-w-[140px]'
  }

  const variantClasses = {
    default: 'rounded-lg',
    rounded: 'rounded-xl',
    minimal: 'rounded-md border-gray-200 bg-gray-50 focus:bg-white'
  }

  const disabledClasses = props.disabled ? 'opacity-50 cursor-not-allowed' : ''

  return `${baseClasses} ${sizeClasses[props.size]} ${variantClasses[props.variant]} ${disabledClasses}`
})

const iconClass = computed(() => {
  const sizeClasses = {
    sm: 'absolute right-1 top-2 w-4 h-4 text-gray-400 pointer-events-none',
    md: 'absolute right-2 top-3 w-4 h-4 text-gray-400 pointer-events-none',
    lg: 'absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none'
  }
  return sizeClasses[props.size]
})

const handleChange = () => {
  emit('update:modelValue', localValue.value)
  emit('change', localValue.value)
}

watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue
})
</script>