<template>
  <div class="form-group">
    <label v-if="label" :for="inputId" class="form-label">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    
    <div class="relative">
      <div v-if="icon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon :name="icon" class="h-5 w-5 text-gray-400" />
      </div>
      
      <input
        :id="inputId"
        v-model="modelValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        :class="inputClasses"
        v-bind="$attrs"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />
      
      <div v-if="error" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <NuxtIcon name="heroicons:exclamation-circle" class="h-5 w-5 text-red-400" />
      </div>
    </div>
    
    <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
    <p v-else-if="hint" class="mt-2 text-sm text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
interface InputProps {
  modelValue?: string | number
  label?: string
  type?: string
  placeholder?: string
  error?: string
  hint?: string
  icon?: string
  disabled?: boolean
  required?: boolean
  autocomplete?: string
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<InputProps>(), {
  type: 'text',
  disabled: false,
  required: false,
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  input: [event: Event]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputId = `input-${Math.random().toString(36).substring(2)}`

const modelValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value || '')
})

const inputClasses = computed(() => {
  const baseClasses = [
    'block w-full border border-gray-300 rounded-lg shadow-sm',
    'focus:ring-2 focus:ring-opacity-50 focus:border-transparent',
    'transition-all duration-200',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed'
  ]

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  }
  baseClasses.push(sizeClasses[props.size])

  // Icon padding
  if (props.icon) {
    baseClasses.push('pl-10')
  }

  // Error state
  if (props.error) {
    baseClasses.push('border-red-300 focus:ring-red-500 pr-10')
  } else {
    baseClasses.push('focus:ring-blue-500')
  }

  return baseClasses.join(' ')
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('input', event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}
</script>