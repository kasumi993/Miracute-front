<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Loading State -->
    <div v-if="isLoading && !category" class="container-custom py-16">
      <div class="animate-pulse">
        <div class="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 9" :key="i" class="card-product">
            <div class="aspect-[4/3] bg-gray-200 rounded-t-2xl"></div>
            <div class="p-6 space-y-3">
              <div class="h-4 bg-gray-200 rounded"></div>
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Not Found -->
    <div v-else-if="!category" class="container-custom py-16 text-center">
      <Icon name="heroicons:folder-open" class="w-16 h-16 text-gray-300 mx-auto mb-6" />
      <h1 class="text-2xl font-heading font-medium text-gray-900 mb-2">Category Not Found</h1>
      <p class="text-gray-600 mb-6">The category you're looking for doesn't exist or has been removed.</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink to="/categories" class="btn-primary">
          View All Categories
        </NuxtLink>
        <NuxtLink to="/listings" class="btn-secondary">
          Browse Templates
        </NuxtLink>
      </div>
    </div>

    <!-- Category Content -->
    <div v-else>
      <!-- Hero Section -->
      <section class="relative bg-white border-b border-gray-200 overflow-hidden">
        <!-- Background Image -->
        <div v-if="category.image_url" class="absolute inset-0 opacity-10">
          <NuxtImg 
            :src="category.image_url"
            :alt="category.name"
            class="w-full h-full object-cover"
          />
        </div>
        
        <div class="container-custom py-16 relative z-10">
          <!-- Breadcrumb -->
          <nav class="mb-8">
            <div class="flex items-center space-x-2 text-sm text-gray-600">
              <NuxtLink to="/" class="hover:text-gray-900">Home</NuxtLink>
              <Icon name="heroicons:chevron-right" class="w-4 h-4" />
              <NuxtLink to="/categories" class="hover:text-gray-900">Categories</NuxtLink>
              <Icon name="heroicons:chevron-right" class="w-4 h-4" />
              <span class="text-gray-900 font-medium">{{ category.name }}</span>
            </div>
          </nav>

          <div class="max-w-3xl">
            <h1 class="text-4xl sm:text-5xl lg:text-6xl font-heading font-medium text-gray-900 mb-6">
              {{ category.name }}
            </h1>
            
            <p class="text-xl text-gray-600 mb-8 leading-relaxed">
              {{ category.description }}
            </p>
            
            <div class="flex items-center space-x-6 text-sm text-gray-500">
              <div class="flex items-center space-x-2">
                <Icon name="heroicons:squares-2x2" class="w-4 h-4" />
                <span>{{ totalProducts }} templates</span>
              </div>
              <div class="flex items-center space-x-2">
                <Icon name="heroicons:star" class="w-4 h-4" />
                <span>Professional Quality</span>
              </div>
              <div class="flex items-center space-x-2">
                <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
                <span>Instant Download</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Products Section -->
      <section class="container-custom py-12">
        <!-- Filters & Sort -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
          <div class="flex items-center space-x-4">
            <span class="text-gray-600">
              {{ totalProducts }} template{{ totalProducts !== 1 ? 's' : '' }}
            </span>
          </div>
          
          <div class="flex items-center space-x-4">
            <!-- Sort Dropdown -->
            <select v-model="sortBy" 
                    class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-sage focus:border-transparent">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        <!-- Products Grid -->
        <div v-if="isLoading && products.length === 0" 
             class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 9" :key="i" class="card-product animate-pulse">
            <div class="aspect-[4/3] bg-gray-200"></div>
            <div class="p-6 space-y-3">
              <div class="h-4 bg-gray-200 rounded"></div>
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>

        <div v-else-if="products.length === 0" class="text-center py-16">
          <Icon name="heroicons:squares-2x2" class="w-16 h-16 text-gray-300 mx-auto mb-6" />
          <h3 class="text-xl font-heading font-medium text-gray-900 mb-2">No templates found</h3>
          <p class="text-gray-600 mb-6">We're working on adding more templates to this category.</p>
          <NuxtLink to="/listings" class="btn-primary">
            Browse All Templates
          </NuxtLink>
        </div>

        <div v-else>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProductCard v-for="product in products" 
                        :key="product.id" 
                        :product="product" />
          </div>

          <!-- Load More -->
          <div v-if="hasMore" class="text-center mt-12">
            <button @click="loadMore" 
                    :disabled="isLoadingMore"
                    class="btn-primary">
              <span v-if="!isLoadingMore">Load More Templates</span>
              <span v-else class="flex items-center space-x-2">
                <Icon name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
                <span>Loading...</span>
              </span>
            </button>
          </div>
        </div>
      </section>

      <!-- Related Categories -->
      <section v-if="relatedCategories.length > 0" class="container-custom py-12 border-t border-gray-200">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-heading font-medium text-gray-900 mb-4">Explore More Categories</h2>
          <p class="text-gray-600">Discover templates in other categories</p>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <NuxtLink v-for="relatedCategory in relatedCategories" 
                    :key="relatedCategory.id"
                    :to="`/categories/${relatedCategory.slug}`"
                    class="group">
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div class="w-12 h-12 bg-brand-pink rounded-lg flex items-center justify-center mb-4">
                <Icon name="heroicons:folder" class="w-6 h-6 text-gray-700" />
              </div>
              <h3 class="font-heading font-medium text-lg text-gray-900 mb-2 group-hover:text-brand-brown transition-colors">
                {{ relatedCategory.name }}
              </h3>
              <p class="text-gray-600 text-sm">
                {{ relatedCategory.description?.substring(0, 100) }}...
              </p>
            </div>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
