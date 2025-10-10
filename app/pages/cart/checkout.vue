<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center space-x-2 text-sm mb-6">
        <NuxtLink to="/" class="text-gray-500 hover:text-brand-brown transition-colors">Home</NuxtLink>
        <Icon name="heroicons:chevron-right" class="w-4 h-4 text-gray-400" />
        <NuxtLink to="/cart" class="text-gray-500 hover:text-brand-brown transition-colors">Cart</NuxtLink>
        <Icon name="heroicons:chevron-right" class="w-4 h-4 text-gray-400" />
        <span class="text-gray-900 font-medium">Checkout</span>
      </nav>

      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Secure Checkout</h1>
        <p class="text-gray-600">Complete your purchase securely</p>
      </div>

      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Checkout Forms -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Customer Information -->
          <CustomerInformation 
            v-model="customerData" 
            :is-using-stored-info="isUsingStoredInfo"
            @submit="handleCustomerSubmit"
          />
          
          <!-- Payment Method -->
          <PaymentMethod 
            v-model="paymentData"
            ref="paymentMethodRef"
          />
        </div>

        <!-- Order Summary Sidebar -->
        <div class="lg:col-span-1">
          <OrderSummary 
            :can-complete="canCompleteOrder" 
            :is-processing="isProcessingOrder"
            @complete-order="handleCompleteOrder"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CustomerInformation from '~/components/Checkout/CustomerInformation.vue'
import PaymentMethod from '~/components/Checkout/PaymentMethod.vue'
import OrderSummary from '~/components/Checkout/OrderSummary.vue'
import type { CustomerForm } from '~/components/Checkout/CustomerInformation.vue'
import type { PaymentData } from '~/components/Checkout/PaymentMethod.vue'
import { AccountService } from '@/services'

definePageMeta({
  layout: 'default'
})

// Composables
const cartCounter = useCartCounter()
const orderStore = useOrderStore() // Add order store
const { getCheckoutPrefillData, updateProfileFromCheckout, hasCompleteProfile } = useUserProfile()
const auth = useAuth()
const toast = useToast()
const router = useRouter()

// Redirect if cart is empty
if (!cartCounter.cartCount.value) {
  await navigateTo('/cart')
}

// Component refs
const paymentMethodRef = ref()

// Form data
const customerData = ref<CustomerForm>({
  firstName: '',
  lastName: '',
  email: '',
  country: '',
  newsletter: false,
  saveInfo: true
})
const paymentData = ref<PaymentData>({
  method: 'card'
})
const isUsingStoredInfo = ref(false)

// Function to prefill customer data
const prefillCustomerData = async () => {
  console.log('Attempting to prefill customer data...')
  console.log('Auth state:', { 
    isAuthenticated: auth.isAuthenticated.value, 
    hasUser: !!auth.user.value,
    hasAuthUser: !!auth.authUser.value 
  })
  
  // Always detect country from IP, even for unauthenticated users
  let detectedCountry = ''
  try {
    const countryResponse = await AccountService.getLocationData()
    if (countryResponse.success && countryResponse.country) {
      detectedCountry = countryResponse.country
      console.log('Detected country from IP:', detectedCountry)
    }
  } catch (error) {
    console.error('Error detecting country:', error)
  }
  
  if (!auth.isAuthenticated.value) {
    console.log('User not authenticated, only prefilling country')
    // Still prefill country for unauthenticated users
    if (detectedCountry && !customerData.value.country) {
      await nextTick()
      customerData.value = {
        ...customerData.value,
        country: detectedCountry
      }
      console.log('Country prefilled for guest user:', detectedCountry)
    }
    return
  }

  // Always ensure we have the latest user profile
  try {
    await auth.fetchUserProfile()
  } catch (error) {
    console.error('Error fetching user profile:', error)
  }
  
  // Get the user email from either profile or Supabase user
  const userEmail = auth.authUser.value?.email || auth.user.value?.email || ''
  
  const prefillData = getCheckoutPrefillData()
  console.log('Prefill data:', prefillData)
  console.log('Auth user:', auth.authUser.value)
  console.log('Supabase user email:', auth.user.value?.email)
  console.log('Final email to use:', userEmail)
  console.log('Detected country:', detectedCountry)
  
  // Only prefill if we don't already have data or if the email is empty
  if (!customerData.value.email || customerData.value.email !== userEmail) {
    // Create new object to avoid reactivity issues
    const newData = {
      firstName: prefillData.firstName || customerData.value.firstName,
      lastName: prefillData.lastName || customerData.value.lastName,
      email: userEmail, // Always use the user's email
      country: prefillData.country || detectedCountry || customerData.value.country,
      newsletter: customerData.value.newsletter,
      saveInfo: customerData.value.saveInfo
    }
    
    // Update in nextTick to avoid recursive updates
    await nextTick()
    customerData.value = newData
    
    console.log('Customer data updated:', customerData.value)
    
    // Set using stored info flag if we have complete profile data
    isUsingStoredInfo.value = hasCompleteProfile.value
  } else if (detectedCountry && !customerData.value.country) {
    // Just update country if other data is already filled
    await nextTick()
    customerData.value = {
      ...customerData.value,
      country: detectedCountry
    }
    console.log('Country updated for existing user data:', detectedCountry)
  }
}

