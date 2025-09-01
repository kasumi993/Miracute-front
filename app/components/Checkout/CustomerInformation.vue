<template>
  <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-brand-brown text-white rounded-full flex items-center justify-center font-semibold text-sm">
          1
        </div>
        <h2 class="text-xl font-semibold text-gray-900">Customer Information</h2>
      </div>
      
      <!-- Saved Info Indicator -->
      <div v-if="isUsingStoredInfo" class="flex items-center space-x-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
        <Icon name="heroicons:check-circle" class="w-4 h-4" />
        <span>Using saved info</span>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Contact Information -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Contact Details</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            v-model="form.firstName"
            label="First Name"
            placeholder="John"
            required
            :error="errors.firstName"
            autocomplete="given-name"
          />
          <Input
            v-model="form.lastName"
            label="Last Name"
            placeholder="Doe"
            required
            :error="errors.lastName"
            autocomplete="family-name"
          />
        </div>

        <Input
          v-model="form.email"
          label="Email Address"
          type="email"
          placeholder="john.doe@example.com"
          required
          :error="errors.email"
          autocomplete="email"
          hint="You'll receive your templates and order confirmation at this email"
        />

      </div>

      <!-- Tax Information -->
      <div class="space-y-4">
        <h3 class="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">Tax Information</h3>
        
        <Select
          v-model="form.country"
          label="Country"
          placeholder="Select your country"
          :options="countries"
          option-value="code"
          option-label="name"
          required
          :error="errors.country"
          :loading="isLoadingCountries"
          autocomplete="country"
          hint="Required for tax calculation"
        />
      </div>

      <!-- Newsletter Signup -->
      <div class="bg-gray-50 rounded-xl p-4">
        <label class="flex items-start space-x-3 cursor-pointer">
          <input
            v-model="form.newsletter"
            type="checkbox"
            class="mt-1 h-4 w-4 text-brand-brown focus:ring-brand-brown border-gray-300 rounded"
          />
          <div class="flex-1">
            <span class="text-sm font-medium text-gray-900">Subscribe to our newsletter</span>
            <p class="text-xs text-gray-600 mt-1">
              Get the latest templates, design tips, and exclusive offers. Unsubscribe anytime.
            </p>
          </div>
        </label>
      </div>

      <!-- Save Information for Future Purchases -->
      <div class="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <label class="flex items-start space-x-3 cursor-pointer">
          <input
            v-model="form.saveInfo"
            type="checkbox"
            class="mt-1 h-4 w-4 text-brand-brown focus:ring-brand-brown border-gray-300 rounded"
          />
          <div class="flex-1">
            <div class="flex items-center space-x-2">
              <span class="text-sm font-medium text-gray-900">Save information for faster checkout</span>
              <Icon name="heroicons:shield-check" class="w-4 h-4 text-green-600" />
            </div>
            <p class="text-xs text-gray-600 mt-1">
              We'll securely save your contact and billing information for future purchases. Payment details are never stored.
            </p>
          </div>
        </label>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import Input from '~/components/UI/Input.vue'
import Select from '~/components/UI/Select.vue'

export interface CustomerForm {
  firstName: string
  lastName: string
  email: string
  country: string
  newsletter: boolean
  saveInfo: boolean
}

interface Props {
  modelValue?: CustomerForm
  isUsingStoredInfo?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: CustomerForm): void
  (e: 'submit', value: CustomerForm): void
}

const props = withDefaults(defineProps<Props>(), {
  isUsingStoredInfo: false
})
const emit = defineEmits<Emits>()

// Countries API
const { countries, isLoading: isLoadingCountries, fetchCountries } = useCountries()

// Form data
const defaultForm: CustomerForm = {
  firstName: '',
  lastName: '',
  email: '',
  country: '',
  newsletter: false,
  saveInfo: true
}

const form = computed({
  get: () => props.modelValue || defaultForm,
  set: (value: CustomerForm) => emit('update:modelValue', value)
})

// Form validation
const errors = ref<Partial<Record<keyof CustomerForm, string>>>({})

const validateForm = () => {
  errors.value = {}
  
  if (!form.value.firstName.trim()) {
    errors.value.firstName = 'First name is required'
  }
  
  if (!form.value.lastName.trim()) {
    errors.value.lastName = 'Last name is required'
  }
  
  if (!form.value.email.trim()) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email address'
  }
  
  if (!form.value.country.trim()) {
    errors.value.country = 'Country is required'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (validateForm()) {
    emit('submit', form.value)
  }
}

// Load countries on mount
onMounted(async () => {
  await fetchCountries()
})

// Watch form changes to emit updates
watch(form, (newForm) => {
  emit('update:modelValue', newForm)
}, { deep: true })
</script>