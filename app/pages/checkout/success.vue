<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Loading State -->
    <div v-if="isLoading" class="container-custom py-16 text-center">
      <div class="max-w-md mx-auto">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-brown mb-4"></div>
        <h2 class="text-xl font-heading font-medium text-gray-900 mb-2">Processing your order...</h2>
        <p class="text-gray-600">Please wait while we confirm your payment.</p>
      </div>
    </div>

    <!-- Success State -->
    <div v-else-if="orderData" class="min-h-screen bg-neutral-50">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <NuxtLink to="/" class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <Icon name="heroicons:arrow-left" class="w-4 h-4" />
              <span class="text-sm font-medium">Back to Home</span>
            </NuxtLink>

            <div class="flex items-center space-x-2 text-brand-sage text-xs font-medium">
              <Icon name="heroicons:shield-check" class="w-3 h-3" />
              <span>Secure Purchase</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="py-8">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <!-- Success Hero Section -->
          <div class="text-center mb-10">
            <!-- Success Icon -->
            <div class="relative mb-6">
              <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-brand-sage to-brand-sage/80 rounded-full shadow-medium mb-4">
                <Icon name="heroicons:check" class="w-10 h-10 text-white" />
              </div>

              <!-- Floating celebration elements -->
              <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div class="absolute w-1.5 h-1.5 bg-brand-pink rounded-full animate-bounce top-[10%] left-[30%]"></div>
                <div class="absolute w-2 h-2 bg-brand-warm rounded-full animate-bounce delay-300 top-[20%] right-[25%]"></div>
                <div class="absolute w-1.5 h-1.5 bg-brand-sage rounded-full animate-bounce delay-600 bottom-[25%] left-[20%]"></div>
              </div>
            </div>

            <div class="space-y-3 mb-8">
              <h1 class="text-3xl md:text-4xl font-heading font-bold text-gray-900">
                Order Complete!
              </h1>
              <p class="text-xl text-gray-600 mb-2">
                Thank you for your purchase, {{ orderData.customer_name || orderData.customer_email || 'valued customer' }}!
              </p>
              <p class="text-gray-600 mb-8">
                Your order <span class="font-mono font-medium">#{{ orderData.id?.slice(-8)?.toUpperCase() || orderData.order_number }}</span> has been confirmed.
              </p>
              <div class="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                <Icon name="heroicons:calendar" class="w-4 h-4" />
                <span>{{ formatDate(new Date()) }} at {{ formatTime(new Date()) }}</span>
              </div>
            </div>
          </div>

          <!-- Content Grid -->
          <div class="grid lg:grid-cols-3 gap-6 mb-10">
            <!-- Main Download Section -->
            <div class="lg:col-span-2">
              <!-- Downloaded Files -->
              <div class="bg-white rounded-xl shadow-soft border border-gray-100 p-6">
                <div class="flex items-center justify-between mb-6">
                  <h2 class="text-xl font-semibold text-gray-900">Your Templates</h2>
                  <span class="px-3 py-1.5 bg-brand-sage/10 text-brand-sage rounded-full text-xs font-medium border border-brand-sage/20">
                    Ready to Download
                  </span>
                </div>

                <!-- Order Items -->
                <div class="space-y-3 mb-6">
                  <div v-for="item in orderItems" :key="item.id"
                       class="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors">
                    <div class="flex items-center space-x-3">
                      <!-- Product Image -->
                      <div class="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-brand-pink to-brand-sage flex-shrink-0">
                        <NuxtImg
                          v-if="item.product?.preview_images?.[0]"
                          :src="item.product.preview_images[0]"
                          :alt="item.product_name"
                          class="w-full h-full object-cover"
                        />
                        <Icon v-else name="heroicons:document-text" class="w-6 h-6 text-white m-3" />
                      </div>

                      <!-- Product Details -->
                      <div class="flex-1 min-w-0">
                        <h3 class="font-medium text-gray-900">{{ item.product_name }}</h3>
                        <p class="text-sm text-gray-600">
                          Quantity: {{ item.quantity }} × ${{ parseFloat(item.unit_price).toFixed(2) }}
                        </p>
                        <div class="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                          <span>{{ item.product?.file_size || 'N/A' }}</span>
                          <span v-if="item.product?.file_formats">•</span>
                          <span v-if="item.product?.file_formats">{{ item.product.file_formats.join(', ') }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Download Button -->
                    <div class="flex-shrink-0">
                      <button
                        @click="downloadFile(item)"
                        :disabled="item.downloading"
                        class="px-4 py-2 bg-brand-sage text-white rounded-lg font-medium hover:bg-brand-sage/90 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 text-sm"
                      >
                        <Icon v-if="item.downloading" name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
                        <Icon v-else name="heroicons:arrow-down-tray" class="w-4 h-4" />
                        <span>{{ item.downloading ? 'Downloading...' : 'Download' }}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Download All Button -->
                <div class="text-center">
                  <button
                    @click="downloadAllFiles"
                    :disabled="isDownloadingAll"
                    class="px-6 py-3 bg-brand-brown text-white rounded-xl font-medium hover:bg-brand-brown/90 transition-all duration-200 shadow-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon v-if="isDownloadingAll" name="heroicons:arrow-path" class="w-5 h-5 inline mr-2 animate-spin" />
                    <Icon v-else name="heroicons:cloud-arrow-down" class="w-5 h-5 inline mr-2" />
                    {{ isDownloadingAll ? 'Preparing Download...' : 'Download All Files' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-4">
              <!-- Order Details -->
              <div class="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Icon name="heroicons:receipt-percent" class="w-5 h-5 mr-2 text-brand-sage" />
                  Order Details
                </h3>

                <div class="space-y-3">
                  <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-gray-600 text-sm">Order ID</span>
                    <span class="font-mono text-gray-900 font-semibold text-sm">#{{ orderData.id?.slice(-8)?.toUpperCase() || orderData.order_number }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-gray-600 text-sm">Items</span>
                    <span class="text-gray-900 text-sm">{{ orderItems.length }} template{{ orderItems.length > 1 ? 's' : '' }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-b border-gray-100">
                    <span class="text-gray-600 text-sm">Total Paid</span>
                    <span class="text-brand-brown font-bold">${{ parseFloat(orderData.total_amount).toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-gray-600 text-sm">Status</span>
                    <span class="px-2 py-1 bg-brand-sage/10 text-brand-sage rounded-full text-xs font-medium border border-brand-sage/20">Completed</span>
                  </div>
                </div>
              </div>

              <!-- License Info -->
              <div class="bg-gradient-to-br from-brand-sage/5 to-brand-pink/5 rounded-xl shadow-soft border border-gray-100 p-4">
                <h3 class="text-base font-semibold text-gray-900 mb-3 flex items-center">
                  <Icon name="heroicons:shield-check" class="w-4 h-4 mr-2 text-brand-sage" />
                  License Included
                </h3>

                <div class="space-y-2 text-xs">
                  <div class="flex items-center space-x-2 text-gray-700">
                    <Icon name="heroicons:check-circle" class="w-3 h-3 text-brand-sage" />
                    <span>Commercial use allowed</span>
                  </div>
                  <div class="flex items-center space-x-2 text-gray-700">
                    <Icon name="heroicons:check-circle" class="w-3 h-3 text-brand-sage" />
                    <span>Unlimited projects</span>
                  </div>
                  <div class="flex items-center space-x-2 text-gray-700">
                    <Icon name="heroicons:check-circle" class="w-3 h-3 text-brand-sage" />
                    <span>Lifetime updates</span>
                  </div>
                  <div class="flex items-center space-x-2 text-gray-700">
                    <Icon name="heroicons:check-circle" class="w-3 h-3 text-brand-sage" />
                    <span>Premium support</span>
                  </div>
                </div>
              </div>

              <!-- Quick Actions -->
              <div class="bg-white rounded-xl shadow-soft border border-gray-100 p-4">
                <h3 class="text-base font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div class="space-y-2">
                  <NuxtLink v-if="user"
                            to="/account"
                            class="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-brand-sage text-white rounded-lg hover:bg-brand-sage/90 transition-colors text-sm">
                    <Icon name="heroicons:arrow-down-tray" class="w-3 h-3" />
                    <span>View My Downloads</span>
                  </NuxtLink>

                  <NuxtLink to="/listings"
                            class="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg transition-colors text-sm">
                    <Icon name="heroicons:sparkles" class="w-3 h-3" />
                    <span>Browse More</span>
                  </NuxtLink>

                  <NuxtLink to="/contact"
                            class="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg transition-colors text-sm">
                    <Icon name="heroicons:chat-bubble-left-right" class="w-3 h-3" />
                    <span>Get Support</span>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <!-- Important Info -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h3 class="font-medium text-blue-900 mb-3 flex items-center">
              <Icon name="heroicons:information-circle" class="w-5 h-5 mr-2" />
              Important Information
            </h3>
            <ul class="text-sm text-blue-800 space-y-2">
              <li>• Your files are available for immediate download</li>
              <li>• You can access your downloads anytime from your account</li>
              <li>• Download links are generated securely for each request</li>
              <li>• A confirmation email has been sent to {{ orderData.customer_email }}</li>
              <li v-if="!user">• Create an account to manage your downloads easily</li>
            </ul>
          </div>

          <!-- Create Account CTA (for guests) -->
          <div v-if="!user"
               class="bg-gradient-to-r from-brand-pink to-brand-sage rounded-2xl p-8 mb-8 text-white">
            <h3 class="text-xl font-heading font-medium mb-3">Create Your Account</h3>
            <p class="mb-6">Create a free account to easily access all your downloads and manage your orders.</p>
            <NuxtLink :to="`/auth/register?email=${encodeURIComponent(orderData.customer_email)}`"
                      class="btn-primary bg-white text-gray-900 hover:bg-gray-100">
              Create Free Account
            </NuxtLink>
          </div>

          <!-- Footer Message -->
          <div class="text-center">
            <div class="inline-flex items-center space-x-2 bg-white rounded-full shadow-soft border border-gray-100 px-6 py-3">
              <Icon name="heroicons:heart" class="w-5 h-5 text-brand-pink" />
              <span class="text-base font-medium text-gray-900">Thank you for choosing Miracute!</span>
              <Icon name="heroicons:star" class="w-5 h-5 text-brand-warm" />
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Error State -->
    <div v-else class="container-custom py-16 text-center">
      <div class="max-w-md mx-auto">
        <Icon name="heroicons:exclamation-triangle" class="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h2 class="text-2xl font-heading font-medium text-gray-900 mb-4">
          Order Not Found
        </h2>
        <p class="text-gray-600 mb-8">
          We couldn't find your order. This might be because:
        </p>
        <ul class="text-left text-sm text-gray-600 mb-8 space-y-1">
          <li>• The payment is still processing</li>
          <li>• The session ID is invalid or expired</li>
          <li>• There was an issue with the payment</li>
        </ul>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/contact" class="btn-primary">
            Contact Support
          </NuxtLink>
          <NuxtLink to="/listings" class="btn-secondary">
            Continue Shopping
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { OrderService, PaymentService, FileService } from '~/services'
import type { Order } from '@/types/commerce/order'

useSeoMeta({
  title: 'Order Complete | Miracute',
  description: 'Your order has been successfully processed. Download your templates now.',
  robots: 'noindex, nofollow'
})

const route = useRoute()
const user = useSupabaseUser()
const { error: toast } = useToast()

const isLoading = ref(true)
const orderData = ref<Order | null>(null)
const orderItems = ref<any[]>([])
const isDownloadingAll = ref(false)

const sessionId = route.query.session_id as string
const orderId = route.query.order_id as string || route.query.order as string

const loadOrderData = async () => {
  try {
    isLoading.value = true

    if (sessionId) {
      console.log('Processing payment success for session:', sessionId)
      const response = await PaymentService.processPaymentWebhook(sessionId)

      if (response.success && response.data) {
        console.log('Payment processed successfully:', response)
        await navigateTo(`/checkout/success?order_id=${response.data.order_id}`, { replace: true })
        return
      } else {
        console.error('Payment processing failed:', response)
        toast('There was an issue processing your payment. Please contact support.')
        return
      }
    }

    if (orderId) {
      console.log('Fetching order details for:', orderId)
      const orderResponse = await OrderService.getOrder(orderId)

      if (orderResponse.success && orderResponse.data) {
        orderData.value = orderResponse.data
        orderItems.value = orderResponse.data.items || []

        orderItems.value.forEach(item => {
          item.downloading = false
        })

        console.log('Order loaded successfully with', orderItems.value.length, 'items')
        return
      }
    }

    if (user.value) {
      console.log('Fetching recent orders as fallback...')
    }

    console.error('No order found')

  } catch (error: any) {
    console.error('Failed to load order data:', error)
    toast('There was an issue loading your order. Please contact support.')
  } finally {
    isLoading.value = false
  }
}

const downloadFile = async (item: any) => {
  item.downloading = true

  try {
    if (!item.download_files || !item.download_files.length) {
      throw new Error('No download files available')
    }

    const file = item.download_files[0]
    const response = await FileService.getDownloadUrl(item.product_id, file.filename)

    if (response.success && response.data) {
      const link = document.createElement('a')
      link.href = response.data.downloadUrl
      link.download = file.filename
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      throw new Error(response.error || 'Failed to generate download link')
    }
  } catch (error: any) {
    console.error('Download error:', error)
    toast(error.message || 'Download failed. Please try again or contact support.')
  } finally {
    item.downloading = false
  }
}

const downloadAllFiles = async () => {
  isDownloadingAll.value = true

  try {
    for (const item of orderItems.value) {
      await downloadFile(item)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  } catch (error) {
    toast('Some downloads may have failed. Please try individual downloads.')
  } finally {
    isDownloadingAll.value = false
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

onMounted(async () => {
  await loadOrderData()
})

onBeforeRouteLeave(() => {
  if (typeof window !== 'undefined') {
    window.history.replaceState({}, document.title, window.location.pathname)
  }
})
</script>