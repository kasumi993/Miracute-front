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

definePageMeta({
  layout: 'default'
})

// Composables
const cartCounter = useCartCounter()
const { saveCheckoutInfo, loadSavedCheckoutInfo, hasSavedInfo } = useSavedCheckout()
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

// Load saved checkout information on mount
onMounted(() => {
  const savedInfo = loadSavedCheckoutInfo()
  if (savedInfo && hasSavedInfo()) {
    customerData.value = {
      firstName: savedInfo.firstName || '',
      lastName: savedInfo.lastName || '',
      email: savedInfo.email || '',
      country: savedInfo.country || '',
      newsletter: savedInfo.newsletter || false,
      saveInfo: savedInfo.saveInfo || true
    }
    isUsingStoredInfo.value = true
    console.log('Loaded saved checkout information')
  }
})

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
    // Prepare order data
    const orderData = {
      customer: customerData.value,
      payment: paymentData.value,
      items: cartCounter.cartItems.value,
      total: cartCounter.cartTotal.value
    }

    console.log('Processing order:', orderData)

    // TODO: Implement actual payment processing
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate processing
    
    // Save checkout information if user opted in (excluding card details)
    if (customerData.value) {
      saveCheckoutInfo(customerData.value)
    }
    
    // Clear cart and redirect to success page
    cartCounter.clearCart()
    console.log('Order completed successfully!')
    await navigateTo('/order-success')
    
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