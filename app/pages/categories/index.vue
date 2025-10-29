<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Hero Section -->
    <section class="bg-white border-b border-gray-200">
      <div class="container-custom py-16">
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-heading font-medium text-gray-900 mb-6">
            Template
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-green-400">
              Categories
            </span>
          </h1>
          <p class="text-xl text-gray-600 mb-8">
            Find the perfect template for your project. Browse by category to discover designs tailored to your needs.
          </p>
        </div>
      </div>
    </section>

    <!-- Categories Grid -->
    <section class="container-custom py-12">
      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <div v-for="i in 8" :key="i" class="animate-pulse">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="aspect-[4/3] bg-gray-200"></div>
            <div class="p-6 space-y-3">
              <div class="h-4 bg-gray-200 rounded"></div>
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories -->
      <div v-else-if="categories && categories.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <NuxtLink v-for="category in categories" 
                  :key="category.id"
                  :to="`/categories/${category.slug}`"
                  class="group">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <!-- Category Image -->
            <div class="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-brand-pink to-brand-sage">
              <NuxtImg 
                v-if="category.image_url"
                :src="category.image_url"
                :alt="category.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <Icon name="heroicons:folder" class="w-16 h-16 text-white/80" />
              </div>
              
              <!-- Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <!-- Category Info -->
            <div class="p-6">
              <h3 class="font-heading font-medium text-xl text-gray-900 mb-2 group-hover:text-brand-brown transition-colors">
                {{ category.name }}
              </h3>
              
              <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                {{ category.description }}
              </p>

              <!-- Stats -->
              <div class="flex items-center justify-between text-xs text-gray-500">
                <div class="flex items-center space-x-1">
                  <Icon name="heroicons:squares-2x2" class="w-3 h-3" />
                  <span>{{ category.product_count || 0 }} templates</span>
                </div>
                <div class="flex items-center space-x-1">
                  <Icon name="heroicons:arrow-right" class="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  <span>Explore</span>
                </div>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-16">
        <Icon name="heroicons:folder-open" class="w-16 h-16 text-gray-300 mx-auto mb-6" />
        <h3 class="text-xl font-heading font-medium text-gray-900 mb-2">No categories found</h3>
        <p class="text-gray-600">Categories will appear here once they're added.</p>
      </div>
    </section>

    <!-- Popular Templates Section -->
    <section class="container-custom py-16 border-t border-gray-200">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-heading font-medium text-gray-900 mb-4">
          Popular Templates
        </h2>
        <p class="text-xl text-gray-600">
          Our most-loved templates across all categories
        </p>
      </div>

      <div v-if="featuredProducts && featuredProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ProductCard v-for="product in featuredProducts" 
                    :key="product.id" 
                    :product="product" />
      </div>

      <div class="text-center mt-12">
        <NuxtLink to="/listings" class="btn-primary">
          View All Templates
          <Icon name="heroicons:arrow-right" class="ml-2 w-5 h-5" />
        </NuxtLink>
      </div>
    </section>

    <!-- Newsletter Section -->
    <section class="bg-gradient-to-r from-brand-pink to-brand-sage">
      <div class="container-custom py-16">
        <div class="text-center max-w-2xl mx-auto">
          <h2 class="text-3xl font-heading font-medium text-gray-900 mb-4">
            Stay Updated
          </h2>
          <p class="text-lg text-gray-700 mb-8">
            Get notified when we add new templates and categories to our collection.
          </p>
          
          <form @submit.prevent="subscribeNewsletter" class="flex max-w-md mx-auto">
            <input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              required
              class="flex-1 px-4 py-3 rounded-l-lg border-0 focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
            <button
              type="submit"
              :disabled="isSubscribing"
              class="px-6 py-3 bg-gray-900 text-white font-medium rounded-r-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <span v-if="!isSubscribing">Subscribe</span>
              <Icon v-else name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
            </button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// SEO
useSeoMeta({
  title: 'Template Categories | Miracute - Find the Perfect Design',
  description: 'Browse our collection of website template categories. Find designs for weddings, businesses, portfolios, restaurants, and more. Professional templates made simple.',
  keywords: 'website template categories, business templates, wedding templates, portfolio templates, restaurant templates, professional design',
  ogTitle: 'Template Categories | Miracute',
  ogDescription: 'Browse our collection of website template categories. Find the perfect design for your project.',
  ogImage: '/images/og-categories.jpg'
})

// Composables
const { categories, featuredProducts, isLoading, fetchCategories, fetchFeaturedProducts } = useProducts()
const { fetchCoupons } = useCoupons()

// Newsletter state
const email = ref('')
const isSubscribing = ref(false)

// Methods
const subscribeNewsletter = async () => {
  if (!email.value || isSubscribing.value) return
  
  isSubscribing.value = true
  
  try {
    // Simulate newsletter subscription
    await new Promise(resolve => setTimeout(resolve, 1000))
    useToast().success('Thank you for subscribing!')
    email.value = ''
  } catch (error) {
    useToast().error('Something went wrong. Please try again.')
  } finally {
    isSubscribing.value = false
  }
}

// Load data on mount
onMounted(async () => {
  try {
    await Promise.all([
      fetchCategories(),
      fetchFeaturedProducts(6),
      fetchCoupons()
    ])
  } catch (error) {
    console.error('Failed to load categories data:', error)
  }
})
</script>