// Load user profile information on mount
onMounted(async () => {
  console.log('Checkout page mounted')
  // Wait for auth to initialize
  await auth.init()
  await prefillCustomerData()
})

// Use flags to prevent recursive updates
const isUpdatingCustomerData = ref(false)
const lastPrefillTime = ref(0)

// Debounced prefill function to prevent rapid successive calls
const debouncedPrefill = async () => {
  const now = Date.now()
  if (now - lastPrefillTime.value < 500) { // Debounce for 500ms
    return
  }
  
  lastPrefillTime.value = now
  isUpdatingCustomerData.value = true
  
  try {
    await prefillCustomerData()
  } finally {
    isUpdatingCustomerData.value = false
  }
}

// Watch for auth state changes (but not customerData changes to avoid loops)
watch(() => auth.isAuthenticated.value, async (isAuth, wasAuth) => {
  if (isUpdatingCustomerData.value) return
  
  console.log('Auth state changed:', { wasAuth, isAuth })
  
  // Only run when becoming authenticated
  if (isAuth && !wasAuth) {
    console.log('User logged in, prefilling data')
    await debouncedPrefill()
  }
}, { immediate: false })

// Watch for user data becoming available (when navigating while logged in)
watch(() => auth.user.value, async (newUser) => {
  if (isUpdatingCustomerData.value) return
  
  // Only prefill if we have a user but no email yet
  if (newUser && auth.isAuthenticated.value && !customerData.value.email) {
    console.log('User data available, prefilling email')
    await debouncedPrefill()
  }
}, { immediate: false })

// Order processing state
const isProcessingOrder = ref(false)

// Computed
const canCompleteOrder = computed(() => {
  const isValid = customerData.value &&
         paymentData.value &&
         customerData.value.firstName.trim() !== '' &&
         customerData.value.lastName.trim() !== '' &&
         customerData.value.email.trim() !== '' &&
         customerData.value.country.trim() !== '' &&
         paymentData.value.method &&
         cartCounter.cartCount.value > 0
  
  return isValid
})

// Handlers
const handleCustomerSubmit = (data: CustomerForm) => {
  console.log('Customer data submitted:', data)
}

const handleCompleteOrder = async () => {
  if (!canCompleteOrder.value) {
    toast.error('Please fill out all required fields to continue')
    return
  }

  // Validate payment method is selected
  if (!paymentData.value?.method) {
    toast.error('Please select a payment method')
    return
  }

  // Validate payment if card method is selected
  if (paymentData.value?.method === 'card') {
    if (!paymentMethodRef.value) {
      toast.error('Payment method not initialized')
      return
    }
    
    const isPaymentValid = paymentMethodRef.value.validatePayment()
    if (!isPaymentValid) {
      toast.error('Please fill out all card details correctly')
      return
    }
  }

  isProcessingOrder.value = true

  try {
    // Create order using the order store
    const order = await orderStore.createOrder(cartCounter.cartItems.value, {
      email: customerData.value.email,
      firstName: customerData.value.firstName,
      lastName: customerData.value.lastName
    })

    console.log('Created order:', order)

    // Simulate payment processing with proper validation
    let paymentIntentId: string | undefined
    if (paymentData.value.method === 'card') {
      // Simulate Stripe card validation
      console.log('Validating card details...')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulate successful payment
      paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      console.log('Payment processed successfully with ID:', paymentIntentId)
    } else {
      // Other payment methods
      console.log(`Processing ${paymentData.value.method} payment...`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      paymentIntentId = `${paymentData.value.method}_${Date.now()}`
    }
    
    // Process the payment and save to database
    const paymentResult = await orderStore.processPayment(order, {
      paymentIntentId,
      method: paymentData.value.method
    })

    if (!paymentResult.success) {
      throw new Error(paymentResult.error || 'Payment processing failed')
    }

    console.log('Order saved to database successfully!')
    
    // Save user information to database if user is authenticated and opted in
    if (auth.isAuthenticated.value && customerData.value.saveInfo) {
      try {
        await updateProfileFromCheckout({
          firstName: customerData.value.firstName,
          lastName: customerData.value.lastName,
          country: customerData.value.country
        })
        console.log('User profile updated with checkout information')
      } catch (error) {
        console.error('Failed to update user profile:', error)
        // Don't fail the order if profile update fails
      }
    }
    
    // Clear cart and redirect to success page with order ID
    cartCounter.clearCart()
    
    console.log('Order completed successfully!')
    await navigateTo(`/checkout/success?order_id=${order.id}`)
    
  } catch (error) {
    console.error('Order processing error:', error)
  } finally {
    isProcessingOrder.value = false
  }
}

// SEO
useSeoMeta({
  title: 'Checkout - Miracute',
  description: 'Complete your purchase of beautiful website templates',
  robots: 'noindex, nofollow'
})
</script>