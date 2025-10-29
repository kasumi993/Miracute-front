<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 py-8">
      <!-- Backdrop -->
      <div
        @click="$emit('close')"
        class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      ></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 class="text-lg font-heading font-semibold text-gray-900">Select Products</h3>
            <p class="text-sm text-gray-600">Choose products to include in your bundle</p>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>

        <!-- Search -->
        <div class="p-6 border-b border-gray-100">
          <div class="relative">
            <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search products..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown transition-colors"
            />
          </div>
        </div>

        <!-- Products List -->
        <div class="flex-1 overflow-y-auto p-6">
          <div v-if="isLoading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-brown"></div>
            <p class="text-gray-600 mt-2">Loading products...</p>
          </div>

          <div v-else-if="filteredProducts?.length === 0" class="text-center py-8 text-gray-500">
            <Icon name="heroicons:squares-2x2" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No products found</p>
            <p class="text-sm">Try adjusting your search terms</p>
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="product in filteredProducts || []"
              :key="product.id"
              @click="toggleProduct(product.id)"
              :class="[
                'border rounded-lg p-4 cursor-pointer transition-all',
                selectedProductIds.includes(product.id)
                  ? 'border-brand-brown bg-brand-brown/5 ring-2 ring-brand-brown/20'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              ]"
            >
              <!-- Product Image -->
              <div class="aspect-video mb-3 rounded-lg overflow-hidden bg-gray-100">
                <img
                  v-if="product.preview_images?.[0]"
                  :src="product.preview_images[0]"
                  :alt="product.name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <Icon name="heroicons:photo" class="w-8 h-8 text-gray-400" />
                </div>
              </div>

              <!-- Product Info -->
              <div class="space-y-2">
                <div class="flex items-start justify-between">
                  <h3 class="font-medium text-gray-900 text-sm leading-tight line-clamp-2">
                    {{ product.name }}
                  </h3>
                  <div
                    :class="[
                      'ml-2 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0',
                      selectedProductIds.includes(product.id)
                        ? 'border-brand-brown bg-brand-brown'
                        : 'border-gray-300'
                    ]"
                  >
                    <Icon
                      v-if="selectedProductIds.includes(product.id)"
                      name="heroicons:check"
                      class="w-3 h-3 text-white"
                    />
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <span class="text-lg font-semibold text-gray-900">${{ product.price }}</span>
                  <span
                    :class="[
                      'px-2 py-1 text-xs font-medium rounded-full',
                      product.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    ]"
                  >
                    {{ product.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>

                <p v-if="product.description" class="text-xs text-gray-600 line-clamp-2">
                  {{ product.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between p-6 border-t border-gray-200">
          <p class="text-sm text-gray-600">
            {{ selectedProductIds.length }} product{{ selectedProductIds.length !== 1 ? 's' : '' }} selected
          </p>

          <div class="flex items-center space-x-3">
            <button
              @click="$emit('close')"
              class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              @click="handleConfirm"
              :disabled="selectedProductIds.length === 0"
              class="px-4 py-2 bg-brand-brown text-white rounded-lg hover:bg-brand-brown/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as ProductService from '@/services/ProductService'
import type { ProductWithCategory } from '@/services/ProductService'

interface Props {
  selectedIds?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  selectedIds: () => []
})

const emit = defineEmits<{
  close: []
  select: [productIds: string[]]
}>()

// State
const isLoading = ref(true)
const searchQuery = ref('')
const products = ref<ProductWithCategory[]>([])
const selectedProductIds = ref<string[]>([...props.selectedIds])

// Computed
const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value || []

  const query = searchQuery.value.toLowerCase()
  return (products.value || []).filter(product =>
    product.name.toLowerCase().includes(query) ||
    product.description?.toLowerCase().includes(query)
  )
})

// Methods
const toggleProduct = (productId: string) => {
  const index = selectedProductIds.value.indexOf(productId)
  if (index > -1) {
    selectedProductIds.value.splice(index, 1)
  } else {
    selectedProductIds.value.push(productId)
  }
}

const handleConfirm = () => {
  emit('select', selectedProductIds.value)
}

// Load products
onMounted(async () => {
  try {
    const response = await ProductService.getProducts({
      limit: 100 // Load more products for selection
    })

    console.log('ProductService response:', response)

    if (response.success && response.data) {
      // The API returns SearchResponse<ProductWithCategory> with data.data being the products array
      products.value = response.data.data || response.data.items || []
    } else {
      throw new Error(response.error || 'Failed to load products')
    }
  } catch (error: any) {
    console.error('Error loading products:', error)
  } finally {
    isLoading.value = false
  }
})

// Close on escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      emit('close')
    }
  }
  document.addEventListener('keydown', handleEscape)

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>