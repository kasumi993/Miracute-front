<template>
  <div class="space-y-2">
    <label v-if="label" :for="selectId" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <select
        :id="selectId"
        v-model="selectValue"
        :required="required"
        :disabled="disabled"
        :class="selectClasses"
        @change="handleChange"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="getOptionValue(option)"
          :value="getOptionValue(option)"
        >
          {{ getOptionLabel(option) }}
        </option>
      </select>
      <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <Icon name="heroicons:chevron-down" class="w-5 h-5 text-gray-400" />
      </div>
    </div>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
interface SelectProps {
  modelValue?: string | number
  label?: string
  placeholder?: string
  options: any[]
  optionValue?: string
  optionLabel?: string
  required?: boolean
  disabled?: boolean
  error?: string
  loading?: boolean
}

const props = withDefaults(defineProps<SelectProps>(), {
  optionValue: 'value',
  optionLabel: 'label',
  required: false,
  disabled: false,
  loading: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number]
}>()

const selectId = `select-${Math.random().toString(36).substring(2)}`

const selectValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value || '')
})

const selectClasses = computed(() => {
  const classes = [
    'block w-full px-4 py-3 pr-10 text-base border rounded-xl',
    'bg-white appearance-none cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-brand-brown/20 focus:border-brand-brown',
    'transition-colors duration-200',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed'
  ]

  if (props.error) {
    classes.push('border-red-300 focus:border-red-400 focus:ring-red-500/20')
  } else {
    classes.push('border-gray-300')
  }

  return classes.join(' ')
})

const getOptionValue = (option: any) => {
  if (typeof option === 'string' || typeof option === 'number') {
    return option
  }
  return option[props.optionValue]
}

const getOptionLabel = (option: any) => {
  if (typeof option === 'string' || typeof option === 'number') {
    return option
  }
  return option[props.optionLabel]
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const value = target.value
  emit('update:modelValue', value)
  emit('change', value)
}
</script>