// Get route params
const route = useRoute()
const slug = route.params.slug

// Composables
const { fetchProducts, fetchCategories, resetPagination } = useProducts()
const { fetchCoupons } = useCoupons()

// State
const category = ref(null)
const products = ref([])
const relatedCategories = ref([])
const totalProducts = ref(0)
const hasMore = ref(false)
const currentPage = ref(1)
const isLoading = ref(true)
const isLoadingMore = ref(false)
const sortBy = ref('newest')

const PRODUCTS_PER_PAGE = 12

// Methods
const loadCategoryData = async () => {
  try {
    isLoading.value = true

    // Fetch category data
    const { data: categoryData } = await $fetch(`/api/categories/${slug}`)

    if (!categoryData) {
      category.value = null
      return
    }

    category.value = categoryData

    // Load coupons for promotional pricing
    await fetchCoupons()

    // Load products for this category
    await loadProducts()

    // Load related categories
    await loadRelatedCategories()
    
    // Set SEO meta tags
    useSeoMeta({
      title: `${categoryData.seo_title || categoryData.name + ' Templates'} | Miracute`,
      description: categoryData.seo_description || categoryData.description,
      keywords: `${categoryData.name.toLowerCase()} templates, ${categoryData.name.toLowerCase()} website, professional design`,
      ogTitle: categoryData.name + ' Templates | Miracute',
      ogDescription: categoryData.description,
      ogImage: categoryData.image_url
    })
    
  } catch (error) {
    console.error('Failed to load category:', error)
    category.value = null
  } finally {
    isLoading.value = false
  }
}

const loadProducts = async (append = false) => {
  if (!category.value) return

  try {
    const response = await fetchProducts({
      category: category.value.id,
      sortBy: sortBy.value
    }, append ? currentPage.value + 1 : 1, append)

    if (append) {
      products.value = [...products.value, ...response.products]
      currentPage.value++
    } else {
      products.value = response.products
      currentPage.value = 1
    }

    totalProducts.value = response.total
    hasMore.value = response.hasMore

  } catch (error) {
    console.error('Failed to load products:', error)
  }
}

const loadRelatedCategories = async () => {
  try {
    const allCategories = await fetchCategories()
    relatedCategories.value = allCategories
      .filter(cat => cat.id !== category.value?.id)
      .slice(0, 4)
  } catch (error) {
    console.error('Failed to load related categories:', error)
  }
}

const loadMore = async () => {
  if (isLoadingMore.value || !hasMore.value) return
  
  isLoadingMore.value = true
  try {
    await loadProducts(true)
  } finally {
    isLoadingMore.value = false
  }
}

// Watch for sort changes
watch(sortBy, () => {
  resetPagination()
  loadProducts()
})

// Watch for route changes
watch(() => route.params.slug, () => {
  if (route.params.slug !== slug) {
    loadCategoryData()
  }
})

// Initialize
onMounted(() => {
  loadCategoryData()
})
</script>