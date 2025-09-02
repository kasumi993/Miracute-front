<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="inline-flex items-center px-4 py-2 text-gray-600">
        <Icon name="heroicons:arrow-path" class="w-5 h-5 mr-2 animate-spin" />
        Loading order details...
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <Icon name="heroicons:x-circle" class="w-8 h-8 text-red-600 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-red-800 mb-2">Order Not Found</h3>
      <p class="text-red-700 mb-4">{{ error }}</p>
      <NuxtLink to="/dashboard/orders" class="btn-primary">
        Back to Orders
      </NuxtLink>
    </div>

    <!-- Order Details -->
    <div v-else-if="order">
      <!-- Header with Back Button -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center space-x-4">
          <NuxtLink 
            to="/dashboard/orders" 
            class="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Icon name="heroicons:arrow-left" class="w-5 h-5 mr-2" />
            Back to Orders
          </NuxtLink>
          <div class="h-6 w-px bg-gray-300"></div>
          <div>
            <h1 class="text-3xl font-heading font-medium text-gray-900">
              Order #{{ order.order_number }}
            </h1>
            <p class="text-gray-600 mt-1">{{ formatDate(order.created_at) }}</p>
          </div>
        </div>
        
        <!-- Status Badge -->
        <div class="flex space-x-3">
          <span 
            class="inline-flex px-3 py-1 text-sm font-medium rounded-full"
            :class="getStatusClasses(order.status)"
          >
            {{ order.status }}
          </span>
          <span 
            class="inline-flex px-3 py-1 text-sm font-medium rounded-full"
            :class="getPaymentStatusClasses(order.payment_status)"
          >
            {{ order.payment_status }}
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Order Items -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>
            
            <div class="space-y-4">
              <div 
                v-for="item in order.order_items" 
                :key="item.id"
                class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                <!-- Product Image (placeholder) -->
                <div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="heroicons:photo" class="w-8 h-8 text-gray-400" />
                </div>
                
                <!-- Product Details -->
                <div class="flex-1">
                  <h3 class="font-medium text-gray-900">{{ item.product_name }}</h3>
                  <p class="text-sm text-gray-600">{{ item.product_slug }}</p>
                  <div class="flex items-center space-x-4 mt-2">
                    <span class="text-sm text-gray-500">Quantity: {{ item.quantity }}</span>
                    <span class="text-sm font-medium text-gray-900">
                      ${{ parseFloat(item.unit_price).toFixed(2) }} each
                    </span>
                  </div>
                </div>
                
                <!-- Item Total -->
                <div class="text-right">
                  <div class="text-lg font-medium text-gray-900">
                    ${{ parseFloat(item.total_price).toFixed(2) }}
                  </div>
                  
                  <!-- Download Info -->
                  <div v-if="item.download_url" class="mt-2">
                    <div class="text-xs text-gray-500">
                      Downloads: {{ item.download_count }}/{{ item.max_downloads }}
                    </div>
                    <div v-if="item.download_expires_at" class="text-xs text-gray-500">
                      Expires: {{ formatDate(item.download_expires_at) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Order Total -->
            <div class="border-t border-gray-200 mt-6 pt-6">
              <div class="flex justify-between items-center">
                <div class="space-y-1">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Subtotal:</span>
                    <span class="font-medium">${{ parseFloat(order.subtotal).toFixed(2) }}</span>
                  </div>
                  <div v-if="order.tax_amount && parseFloat(order.tax_amount) > 0" class="flex justify-between">
                    <span class="text-gray-600">Tax:</span>
                    <span class="font-medium">${{ parseFloat(order.tax_amount).toFixed(2) }}</span>
                  </div>
                  <div v-if="order.discount_amount && parseFloat(order.discount_amount) > 0" class="flex justify-between">
                    <span class="text-gray-600">Discount:</span>
                    <span class="font-medium text-green-600">-${{ parseFloat(order.discount_amount).toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between text-lg font-semibold pt-2 border-t">
                    <span>Total:</span>
                    <span class="text-brand-brown">${{ parseFloat(order.total_amount).toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Order Timeline -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Order Timeline</h2>
            
            <div class="space-y-4">
              <div class="flex items-start space-x-4">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p class="font-medium text-gray-900">Order Created</p>
                  <p class="text-sm text-gray-600">{{ formatDate(order.created_at) }}</p>
                </div>
              </div>
              
              <div v-if="order.payment_status === 'paid'" class="flex items-start space-x-4">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p class="font-medium text-gray-900">Payment Received</p>
                  <p class="text-sm text-gray-600">{{ formatDate(order.updated_at) }}</p>
                </div>
              </div>
              
              <div v-if="order.status === 'completed'" class="flex items-start space-x-4">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p class="font-medium text-gray-900">Order Completed</p>
                  <p class="text-sm text-gray-600">{{ formatDate(order.updated_at) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Customer Information -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Customer</h2>
            
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-600">Name</label>
                <p class="text-gray-900">{{ order.customer_name || 'Guest Customer' }}</p>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-600">Email</label>
                <p class="text-gray-900">{{ order.customer_email }}</p>
              </div>
              
              <div v-if="order.billing_address">
                <label class="block text-sm font-medium text-gray-600">Billing Address</label>
                <div class="text-gray-900 text-sm">
                  <p v-if="order.billing_address.line1">{{ order.billing_address.line1 }}</p>
                  <p v-if="order.billing_address.line2">{{ order.billing_address.line2 }}</p>
                  <p v-if="order.billing_address.city || order.billing_address.state || order.billing_address.postal_code">
                    {{ order.billing_address.city }}{{ order.billing_address.state ? ', ' + order.billing_address.state : '' }} {{ order.billing_address.postal_code }}
                  </p>
                  <p v-if="order.billing_address.country">{{ order.billing_address.country }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Information -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Payment</h2>
            
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-600">Payment Method</label>
                <p class="text-gray-900 capitalize">{{ order.payment_method || 'Card' }}</p>
              </div>
              
              <div v-if="order.stripe_payment_intent_id">
                <label class="block text-sm font-medium text-gray-600">Payment Intent ID</label>
                <p class="text-gray-900 text-sm font-mono">{{ order.stripe_payment_intent_id }}</p>
              </div>
            </div>
          </div>

          <!-- Order Actions -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
            
            <div class="space-y-3">
              <!-- Status Update -->
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">Update Status</label>
                <select
                  :value="order.status"
                  @change="updateStatus($event.target.value)"
                  :disabled="updatingStatus"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              
              <!-- Resend Email -->
              <button
                @click="resendConfirmationEmail"
                :disabled="sendingEmail"
                class="w-full btn-outline"
              >
                <Icon :name="sendingEmail ? 'heroicons:arrow-path' : 'heroicons:envelope'" 
                      :class="['w-4 h-4 mr-2', { 'animate-spin': sendingEmail }]" />
                {{ sendingEmail ? 'Sending...' : 'Resend Confirmation' }}
              </button>
            </div>
          </div>
          
          <!-- Notes -->
          <div v-if="order.notes" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">Notes</h2>
            <p class="text-gray-700">{{ order.notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OrderWithItems } from '~/types/database'

// Middleware and SEO
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

// Get order ID from route
const route = useRoute()
const orderId = route.params.id as string

useSeoMeta({
  title: `Order #${orderId.slice(0, 8)} | Dashboard`,
  description: 'Order details and management',
  robots: 'noindex, nofollow'
})

// State
const loading = ref(true)
const error = ref('')
const order = ref<OrderWithItems | null>(null)
const updatingStatus = ref(false)
const sendingEmail = ref(false)

// Fetch order details
const fetchOrder = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch(`/api/admin/orders/${orderId}`)
    order.value = response.data
  } catch (err: any) {
    console.error('Failed to fetch order:', err)
    error.value = err.data?.message || 'Failed to load order details'
  } finally {
    loading.value = false
  }
}

// Update order status
const updateStatus = async (newStatus: string) => {
  if (!order.value || newStatus === order.value.status) return
  
  updatingStatus.value = true
  
  try {
    await $fetch(`/api/admin/orders/${orderId}`, {
      method: 'PATCH',
      body: { status: newStatus }
    })
    
    order.value.status = newStatus as any
    useToast().success('Order status updated successfully')
    
  } catch (err: any) {
    console.error('Failed to update order status:', err)
    useToast().error('Failed to update order status')
  } finally {
    updatingStatus.value = false
  }
}

// Resend confirmation email
const resendConfirmationEmail = async () => {
  if (!order.value) return
  
  sendingEmail.value = true
  
  try {
    await $fetch(`/api/admin/orders/${orderId}/resend-email`, {
      method: 'POST'
    })
    
    useToast().success('Confirmation email sent successfully')
    
  } catch (err: any) {
    console.error('Failed to resend email:', err)
    useToast().error('Failed to send confirmation email')
  } finally {
    sendingEmail.value = false
  }
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Status styling
const getStatusClasses = (status: string) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  }
  return classes[status as keyof typeof classes] || classes.pending
}

// Payment status styling
const getPaymentStatusClasses = (status: string) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  }
  return classes[status as keyof typeof classes] || classes.pending
}

// Load order on mount
onMounted(() => {
  fetchOrder()
})
</script>
