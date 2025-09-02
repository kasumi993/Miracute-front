<template>
  <div class="space-y-2">
    <label v-if="label" :for="selectId" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative" ref="dropdownRef">
      <button
        :id="selectId"
        type="button"
        @click="toggleDropdown"
        :disabled="disabled || loading"
        class="relative w-full bg-white border border-gray-300 rounded-xl shadow-sm pl-4 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-brown/20 focus:border-brand-brown transition-all duration-200"
        :class="{
          'border-red-300 focus:border-red-400 focus:ring-red-500/20': error,
          'ring-2 ring-brand-brown/20 border-brand-brown': isOpen && !error,
          'hover:border-gray-400': !isOpen && !error && !disabled,
          'bg-gray-50 cursor-not-allowed': disabled || loading,
          'hover:bg-gray-50': !disabled && !loading
        }"
      >
        <span class="flex items-center">
          <Icon v-if="loading" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin text-gray-400" />
          <span class="block truncate" :class="selectedLabel ? 'text-gray-900' : 'text-gray-500'">
            {{ selectedLabel || placeholder || 'Select an option' }}
          </span>
        </span>
        <span class="ml-3 absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Icon 
            name="heroicons:chevron-up-down" 
            class="h-5 w-5 text-gray-400 transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
          />
        </span>
      </button>

      <!-- Dropdown -->
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isOpen && !disabled && !loading"
          class="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-xl py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none border border-gray-200"
        >
          <!-- Search input if searchable -->
          <div v-if="searchable" class="sticky top-0 bg-white p-3 border-b border-gray-100">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-brown/20 focus:border-brand-brown"
                placeholder="Search options..."
                @click.stop
              />
              <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <!-- Options -->
          <div class="py-1">
            <div
              v-for="option in filteredOptions"
              :key="getOptionValue(option)"
              @click="selectOption(option)"
              class="cursor-pointer select-none relative py-2.5 pl-4 pr-9 hover:bg-gray-50 transition-colors duration-150"
              :class="{
                'bg-brand-brown/10 text-brand-brown': getOptionValue(option) === selectValue,
                'text-gray-900': getOptionValue(option) !== selectValue
              }"
            >
              <div class="flex items-center">
                <span 
                  class="font-normal block truncate"
                  :class="{
                    'font-medium': getOptionValue(option) === selectValue
                  }"
                >
                  {{ getOptionLabel(option) }}
                </span>
              </div>

              <span
                v-if="getOptionValue(option) === selectValue"
                class="absolute inset-y-0 right-0 flex items-center pr-4 text-brand-brown"
              >
                <Icon name="heroicons:check" class="h-5 w-5" />
              </span>
            </div>

            <!-- No options message -->
            <div 
              v-if="filteredOptions.length === 0" 
              class="cursor-default select-none relative py-2.5 pl-4 pr-9 text-gray-500 text-sm"
            >
              {{ searchQuery ? 'No results found' : 'No options available' }}
            </div>
          </div>
        </div>
      </transition>
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
  searchable?: boolean
}

const props = withDefaults(defineProps<SelectProps>(), {
  optionValue: 'value',
  optionLabel: 'label',
  required: false,
  disabled: false,
  loading: false,
  searchable: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  change: [value: string | number]
}>()

// State
const isOpen = ref(false)
const searchQuery = ref('')
const dropdownRef = ref<HTMLElement>()
const selectId = `select-${Math.random().toString(36).substring(2)}`

const selectValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value || '')
})

const selectedLabel = computed(() => {
  const selectedOption = props.options.find(option => getOptionValue(option) === selectValue.value)
  return selectedOption ? getOptionLabel(selectedOption) : ''
})

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value) {
    return props.options
  }
  
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(option =>
    getOptionLabel(option).toLowerCase().includes(query)
  )
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

// Methods
const toggleDropdown = () => {
  if (props.disabled || props.loading) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
  }
}

const selectOption = (option: any) => {
  const value = getOptionValue(option)
  emit('update:modelValue', value)
  emit('change', value)
  isOpen.value = false
  searchQuery.value = ''
}

const closeDropdown = () => {
  isOpen.value = false
  searchQuery.value = ''
}

// Click outside to close
onMounted(() => {
  const handleClickOutside = (event: Event) => {
    if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
      closeDropdown()
    }
  }

  document.addEventListener('click', handleClickOutside)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})

// Escape key to close
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen.value) {
      closeDropdown()
    }
  }
  
  document.addEventListener('keydown', handleEscape)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>