<template>
  <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
    <div class="flex items-center space-x-3 mb-6">
      <div class="w-8 h-8 bg-brand-brown text-white rounded-full flex items-center justify-center font-semibold text-sm">
        2
      </div>
      <h2 class="text-xl font-semibold text-gray-900">Payment Method</h2>
    </div>

    <div class="space-y-4">
      <!-- Credit/Debit Card -->
      <label class="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-brand-brown/30" 
             :class="selectedMethod === 'card' ? 'border-brand-brown bg-brand-brown/5' : 'border-gray-200'">
        <input 
          v-model="selectedMethod" 
          type="radio" 
          value="card" 
          class="sr-only"
        />
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center space-x-4">
            <div class="w-6 h-6 border-2 rounded-full flex items-center justify-center"
                 :class="selectedMethod === 'card' ? 'border-brand-brown bg-brand-brown' : 'border-gray-300'">
              <div v-if="selectedMethod === 'card'" class="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div class="flex items-center space-x-3">
              <Icon name="heroicons:credit-card" class="w-6 h-6 text-gray-600" />
              <span class="font-medium text-gray-900">Credit or Debit Card</span>
            </div>
          </div>
          <div class="flex space-x-2 text-xs text-gray-500">
            <span class="px-2 py-1 bg-gray-100 rounded">VISA</span>
            <span class="px-2 py-1 bg-gray-100 rounded">MC</span>
            <span class="px-2 py-1 bg-gray-100 rounded">AMEX</span>
          </div>
        </div>
      </label>

      <!-- Card Details Form -->
      <div v-if="selectedMethod === 'card'" class="ml-10 space-y-4 pt-4 border-t border-gray-100">
        <div class="grid grid-cols-1 gap-4">
          <Input
            v-model="cardDetails.number"
            label="Card Number"
            placeholder="1234 5678 9012 3456"
            required
            :error="errors.cardNumber"
            autocomplete="cc-number"
            @input="formatCardNumber"
          />
          <div class="grid grid-cols-2 gap-4">
            <Input
              v-model="cardDetails.expiry"
              label="Expiry Date"
              placeholder="MM/YY"
              required
              :error="errors.expiry"
              autocomplete="cc-exp"
              @input="formatExpiry"
            />
            <Input
              v-model="cardDetails.cvc"
              label="CVC"
              placeholder="123"
              required
              :error="errors.cvc"
              autocomplete="cc-csc"
              maxlength="4"
            />
          </div>
          <Input
            v-model="cardDetails.name"
            label="Cardholder Name"
            placeholder="John Doe"
            required
            :error="errors.cardName"
            autocomplete="cc-name"
          />
        </div>
      </div>

      <!-- PayPal -->
      <label class="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-brand-brown/30"
             :class="selectedMethod === 'paypal' ? 'border-brand-brown bg-brand-brown/5' : 'border-gray-200'">
        <input 
          v-model="selectedMethod" 
          type="radio" 
          value="paypal" 
          class="sr-only"
        />
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center space-x-4">
            <div class="w-6 h-6 border-2 rounded-full flex items-center justify-center"
                 :class="selectedMethod === 'paypal' ? 'border-brand-brown bg-brand-brown' : 'border-gray-300'">
              <div v-if="selectedMethod === 'paypal'" class="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div class="flex items-center space-x-3">
              <!-- PayPal Logo -->
              <div class="flex items-center justify-center w-8 h-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded px-1">
                <svg viewBox="0 0 24 16" class="w-6 h-4 fill-white">
                  <path d="M7.076 0c2.155 0 4.031.848 4.69 2.804.502 1.493.181 2.908-.856 3.772-.506.423-1.195.634-1.992.634H6.83c-.366 0-.696.265-.759.626l-.528 3.025c-.063.361-.393.626-.759.626H2.607c-.24 0-.414-.223-.368-.458l1.422-8.138C3.723.507 4.142.141 4.634.141L7.076 0zm9.072 0c2.155 0 4.031.848 4.69 2.804.502 1.493.181 2.908-.856 3.772-.506.423-1.195.634-1.992.634h-2.088c-.366 0-.696.265-.759.626l-.528 3.025c-.063.361-.393.626-.759.626h-2.177c-.24 0-.414-.223-.368-.458l1.422-8.138C12.795.507 13.214.141 13.706.141L16.148 0z"/>
                </svg>
              </div>
              <span class="font-medium text-gray-900">PayPal</span>
            </div>
          </div>
          <div class="text-sm text-gray-500">
            Secure payment with your PayPal account
          </div>
        </div>
      </label>

      <!-- Apple Pay -->
      <label class="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-brand-brown/30"
             :class="selectedMethod === 'apple_pay' ? 'border-brand-brown bg-brand-brown/5' : 'border-gray-200'">
        <input 
          v-model="selectedMethod" 
          type="radio" 
          value="apple_pay" 
          class="sr-only"
        />
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center space-x-4">
            <div class="w-6 h-6 border-2 rounded-full flex items-center justify-center"
                 :class="selectedMethod === 'apple_pay' ? 'border-brand-brown bg-brand-brown' : 'border-gray-300'">
              <div v-if="selectedMethod === 'apple_pay'" class="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div class="flex items-center space-x-3">
              <!-- Apple Pay Logo -->
              <div class="flex items-center justify-center w-8 h-6 bg-black rounded px-1">
                <svg viewBox="0 0 24 16" class="w-6 h-4 fill-white">
                  <path d="M5.5 2.3c-.4.5-.9.8-1.5.7.1-.6.3-1.2.7-1.6.4-.5 1-.8 1.6-.7-.1.6-.3 1.1-.8 1.6zm-.8 1.3c-.8 0-1.5.5-1.9.5s-1-.5-1.7-.5c-.9 0-1.7.5-2.2 1.3-.9 1.6-.2 3.9.7 5.2.4.6.9 1.3 1.6 1.3.6 0 .9-.4 1.7-.4s1 .4 1.7.4c.7 0 1.1-.6 1.5-1.2.5-.7.7-1.4.7-1.4s-1.4-.5-1.4-2c0-1.3 1.1-1.9 1.1-1.9s-.6-1-1.5-1c-.4 0-.7.1-1 .1s-.6-.1-1-.1zm9.8-1.6v7.5h1.2v-2.6h1.6c1.5 0 2.5-.9 2.5-2.4s-1-2.5-2.5-2.5h-2.8zm1.2 1v3.5h1.3c1 0 1.6-.5 1.6-1.7s-.6-1.8-1.6-1.8h-1.3zm6.8-.1c-1.6 0-2.6 1.1-2.6 2.8s1 2.8 2.6 2.8 2.6-1.1 2.6-2.8-1-2.8-2.6-2.8zm0 1c1 0 1.5.8 1.5 1.8s-.5 1.8-1.5 1.8-1.5-.8-1.5-1.8.5-1.8 1.5-1.8z"/>
                </svg>
              </div>
              <span class="font-medium text-gray-900">Apple Pay</span>
            </div>
          </div>
          <div class="text-sm text-gray-500">
            Touch ID or Face ID
          </div>
        </div>
      </label>

      <!-- Google Pay -->
      <label class="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-brand-brown/30"
             :class="selectedMethod === 'google_pay' ? 'border-brand-brown bg-brand-brown/5' : 'border-gray-200'">
        <input 
          v-model="selectedMethod" 
          type="radio" 
          value="google_pay" 
          class="sr-only"
        />
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center space-x-4">
            <div class="w-6 h-6 border-2 rounded-full flex items-center justify-center"
                 :class="selectedMethod === 'google_pay' ? 'border-brand-brown bg-brand-brown' : 'border-gray-300'">
              <div v-if="selectedMethod === 'google_pay'" class="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div class="flex items-center space-x-3">
              <!-- Google Pay Logo -->
              <div class="flex items-center justify-center w-8 h-6 bg-white border border-gray-200 rounded px-1">
                <svg viewBox="0 0 24 16" class="w-6 h-4">
                  <path fill="#4285F4" d="M12.24 5.47h5.05v1.4h-3.5v1.31h3.18v1.37h-3.18v1.31h3.58v1.4h-5.13V5.47z"/>
                  <path fill="#34A853" d="M7.11 5.47c1.42 0 2.4.93 2.4 2.29 0 1.37-.98 2.3-2.4 2.3H5.73v2.2H4.18V5.47h2.93zm-.1 3.22c.69 0 1.14-.42 1.14-1.02 0-.6-.45-1.02-1.14-1.02H5.73v2.04h1.28z"/>
                  <path fill="#EA4335" d="M16.76 12.26c-1.35 0-2.43-1.02-2.43-2.3s1.08-2.29 2.43-2.29c.8 0 1.43.34 1.83.85l-1.05.78c-.25-.37-.63-.57-1.05-.57-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5c.87 0 1.35-.52 1.4-1.27h-1.4v-1.1h2.63c.03.16.04.32.04.5 0 1.71-1.15 2.92-2.9 2.92z"/>
                </svg>
              </div>
              <span class="font-medium text-gray-900">Google Pay</span>
            </div>
          </div>
          <div class="text-sm text-gray-500">
            Fast and secure checkout
          </div>
        </div>
      </label>
    </div>

    <!-- Security Badge -->
    <div class="mt-6 pt-6 border-t border-gray-100">
      <div class="flex items-center justify-center space-x-6 text-sm text-gray-500">
        <div class="flex items-center space-x-2">
          <Icon name="heroicons:shield-check" class="w-5 h-5 text-green-500" />
          <span>SSL Encrypted</span>
        </div>
        <div class="flex items-center space-x-2">
          <Icon name="heroicons:lock-closed" class="w-5 h-5 text-blue-500" />
          <span>Secure Payment</span>
        </div>
        <div class="flex items-center space-x-2">
          <Icon name="heroicons:shield-exclamation" class="w-5 h-5 text-purple-500" />
          <span>PCI Compliant</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Input from '~/components/UI/Input.vue'

