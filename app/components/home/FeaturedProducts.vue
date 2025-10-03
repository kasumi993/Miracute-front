<template>
  <section class="py-5 sm:py-5 bg-white">
    <div class="container-custom">
      <!-- Compact Header -->
      <div class="flex items-center justify-between mb-8 sm:mb-10 px-4 sm:px-0">
        <div>
          <h2 class="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-1 sm:mb-2">
            Popular Templates
          </h2>
          <p class="text-sm sm:text-base text-gray-600">Complete bundles that work together</p>
        </div>
        <NuxtLink to="/templates" 
                  class="hidden sm:flex items-center text-brand-brown hover:text-brand-brown/80 font-medium group text-sm md:text-base">
          View All
          <Icon name="heroicons:arrow-right" class="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </NuxtLink>
      </div>

      <!-- Loading State -->
      <CardSkeleton
        v-if="isLoading"
        :count="4"
        card-width="lg"
        image-height="md"
        :show-title="true"
        :show-description="true"
        :show-tags="true"
        :tag-count="3"
      />

      <!-- Products -->
      <div v-else-if="featuredProducts.length > 0" class="overflow-x-auto pb-4 px-4 sm:px-0 -mx-4 sm:mx-0">
        <div class="flex space-x-4 sm:space-x-6 min-w-max pl-4 sm:pl-0">
          <div v-for="product in featuredProducts" :key="product.id" class="group flex-none w-72 sm:w-80">
            <NuxtLink :to="`/templates/${product.slug}`" class="block">
              <div class="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-brand-brown/20 hover:shadow-lg transition-all duration-300">
                <!-- Template Preview - Compact -->
                <div class="relative overflow-hidden bg-gray-100 h-44 sm:h-48">
                  <img 
                    :src="product.preview_images?.[0] || product.previewImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=500&fit=crop&crop=center'" 
                    :alt="product.name"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <!-- Quick view overlay -->
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div class="bg-white text-gray-900 px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm">
                      Quick View
                    </div>
                  </div>
                  <!-- Category + Price badge -->
                  <div class="absolute top-2 sm:top-3 left-2 sm:left-3 flex space-x-1 sm:space-x-2">
                    <span class="bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                      {{ product.category?.name || product.category }}
                    </span>
                    <span class="bg-brand-brown text-white px-2 py-1 rounded-full text-xs font-bold">
                      ${{ parseFloat(product.price).toFixed(0) }}
                    </span>
                  </div>
                </div>
                
                <!-- Compact Product Info -->
                <div class="p-4 sm:p-5">
                  <div class="flex items-start justify-between mb-2 sm:mb-3">
                    <h3 class="font-heading font-bold text-base sm:text-lg text-gray-900 group-hover:text-brand-brown transition-colors line-clamp-1 pr-2">
                      {{ product.name }}
                    </h3>
                    <div class="flex items-center space-x-1 ml-2 flex-shrink-0">
                      <Icon name="heroicons:star-20-solid" class="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                      <span class="text-xs sm:text-sm font-medium text-gray-700">4.8</span>
                    </div>
                  </div>
                  <p class="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                    {{ product.short_description || product.description }}
                  </p>
                  <!-- Features Icons -->
                  <div class="flex items-center space-x-2 sm:space-x-4 text-xs text-gray-500">
                    <div class="flex items-center space-x-1">
                      <Icon name="heroicons:device-phone-mobile" class="w-3 h-3" />
                      <span class="hidden sm:inline">Mobile</span>
                    </div>
                    <div class="flex items-center space-x-1">
                      <Icon name="heroicons:envelope" class="w-3 h-3" />
                      <span class="hidden sm:inline">Emails</span>
                    </div>
                    <div class="flex items-center space-x-1">
                      <Icon name="simple-icons:canva" class="w-3 h-3" />
                      <span class="hidden sm:inline">Canva</span>
                    </div>
                    <span class="text-gray-400 hidden sm:inline">+{{ product.download_count || 45 }} downloads</span>
                    <span class="text-gray-400 sm:hidden">{{ product.download_count || 45 }}</span>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <Icon name="heroicons:squares-2x2" class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500 text-lg">No featured products available at the moment.</p>
      </div>

      <!-- Mobile CTA -->
      <div class="text-center mt-6 sm:mt-8 sm:hidden px-4">
        <NuxtLink to="/templates" 
                  class="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors text-sm">
          View All Templates
          <Icon name="heroicons:arrow-right" class="ml-2 w-4 h-4" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ProductService } from '@/services'

const featuredProducts = ref([])
const isLoading = ref(true)

// Load featured products from API
const loadFeaturedProducts = async () => {
  try {
    const response = await ProductService.getFeaturedProducts(6)
    featuredProducts.value = response.data || []
  } catch (error) {
    console.error('Error loading featured products:', error)
    // Fallback to empty array
    featuredProducts.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadFeaturedProducts()
})
</script>