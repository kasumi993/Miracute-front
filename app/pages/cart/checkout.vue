<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container-custom py-12">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p class="text-gray-600">Review your order and complete your purchase</p>
        </div>

        <div class="grid lg:grid-cols-2 gap-8">
          <!-- Order Summary -->
          <div class="lg:order-2">
            <div class="card sticky top-4">
              <div class="p-6">
                <h2 class="text-xl font-semibold mb-4">Order Summary</h2>
                
                <!-- Cart Items -->
                <div class="space-y-4 mb-6">
                  <div
                    v-for="item in cartItems"
                    :key="item.id"
                    class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <NuxtImg
                      :src="item.product.thumbnail_url"
                      :alt="item.product.name"
                      class="w-16 h-16 object-cover rounded-lg"
                    />
                    <div class="flex-1">
                      <h3 class="font-medium text-gray-900">{{ item.product.name }}</h3>
                      <p class="text-sm text-gray-600">{{ item.product.category?.name }}</p>
                    </div>
                    <div class="text-right">
                      <p class="font-semibold">${{ item.product.price }}</p>
                      <p class="text-sm text-gray-600">Qty: {{ item.quantity }}</p>
                    </div>
                  </div>
                </div>

                <!-- Totals -->
                <div class="border-t pt-4 space-y-2">
                  <div class="flex justify-between">
                    <span>Subtotal</span>
                    <span>${{ subtotal.toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Tax</span>
                    <span>${{ tax.toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between text-lg font-semibold border-t pt-2">
                    <span>Total</span>
                    <span>${{ total.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Checkout Form -->
          <div class="lg:order-1">
            <form @submit.prevent="handleSubmit">
              <!-- Customer Information -->
              <div class="card mb-6">
                <div class="p-6">
                  <h3 class="text-lg font-semibold mb-4">Customer Information</h3>
                  
                  <div v-if="!user" class="mb-6 p-4 bg-blue-50 rounded-lg">
                    <p class="text-sm text-blue-700 mb-3">
                      Have an account? 
                      <NuxtLink to="/auth/login" class="font-medium underline">Sign in</NuxtLink>
                      for faster checkout.
                    </p>
                  </div>

                  <div class="grid md:grid-cols-2 gap-4">
                    <Input
                      v-model="form.firstName"
                      label="First Name"
                      required
                      :error="errors.firstName"
                    />
                    <Input
                      v-model="form.lastName"
                      label="Last Name"
                      required
                      :error="errors.lastName"
                    />
                    <Input
                      v-model="form.email"
                      label="Email"
                      type="email"
                      required
                      :error="errors.email"
                      class="md:col-span-2"
                    />
                  </div>
                </div>
              </div>

              <!-- Billing Address -->
              <div class="card mb-6">
                <div class="p-6">
                  <h3 class="text-lg font-semibold mb-4">Billing Address</h3>
                  
                  <div class="space-y-4">
                    <Input
                      v-model="form.address.line1"
                      label="Address Line 1"
                      required
                      :error="errors['address.line1']"
                    />
                    <Input
                      v-model="form.address.line2"
                      label="Address Line 2 (Optional)"
                    />
                    <div class="grid md:grid-cols-3 gap-4">
                      <Input
                        v-model="form.address.city"
                        label="City"
                        required
                        :error="errors['address.city']"
                      />
                      <Input
                        v-model="form.address.state"
                        label="State"
                        required
                        :error="errors['address.state']"
                      />
                      <Input
                        v-model="form.address.postalCode"
                        label="ZIP Code"
                        required
                        :error="errors['address.postalCode']"
                      />
                    </div>
                    <select
                      v-model="form.address.country"
                      class="form-input"
                      required
                    >
                      <option value="">Select Country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Payment Method -->
              <div class="card mb-6">
                <div class="p-6">
                  <h3 class="text-lg font-semibold mb-4">Payment Method</h3>
                  
                  <div class="space-y-4">
                    <label class="flex items-center">
                      <input
                        v-model="form.paymentMethod"
                        type="radio"
                        value="card"
                        class="mr-3"
                      />
                      <span class="flex items-center">
                        <NuxtIcon name="heroicons:credit-card" class="w-5 h-5 mr-2" />
                        Credit or Debit Card
                      </span>
                    </label>
                    
                    <!-- Stripe Elements would be integrated here -->
                    <div v-if="form.paymentMethod === 'card'" class="pl-8">
                      <div class="p-4 bg-gray-50 rounded-lg">
                        <p class="text-sm text-gray-600 mb-2">
                          Payment processing is handled securely by Stripe.
                        </p>
                        <div id="stripe-elements" class="mt-4">
                          <!-- Stripe Elements will be mounted here -->
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Terms and Conditions -->
              <div class="card mb-6">
                <div class="p-6">
                  <label class="flex items-start">
                    <input
                      v-model="form.agreeToTerms"
                      type="checkbox"
                      required
                      class="mt-1 mr-3"
                    />
                    <span class="text-sm text-gray-700">
                      I agree to the 
                      <NuxtLink to="/terms" class="text-blue-600 underline">Terms of Service</NuxtLink>
                      and 
                      <NuxtLink to="/privacy" class="text-blue-600 underline">Privacy Policy</NuxtLink>
                    </span>
                  </label>
                </div>
              </div>

              <!-- Submit Button -->
              <Button
                type="submit"
                :loading="processing"
                :disabled="!canProceed"
                size="lg"
                class="w-full"
              >
                <NuxtIcon name="heroicons:lock-closed" class="w-5 h-5 mr-2" />
                Complete Purchase - ${{ total.toFixed(2) }}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'default'
})

const { user } = useAuth()
const { items: cartItems, total: cartTotal, clearCart } = useCart()
const toast = useToast()
const router = useRouter()

// Redirect if cart is empty
if (!cartItems.value.length) {
  await navigateTo('/cart')
}

// Form data
const form = reactive({
  firstName: user.value?.user_metadata?.firstName || '',
  lastName: user.value?.user_metadata?.lastName || '',
  email: user.value?.email || '',
  address: {
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US'
  },
  paymentMethod: 'card',
  agreeToTerms: false
})

const errors = ref<Record<string, string>>({})
const processing = ref(false)

// Computed values
const subtotal = computed(() => cartTotal.value)
const tax = computed(() => subtotal.value * 0.08) // 8% tax rate
const total = computed(() => subtotal.value + tax.value)

const canProceed = computed(() => {
  return form.firstName && 
         form.lastName && 
         form.email && 
         form.address.line1 && 
         form.address.city && 
         form.address.state && 
         form.address.postalCode && 
         form.address.country && 
         form.paymentMethod && 
         form.agreeToTerms &&
         cartItems.value.length > 0
})

// Validation
const validateForm = () => {
  errors.value = {}
  
  if (!form.firstName) errors.value.firstName = 'First name is required'
  if (!form.lastName) errors.value.lastName = 'Last name is required'
  if (!form.email) errors.value.email = 'Email is required'
  if (!form.address.line1) errors.value['address.line1'] = 'Address is required'
  if (!form.address.city) errors.value['address.city'] = 'City is required'
  if (!form.address.state) errors.value['address.state'] = 'State is required'
  if (!form.address.postalCode) errors.value['address.postalCode'] = 'ZIP code is required'
  
  return Object.keys(errors.value).length === 0
}

// Submit handler
const handleSubmit = async () => {
  if (!validateForm()) return
  
  processing.value = true
  
  try {
    // Create checkout session
    const { data } = await $fetch('/api/payments/create-checkout-session', {
      method: 'POST',
      body: {
        items: cartItems.value.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        customer_info: {
          email: form.email,
          name: `${form.firstName} ${form.lastName}`
        },
        billing_address: form.address
      }
    })
    
    if (data?.url) {
      // Redirect to Stripe Checkout
      await navigateToExternal(data.url)
    } else {
      throw new Error('Failed to create checkout session')
    }
    
  } catch (error) {
    console.error('Checkout error:', error)
    toast.error('Failed to process payment. Please try again.')
  } finally {
    processing.value = false
  }
}

// Load user data if available
onMounted(() => {
  if (user.value) {
    form.firstName = user.value.user_metadata?.firstName || ''
    form.lastName = user.value.user_metadata?.lastName || ''
    form.email = user.value.email || ''
  }
})

// SEO
useSeoMeta({
  title: 'Checkout - Miracute',
  description: 'Complete your purchase of beautiful website templates',
  robots: 'noindex, nofollow'
})
</script>