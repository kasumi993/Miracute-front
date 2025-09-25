<template>
  <section class="section-padding bg-gradient-to-b from-white to-gray-50">
    <div class="container-custom">
      <div class="text-center mb-16">
        <h2 class="font-heading font-medium text-gray-900 mb-4">
          Featured Templates
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Our most popular templates, loved by thousands of customers worldwide.
        </p>
      </div>
      
      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="i in 6" :key="i" class="card-product animate-pulse">
          <div class="relative aspect-[4/3] bg-gray-200 rounded-t-xl"></div>
          <div class="p-6">
            <div class="h-6 bg-gray-200 rounded mb-2"></div>
            <div class="h-4 bg-gray-200 rounded mb-4"></div>
            <div class="flex items-center justify-between">
              <div class="h-6 bg-gray-200 rounded w-20"></div>
              <div class="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-else-if="products.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="product in products" :key="product.slug" 
             class="card-product group">
          <NuxtLink :to="`/templates/${product.slug}`">
            <div class="relative aspect-[4/3] overflow-hidden">
              <img 
                :src="product.preview_images?.[0] || 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=450&fit=crop'" 
                :alt="product.name"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div class="absolute top-4 right-4">
                <span class="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  {{ product.category?.name || product.category }}
                </span>
              </div>
            </div>
            <div class="p-6">
              <h3 class="font-heading font-medium text-xl text-gray-900 mb-2">{{ product.name }}</h3>
              <p class="text-gray-600 mb-4 line-clamp-2">{{ product.short_description || product.description }}</p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="text-2xl font-bold text-gray-900">${{ parseFloat(product.price).toFixed(2) }}</span>
                  <span v-if="product.compare_at_price" class="text-lg text-gray-500 line-through">
                    ${{ parseFloat(product.compare_at_price).toFixed(2) }}
                  </span>
                </div>
                <div class="flex items-center space-x-1">
                  <Icon name="heroicons:star-solid" class="w-4 h-4 text-yellow-400" />
                  <span class="text-sm text-gray-600">4.8</span>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <Icon name="heroicons:squares-2x2" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500 text-lg">No featured products available at the moment.</p>
      </div>
      
      <div v-if="!isLoading && products.length > 0" class="text-center mt-12">
        <NuxtLink to="/templates" class="btn-primary">
          View All Templates
          <Icon name="heroicons:arrow-right" class="ml-2 w-5 h-5" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ProductService } from '@/services'

const products = ref([])
const isLoading = ref(true)

// Load featured products from API
const loadFeaturedProducts = async () => {
  try {
    const response = await ProductService.getFeaturedProducts(6)
    products.value = response.data || []
  } catch (error) {
    console.error('Error loading featured products:', error)
    // Fallback to empty array - could add error state here
    products.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadFeaturedProducts()
})
</script>