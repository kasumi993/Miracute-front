<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-4">
          <NuxtLink
            to="/dashboard/bundles"
            class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Icon name="heroicons:arrow-left" class="w-5 h-5" />
          </NuxtLink>
          <div>
            <h1 class="text-2xl font-heading font-bold text-gray-900">
              {{ isEditing ? 'Edit Bundle' : 'Create Bundle' }}
            </h1>
            <p class="text-gray-600">{{ isEditing ? 'Update your product bundle' : 'Create a new product bundle' }}</p>
          </div>
        </div>
      </div>

      <!-- Form -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <form @submit.prevent="handleSubmit" class="p-6 space-y-8">
          <!-- Basic Information -->
          <div class="space-y-6">
            <h2 class="text-lg font-heading font-semibold text-gray-900 border-b border-gray-100 pb-2">
              Basic Information
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Bundle Name *
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  placeholder="e.g., Complete E-commerce Starter Pack"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown transition-colors"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug
                </label>
                <input
                  v-model="form.slug"
                  type="text"
                  placeholder="complete-ecommerce-starter-pack"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown transition-colors"
                />
                <p class="text-xs text-gray-500 mt-1">Leave empty to auto-generate from name</p>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                v-model="form.description"
                rows="4"
                placeholder="Describe what's included in this bundle and its benefits..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown transition-colors"
              ></textarea>
            </div>
          </div>

          <!-- Products Selection -->
          <div class="space-y-6">
            <h2 class="text-lg font-heading font-semibold text-gray-900 border-b border-gray-100 pb-2">
              Products in Bundle
            </h2>

            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <p class="text-sm text-gray-600">Select products to include in this bundle</p>
                <button
                  type="button"
                  @click="showProductSelector = true"
                  class="px-4 py-2 bg-brand-brown text-white rounded-lg hover:bg-brand-brown/90 transition-colors text-sm font-medium"
                >
                  Add Products
                </button>
              </div>

              <!-- Selected Products -->
              <div v-if="selectedProducts.length > 0" class="space-y-3">
                <div
                  v-for="product in selectedProducts"
                  :key="product.id"
                  class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center space-x-4">
                    <img
                      v-if="product.preview_images?.[0]"
                      :src="product.preview_images[0]"
                      :alt="product.name"
                      class="w-12 h-12 object-cover rounded-lg"
                    />
                    <div class="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center" v-else>
                      <Icon name="heroicons:photo" class="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h3 class="font-medium text-gray-900">{{ product.name }}</h3>
                      <p class="text-sm text-gray-600">${{ product.price }}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    @click="removeProduct(product.id)"
                    class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Icon name="heroicons:trash" class="w-4 h-4" />
                  </button>
                </div>

                <!-- Bundle Pricing Summary -->
                <div class="bg-brand-brown/5 border border-brand-brown/20 rounded-lg p-4">
                  <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Individual prices total:</span>
                      <span class="font-medium">${{ originalPrice.toFixed(2) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="text-gray-600">Bundle price:</span>
                      <span class="font-medium">${{ form.bundle_price }}</span>
                    </div>
                    <div class="flex justify-between text-sm font-semibold text-brand-brown border-t border-brand-brown/20 pt-2">
                      <span>Customer saves:</span>
                      <span>${{ savings.toFixed(2) }} ({{ savingsPercentage }}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-8 text-gray-500">
                <Icon name="heroicons:squares-plus" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No products selected yet</p>
                <p class="text-sm">Add products to create your bundle</p>
              </div>
            </div>
          </div>

          <!-- Pricing -->
          <div class="space-y-6" v-if="selectedProducts.length > 0">
            <h2 class="text-lg font-heading font-semibold text-gray-900 border-b border-gray-100 pb-2">
              Pricing
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Bundle Price *
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    v-model.number="form.bundle_price"
                    type="number"
                    step="0.01"
                    min="0"
                    :max="originalPrice"
                    required
                    class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown transition-colors"
                  />
                </div>
                <p class="text-xs text-gray-500 mt-1">Must be less than ${{ originalPrice.toFixed(2) }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Quick Discount
                </label>
                <div class="flex space-x-2">
                  <button
                    v-for="discount in [10, 15, 20, 25]"
                    :key="discount"
                    type="button"
                    @click="applyDiscount(discount)"
                    class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {{ discount }}% off
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Settings -->
          <div class="space-y-6">
            <h2 class="text-lg font-heading font-semibold text-gray-900 border-b border-gray-100 pb-2">
              Settings
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <label class="flex items-center space-x-3">
                  <input
                    v-model="form.is_active"
                    type="checkbox"
                    class="w-4 h-4 text-brand-brown border-gray-300 rounded focus:ring-brand-brown"
                  />
                  <span class="text-sm font-medium text-gray-700">Active</span>
                </label>

                <label class="flex items-center space-x-3">
                  <input
                    v-model="form.featured"
                    type="checkbox"
                    class="w-4 h-4 text-brand-brown border-gray-300 rounded focus:ring-brand-brown"
                  />
                  <span class="text-sm font-medium text-gray-700">Featured bundle</span>
                </label>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  v-model.number="form.display_order"
                  type="number"
                  min="0"
                  placeholder="0"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown transition-colors"
                />
                <p class="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>
            </div>
          </div>

          <!-- SEO -->
          <div class="space-y-6">
            <h2 class="text-lg font-heading font-semibold text-gray-900 border-b border-gray-100 pb-2">
              SEO & Marketing
            </h2>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  v-model="form.meta_title"
                  type="text"
                  maxlength="160"
                  placeholder="SEO-optimized title for search engines"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown transition-colors"
                />
                <p class="text-xs text-gray-500 mt-1">{{ form.meta_title?.length || 0 }}/160 characters</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  v-model="form.meta_description"
                  rows="3"
                  maxlength="300"
                  placeholder="Brief description for search engine results"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-brand-brown transition-colors"
                ></textarea>
                <p class="text-xs text-gray-500 mt-1">{{ form.meta_description?.length || 0 }}/300 characters</p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-between pt-6 border-t border-gray-200">
            <NuxtLink
              to="/dashboard/bundles"
              class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </NuxtLink>

            <div class="flex items-center space-x-4">
              <button
                v-if="isEditing"
                type="button"
                @click="handleDelete"
                :disabled="isLoading"
                class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Delete Bundle
              </button>

              <button
                type="submit"
                :disabled="isLoading || selectedProducts.length === 0"
                class="px-6 py-3 bg-brand-brown text-white rounded-lg hover:bg-brand-brown/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {{ isLoading ? 'Saving...' : (isEditing ? 'Update Bundle' : 'Create Bundle') }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Product Selector Modal -->
    <ProductSelectorModal
      v-if="showProductSelector"
      :selected-ids="form.products"
      @close="showProductSelector = false"
      @select="handleProductSelection"
    />
  </div>
</template>

<script setup lang="ts">
import { BundleService } from '@/services/BundleService'
import type { ProductBundle } from '@/types/bundle'
import * as ProductService from '@/services/ProductService'
import type { ProductWithCategory } from '@/services/ProductService'

definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const toast = useToast()

const bundleId = computed(() => route.query.id as string)
const isEditing = computed(() => !!bundleId.value)

// State
const isLoading = ref(false)
const showProductSelector = ref(false)
const products = ref<ProductWithCategory[]>([])

// Form data
const form = reactive({
  name: '',
  slug: '',
  description: '',
  bundle_price: 0,
  products: [] as string[],
  is_active: true,
  featured: false,
  display_order: 0,
  meta_title: '',
  meta_description: ''
})

// Computed
const selectedProducts = computed(() =>
  products.value?.filter(p => form.products.includes(p.id)) || []
)

const originalPrice = computed(() =>
  selectedProducts.value.reduce((sum, product) => sum + product.price, 0)
)

const savings = computed(() =>
  Math.max(0, originalPrice.value - form.bundle_price)
)

const savingsPercentage = computed(() =>
  originalPrice.value > 0 ? Math.round((savings.value / originalPrice.value) * 100) : 0
)

// Methods
const applyDiscount = (percentage: number) => {
  form.bundle_price = Number((originalPrice.value * (1 - percentage / 100)).toFixed(2))
}

const removeProduct = (productId: string) => {
  const index = form.products.indexOf(productId)
  if (index > -1) {
    form.products.splice(index, 1)
  }
}

const handleProductSelection = (productIds: string[]) => {
  form.products = productIds
  showProductSelector.value = false

  // Auto-set initial bundle price if not set
  if (form.bundle_price === 0 && originalPrice.value > 0) {
    applyDiscount(15) // Default 15% discount
  }
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const handleSubmit = async () => {
  if (selectedProducts.value.length === 0) {
    toast.error('Please select at least one product for the bundle')
    return
  }

  if (form.bundle_price >= originalPrice.value) {
    toast.error('Bundle price must be less than individual prices total')
    return
  }

  isLoading.value = true

  try {
    const bundleData = {
      ...form,
      original_price: originalPrice.value,
      slug: form.slug || generateSlug(form.name)
    }

    if (isEditing.value) {
      const response = await BundleService.update(bundleId.value, bundleData)
      if (response.success) {
        toast.success('Bundle updated successfully!')
        router.push('/dashboard/bundles')
      } else {
        throw new Error(response.error || 'Failed to update bundle')
      }
    } else {
      const response = await BundleService.create(bundleData)
      if (response.success) {
        toast.success('Bundle created successfully!')
        router.push('/dashboard/bundles')
      } else {
        throw new Error(response.error || 'Failed to create bundle')
      }
    }
  } catch (error: any) {
    console.error('Bundle save error:', error)
    toast.error(error.message || 'Failed to save bundle')
  } finally {
    isLoading.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this bundle? This action cannot be undone.')) {
    return
  }

  isLoading.value = true

  try {
    const response = await BundleService.delete(bundleId.value)
    if (response.success) {
      toast.success('Bundle deleted successfully!')
      router.push('/dashboard/bundles')
    } else {
      throw new Error(response.error || 'Failed to delete bundle')
    }
  } catch (error: any) {
    console.error('Bundle delete error:', error)
    toast.error(error.message || 'Failed to delete bundle')
  } finally {
    isLoading.value = false
  }
}

// Load data
onMounted(async () => {
  try {
    // Load all products
    const productsResponse = await ProductService.getProducts()
    console.log('Products response in bundle create:', productsResponse)
    if (productsResponse.success && productsResponse.data) {
      products.value = productsResponse.data.data || productsResponse.data.items || []
    }

    // Load bundle data if editing
    if (isEditing.value) {
      const response = await BundleService.getById(bundleId.value)
      if (response.success && response.data) {
        const bundle = response.data
        Object.assign(form, {
          name: bundle.name,
          slug: bundle.slug || '',
          description: bundle.description || '',
          bundle_price: bundle.bundle_price,
          products: bundle.products,
          is_active: bundle.is_active,
          featured: bundle.featured,
          display_order: bundle.display_order,
          meta_title: bundle.meta_title || '',
          meta_description: bundle.meta_description || ''
        })
      }
    }
  } catch (error: any) {
    console.error('Error loading data:', error)
    toast.error('Failed to load data')
  }
})

// Auto-generate slug from name
watch(() => form.name, (newName) => {
  if (!form.slug && newName) {
    form.slug = generateSlug(newName)
  }
})
</script>