<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
      <div>
        <h1 class="text-2xl sm:text-3xl font-heading font-medium text-gray-900">Products</h1>
        <p class="text-gray-600 mt-2 text-sm sm:text-base">Manage your digital templates and downloads</p>
      </div>
      
      <NuxtLink to="/dashboard/products/create" class="btn-primary w-full sm:w-auto justify-center">
        <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
        <span class="sm:inline">Add Template</span>
      </NuxtLink>
    </div>

      <!-- Products List -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <!-- Loading State -->
        <div v-if="isLoading" class="p-8 text-center text-gray-500">
          <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading products...</p>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="products.length === 0" class="p-8 text-center text-gray-500">
          <Icon name="heroicons:squares-2x2" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p class="text-lg font-medium mb-2">No products found</p>
          <NuxtLink to="/dashboard/products/create" class="text-brand-brown hover:text-brand-brown/80 font-medium">
            Create your first template →
          </NuxtLink>
        </div>

        <!-- Desktop Table View (hidden on mobile) -->
        <div v-else class="hidden lg:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  File
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-12 w-12">
                      <img 
                        v-if="product.preview_images?.[0]" 
                        class="h-12 w-12 rounded-lg object-cover"
                        :src="product.preview_images[0]" 
                        :alt="product.name"
                      />
                      <div v-else class="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Icon name="heroicons:photo" class="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ product.name }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ product.short_description?.substring(0, 60) }}...
                      </div>
                    </div>
                  </div>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-900">
                    {{ product.category?.name || getCategoryName(product.category_id) }}
                  </span>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">
                    ${{ parseFloat(product.price).toFixed(2) }}
                  </div>
                  <div v-if="product.compare_at_price" class="text-sm text-gray-500 line-through">
                    ${{ parseFloat(product.compare_at_price).toFixed(2) }}
                  </div>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center space-x-2">
                    <span 
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      :class="{
                        'bg-green-100 text-green-800': product.is_active,
                        'bg-gray-100 text-gray-800': !product.is_active
                      }"
                    >
                      {{ product.is_active ? 'Active' : 'Inactive' }}
                    </span>
                    <span 
                      v-if="product.is_featured"
                      class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
                    >
                      Featured
                    </span>
                  </div>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <Icon 
                      :name="product.download_files?.length ? 'heroicons:document-check' : 'heroicons:document-minus'" 
                      :class="product.download_files?.length ? 'text-green-600' : 'text-red-400'"
                      class="w-5 h-5 mr-2" 
                    />
                    <span class="text-sm" :class="product.download_files?.length ? 'text-green-800' : 'text-red-600'">
                      {{ product.download_files?.length ? 'Uploaded' : 'Missing' }}
                    </span>
                  </div>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(product.created_at) }}
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">                    
                    <button
                      @click="toggleProductStatus(product)"
                      class="text-gray-600 hover:text-gray-900 p-1"
                      :title="product.is_active ? 'Deactivate' : 'Activate'"
                    >
                      <Icon :name="product.is_active ? 'heroicons:eye-slash' : 'heroicons:eye'" class="w-4 h-4" />
                    </button>
                    
                    <button
                      @click="deleteProduct(product)"
                      class="text-red-600 hover:text-red-900 p-1"
                      title="Delete"
                    >
                      <Icon name="heroicons:trash" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Card View (hidden on desktop) -->
        <div v-if="!isLoading && products.length > 0" class="lg:hidden divide-y divide-gray-200">
          <div 
            v-for="product in products" 
            :key="product.id" 
            class="p-4 hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-start space-x-4">
              <!-- Product Image -->
              <div class="flex-shrink-0">
                <img 
                  v-if="product.preview_images?.[0]" 
                  class="h-16 w-16 sm:h-20 sm:w-20 rounded-lg object-cover"
                  :src="product.preview_images[0]" 
                  :alt="product.name"
                />
                <div v-else class="h-16 w-16 sm:h-20 sm:w-20 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Icon name="heroicons:photo" class="w-8 h-8 text-gray-400" />
                </div>
              </div>

              <!-- Product Details -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0">
                    <h3 class="text-sm font-semibold text-gray-900 truncate pr-2">
                      {{ product.name }}
                    </h3>
                    <p class="text-xs text-gray-500 mt-1 line-clamp-2">
                      {{ product.short_description }}
                    </p>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center space-x-1 flex-shrink-0">
                    <button
                      @click="toggleProductStatus(product)"
                      class="text-gray-600 hover:text-gray-900 p-2"
                      :title="product.is_active ? 'Deactivate' : 'Activate'"
                    >
                      <Icon :name="product.is_active ? 'heroicons:eye-slash' : 'heroicons:eye'" class="w-4 h-4" />
                    </button>
                    
                    <button
                      @click="deleteProduct(product)"
                      class="text-red-600 hover:text-red-900 p-2"
                      title="Delete"
                    >
                      <Icon name="heroicons:trash" class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <!-- Meta Information -->
                <div class="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <span class="text-gray-500">Category:</span>
                    <span class="ml-1 text-gray-900">{{ product.category?.name || getCategoryName(product.category_id) }}</span>
                  </div>
                  
                  <div>
                    <span class="text-gray-500">Price:</span>
                    <span class="ml-1 font-medium text-gray-900">
                      ${{ parseFloat(product.price).toFixed(2) }}
                    </span>
                    <span v-if="product.compare_at_price" class="ml-1 text-gray-500 line-through">
                      ${{ parseFloat(product.compare_at_price).toFixed(2) }}
                    </span>
                  </div>

                  <div>
                    <span class="text-gray-500">Status:</span>
                    <span 
                      class="ml-1 inline-flex px-2 py-0.5 text-xs font-medium rounded-full"
                      :class="{
                        'bg-green-100 text-green-800': product.is_active,
                        'bg-gray-100 text-gray-800': !product.is_active
                      }"
                    >
                      {{ product.is_active ? 'Active' : 'Inactive' }}
                    </span>
                    <span 
                      v-if="product.is_featured"
                      class="ml-1 inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                    >
                      Featured
                    </span>
                  </div>

                  <div>
                    <span class="text-gray-500">File:</span>
                    <span 
                      class="ml-1 inline-flex items-center"
                      :class="product.download_files?.length ? 'text-green-800' : 'text-red-600'"
                    >
                      <Icon 
                        :name="product.download_files?.length ? 'heroicons:document-check' : 'heroicons:document-minus'" 
                        class="w-3 h-3 mr-1" 
                      />
                      {{ product.download_files?.length ? 'Uploaded' : 'Missing' }}
                    </span>
                  </div>

                  <div class="col-span-2">
                    <span class="text-gray-500">Created:</span>
                    <span class="ml-1 text-gray-900">{{ formatDate(product.created_at) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
// Middleware
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

// SEO
useSeoMeta({
  title: 'Products | Dashboard',
  description: 'Manage your digital templates and products',
  robots: 'noindex, nofollow'
})

// Composables
const supabase = useSupabaseClient()

// State
const isLoading = ref(false)
const products = ref([])
const categories = ref([])

// Methods
const loadProducts = async () => {
  isLoading.value = true
  
  try {
    const response = await $fetch('/api/admin/products')
    products.value = response.data || []
  } catch (error) {
    console.error('Error loading products:', error)
    useToast().error('Failed to load products')
  } finally {
    isLoading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await $fetch('/api/admin/categories')
    categories.value = response.data.filter(cat => cat.is_active) || []
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

const getCategoryName = (categoryId) => {
  if (!categoryId) return 'Uncategorized'
  const category = categories.value.find(cat => cat.id === categoryId)
  return category?.name || 'Unknown'
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const toggleProductStatus = async (product) => {
  try {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !product.is_active })
      .eq('id', product.id)
    
    if (error) throw error
    
    product.is_active = !product.is_active
    useToast().success(`Product ${product.is_active ? 'activated' : 'deactivated'}`)
  } catch (error) {
    console.error('Error updating product status:', error)
    useToast().error('Failed to update product status')
  }
}

const deleteProduct = async (product) => {
  if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
    return
  }
  
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', product.id)
    
    if (error) throw error
    
    useToast().success('Product deleted successfully')
    await loadProducts()
  } catch (error) {
    console.error('Error deleting product:', error)
    useToast().error('Failed to delete product')
  }
}

// Initialize
onMounted(async () => {
  await Promise.all([
    loadCategories(),
    loadProducts()
  ])
})
</script>