export interface CardDetails {
  number: string
  expiry: string
  cvc: string
  name: string
}

export interface PaymentData {
  method: 'card' | 'paypal' | 'apple_pay' | 'google_pay'
  cardDetails?: CardDetails
}

interface Props {
  modelValue?: PaymentData
}

interface Emits {
  (e: 'update:modelValue', value: PaymentData): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Since we're using Stripe, we'll show all payment methods and let Stripe handle compatibility

// Form data
const selectedMethod = ref<PaymentData['method']>('card')
const cardDetails = ref<CardDetails>({
  number: '',
  expiry: '',
  cvc: '',
  name: ''
})

// Validation errors
const errors = ref<{
  cardNumber?: string
  expiry?: string
  cvc?: string
  cardName?: string
}>({})

// Format card number input
const formatCardNumber = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '')
  const matches = value.match(/\d{4,16}/g)
  const match = matches && matches[0] || ''
  const parts = []

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }

  if (parts.length) {
    cardDetails.value.number = parts.join(' ')
  } else {
    cardDetails.value.number = value
  }
}

// Format expiry date input
const formatExpiry = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\D/g, '')
  
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4)
  }
  
  cardDetails.value.expiry = value
}

// Validate payment form
const validatePayment = () => {
  errors.value = {}
  
  if (selectedMethod.value === 'card') {
    if (!cardDetails.value.number.trim()) {
      errors.value.cardNumber = 'Card number is required'
    } else if (cardDetails.value.number.replace(/\s/g, '').length < 13) {
      errors.value.cardNumber = 'Please enter a valid card number'
    }
    
    if (!cardDetails.value.expiry.trim()) {
      errors.value.expiry = 'Expiry date is required'
    } else if (!/^\d{2}\/\d{2}$/.test(cardDetails.value.expiry)) {
      errors.value.expiry = 'Please enter a valid expiry date (MM/YY)'
    }
    
    if (!cardDetails.value.cvc.trim()) {
      errors.value.cvc = 'CVC is required'
    } else if (cardDetails.value.cvc.length < 3) {
      errors.value.cvc = 'Please enter a valid CVC'
    }
    
    if (!cardDetails.value.name.trim()) {
      errors.value.cardName = 'Cardholder name is required'
    }
  }
  
  return Object.keys(errors.value).length === 0
}

// Computed payment data
const paymentData = computed<PaymentData>(() => ({
  method: selectedMethod.value,
  ...(selectedMethod.value === 'card' && { cardDetails: cardDetails.value })
}))

// Watch for changes and emit updates (prevent recursive loop)
watch([selectedMethod, cardDetails], () => {
  emit('update:modelValue', paymentData.value)
}, { deep: true, flush: 'sync' })

// Initialize with props (prevent recursive loop)
watch(() => props.modelValue, (value) => {
  if (value && value !== paymentData.value) {
    selectedMethod.value = value.method
    if (value.cardDetails) {
      cardDetails.value = { ...value.cardDetails }
    }
  }
}, { immediate: true })

// Expose validation method
defineExpose({
  validatePayment
})
</script>