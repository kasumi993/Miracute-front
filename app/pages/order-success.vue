<template>
  <div class="min-h-screen bg-neutral-50">
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
            <p class="text-lg text-gray-600 max-w-2xl mx-auto">
              Thank you for your purchase! Your templates are ready to download.
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

              <!-- Loading State -->
              <div v-if="isLoading" class="space-y-3 mb-6">
                <div v-for="i in 2" :key="i" class="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div class="space-y-2">
                      <div class="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                      <div class="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
                      <div class="h-2 bg-gray-200 rounded w-20 animate-pulse"></div>
                    </div>
                  </div>
                  <div class="w-24 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>

              <!-- Purchased items -->
              <div v-else class="space-y-3 mb-6">
                <div v-for="item in purchasedItems" :key="item.id" class="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors">
                  <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-brand-pink to-brand-sage rounded-lg flex items-center justify-center">
                      <Icon name="heroicons:document-text" class="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 class="text-base font-semibold text-gray-900">{{ item.name }}</h3>
                      <p class="text-gray-600 text-xs">{{ item.description }}</p>
                      <div class="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                        <span>{{ item.fileSize }}</span>
                        <span>•</span>
                        <span>{{ item.fileType }}</span>
                      </div>
                    </div>
                  </div>
                  
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
                  <span class="font-mono text-gray-900 font-semibold text-sm">#{{ orderNumber }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <span class="text-gray-600 text-sm">Items</span>
                  <span v-if="isLoading" class="h-4 w-16 bg-gray-200 rounded animate-pulse"></span>
                  <span v-else class="text-gray-900 text-sm">{{ purchasedItems.length }} template{{ purchasedItems.length > 1 ? 's' : '' }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-100">
                  <span class="text-gray-600 text-sm">Total Paid</span>
                  <span class="text-brand-brown font-bold">${{ totalAmount.toFixed(2) }}</span>
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
                <NuxtLink 
                  to="/account/orders" 
                  class="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg transition-colors text-sm"
                >
                  <Icon name="heroicons:folder-open" class="w-3 h-3" />
                  <span>View All Orders</span>
                </NuxtLink>
                
                <NuxtLink 
                  to="/templates" 
                  class="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg transition-colors text-sm"
                >
                  <Icon name="heroicons:sparkles" class="w-3 h-3" />
                  <span>Browse More</span>
                </NuxtLink>
                
                <NuxtLink 
                  to="/contact" 
                  class="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg transition-colors text-sm"
                >
                  <Icon name="heroicons:chat-bubble-left-right" class="w-3 h-3" />
                  <span>Get Support</span>
                </NuxtLink>
              </div>
            </div>
          </div>
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
</template>

<script setup lang="ts">
interface PurchasedItem {
  id: string
  name: string
  description: string
  fileSize: string
  fileType: string
  downloadUrl: string
  price: number
  downloading: boolean
}

interface Order {
  id: string
  order_number: string
  total_amount: number
  payment_status: string
  order_items: Array<{
    id: string
    product_id: string
    quantity: number
    unit_price: number
    product: {
      id: string
      name: string
      description: string
      short_description: string
      file_size?: string
      file_formats?: string[]
      download_url?: string
    }
  }>
}

// State
const purchasedItems = ref<PurchasedItem[]>([])
const isDownloadingAll = ref(false)
const isLoading = ref(true)
const orderData = ref<Order | null>(null)

// Get route params for order validation (optional)
const route = useRoute()
const orderId = route.query.order_id as string

// Auth check
const user = useSupabaseUser()

// Computed values
const orderNumber = computed(() => {
  return orderData.value?.order_number || 'N/A'
})

const totalAmount = computed(() => {
  return orderData.value?.total_amount || 0
})

// Fetch purchased templates
const fetchPurchasedTemplates = async () => {
  try {
    isLoading.value = true

    if (!user.value) {
      console.error('User not authenticated')
      throw new Error('User not authenticated')
    }

    console.log('Fetching order with ID:', orderId)

    // If we have an order ID, try to fetch that specific order first
    if (orderId) {
      try {
        const orderResponse = await $fetch(`/api/orders/${orderId}`)
        console.log('Specific order response:', orderResponse)
        
        if (orderResponse.success && orderResponse.data) {
          const order = orderResponse.data
          
          if (order.payment_status === 'paid' && order.order_items?.length) {
            orderData.value = order
            
            // Transform order items to purchased items
            purchasedItems.value = order.order_items.map((item: any) => ({
              id: item.product?.id || item.product_id,
              name: item.product?.name || item.product_name,
              description: item.product?.short_description || item.product?.description || 'Digital template',
              fileSize: item.product?.file_size || 'N/A',
              fileType: item.product?.file_formats?.join(', ') || 'Digital Template',
              downloadUrl: item.download_url || item.product?.download_files?.[0] || `/api/downloads/${item.product?.id || item.product_id}`,
              price: parseFloat(item.unit_price),
              downloading: false
            }))
            
            console.log('Successfully loaded order with', purchasedItems.value.length, 'items')
            return // Success, exit early
          }
        }
      } catch (orderError) {
        console.error('Error fetching specific order:', orderError)
        // Continue to fallback method
      }
    }

    // Fallback: Fetch user's recent paid orders
    console.log('Fetching recent orders as fallback...')
    const response = await $fetch('/api/account/orders', {
      query: { limit: 5 }
    })
    console.log('Orders response:', response)

    if (!response.success || !response.data?.length) {
      console.error('No orders found for user')
      throw new Error('No orders found')
    }

    // Find the most recent completed order
    const targetOrder = response.data
      .filter((order: Order) => order.payment_status === 'paid' && order.order_items?.length)
      .sort((a: Order, b: Order) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

    if (!targetOrder) {
      console.error('No paid orders with items found')
      throw new Error('No purchased templates found')
    }

    console.log('Using fallback order:', targetOrder.id)
    orderData.value = targetOrder

    // Transform order items to purchased items
    purchasedItems.value = targetOrder.order_items.map((item: any) => ({
      id: item.product?.id || item.product_id,
      name: item.product?.name || item.product_name,
      description: item.product?.short_description || item.product?.description || 'Digital template',
      fileSize: item.product?.file_size || 'N/A',
      fileType: item.product?.file_formats?.join(', ') || 'Digital Template',
      downloadUrl: item.download_url || item.product?.download_files?.[0] || `/api/downloads/${item.product?.id || item.product_id}`,
      price: parseFloat(item.unit_price),
      downloading: false
    }))

    console.log('Successfully loaded', purchasedItems.value.length, 'purchased items')

  } catch (error) {
    console.error('Error fetching purchased templates:', error)
    
    // Show error message before redirecting
    useToast().error('Could not load your purchase details. Redirecting to templates...')
    
    // Redirect to templates page if no purchases found
    setTimeout(async () => {
      await navigateTo('/templates')
    }, 2000)
    
    return
  } finally {
    isLoading.value = false
  }
}

// Download individual file
const downloadFile = async (item: PurchasedItem) => {
  item.downloading = true
  
  try {
    // Call the download API endpoint
    const response = await $fetch(`/api/downloads/${item.id}`, {
      method: 'GET',
      responseType: 'blob'
    })
    
    // Create download link
    const blob = new Blob([response])
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${item.name.toLowerCase().replace(/\s+/g, '-')}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    useToast().success(`${item.name} downloaded successfully!`)
  } catch (error) {
    console.error('Download error:', error)
    
    // Fallback to direct download URL if available
    try {
      const link = document.createElement('a')
      link.href = item.downloadUrl
      link.download = `${item.name.toLowerCase().replace(/\s+/g, '-')}.zip`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      useToast().success(`${item.name} download started!`)
    } catch (fallbackError) {
      useToast().error('Download failed. Please try again or contact support.')
    }
  } finally {
    item.downloading = false
  }
}

// Download all files
const downloadAllFiles = async () => {
  isDownloadingAll.value = true
  
  try {
    // Download each file with a slight delay
    for (const item of purchasedItems.value) {
      await downloadFile(item)
      // Small delay between downloads to prevent server overload
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    useToast().success('All files downloaded successfully!')
  } catch (error) {
    useToast().error('Some downloads may have failed. Please try individual downloads.')
  } finally {
    isDownloadingAll.value = false
  }
}

// Format date function
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Format time function
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

// Initialize when component mounts
onMounted(async () => {
  await fetchPurchasedTemplates()
})

// Watch for user changes
watch(user, async (newUser) => {
  if (newUser && !orderData.value) {
    await fetchPurchasedTemplates()
  } else if (!newUser) {
    await navigateTo('/auth/login')
  }
}, { immediate: true })

// SEO Meta
useSeoMeta({
  title: 'Order Successful - Miracute',
  description: 'Your order has been processed successfully. Thank you for your purchase!',
  robots: 'noindex, nofollow'
})

// Set page meta
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})
</script>