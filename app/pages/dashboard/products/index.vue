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

    <!-- Search and Filters -->
    <AdminSearchFilterBar
      v-model:search-query="searchQuery"
      v-model:selected-category="selectedCategory"
      v-model:selected-status="selectedStatus"
      v-model:selected-template-type="selectedTemplateType"
      :categories="categories"
      :template-types="templateTypes"
      :filtered-count="filteredProductsCount"
      :total-count="totalProductsCount"
      @search="onSearch"
      @filter-change="onFilterChange"
      @clear-search="clearSearch"
      @clear-filters="clearFilters"
    />

    <!-- Products List -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <!-- Empty States -->
      <AdminProductEmptyState 
        v-if="products.length === 0 && !isLoading"
        :type="searchQuery || hasActiveFilters ? 'no-results' : 'empty'"
        @create-samples="createSampleProducts"
        @clear-all="() => { clearFilters(); clearSearch(); }"
      />

      <!-- Products Table (Desktop) -->
      <AdminProductTable
        v-else
        :products="products"
        :categories="categories"
        :is-loading="isLoading"
        @edit="editProduct"
        @toggle-status="toggleProductStatus"
        @delete="deleteProduct"
      />

      <!-- Products Cards (Mobile) -->
      <AdminProductCardList
        v-if="products.length > 0"
        :products="products"
        :categories="categories"
        :is-loading="isLoading"
        @edit="editProduct"
        @toggle-status="toggleProductStatus"
        @delete="deleteProduct"
      />
    </div>

    <!-- Infinite Scroll Loader -->
    <AdminInfiniteScrollLoader
      :has-next-page="pagination.hasNextPage"
      :is-initial-loading="isLoading"
      :is-loading-more="isLoadingMore"
      @load-more="loadMoreProducts"
    />
  </div>
</template>

<script setup lang="ts">
// Middleware and SEO
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

useSeoMeta({
  title: 'Products | Dashboard',
  description: 'Manage your digital templates and products',
  robots: 'noindex, nofollow'
})

// Composables
const supabase = useSupabaseClient()

// State
const isLoading = ref(false)
const isLoadingMore = ref(false)
const products = ref([])
const categories = ref([])
const templateTypes = ref([])
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false
})

// Search and Filter State
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedStatus = ref('')
const selectedTemplateType = ref('')

// Computed properties
const hasActiveFilters = computed(() => {
  return selectedCategory.value || selectedStatus.value || selectedTemplateType.value
})

const filteredProductsCount = computed(() => pagination.value.total)
const totalProductsCount = computed(() => pagination.value.total)

// Methods
const loadProducts = async (reset = true) => {
  if (reset) {
    isLoading.value = true
    pagination.value.page = 1
  } else {
    isLoadingMore.value = true
  }
  
  try {
    const params = new URLSearchParams()
    if (searchQuery.value) params.append('search', searchQuery.value)
    if (selectedCategory.value) params.append('category', selectedCategory.value)
    if (selectedStatus.value) params.append('status', selectedStatus.value)
    if (selectedTemplateType.value) params.append('template_type', selectedTemplateType.value)
    params.append('page', pagination.value.page.toString())
    params.append('limit', pagination.value.limit.toString())
    
    const response = await $fetch(`/api/admin/products?${params.toString()}`)
    
    if (reset) {
      products.value = response.data || []
    } else {
      products.value.push(...(response.data || []))
    }
    
    pagination.value = response.pagination || pagination.value
    
  } catch (error) {
    console.error('Error loading products:', error)
    useToast().error('Failed to load products')
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

const loadMoreProducts = async () => {
  if (!pagination.value.hasNextPage || isLoadingMore.value) return
  
  pagination.value.page += 1
  await loadProducts(false)
}

const loadCategories = async () => {
  try {
    const response = await $fetch('/api/admin/categories')
    categories.value = response.data.filter(cat => cat.is_active) || []
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

const loadTemplateTypes = async () => {
  try {
    const response = await $fetch('/api/admin/template-types')
    templateTypes.value = response.data || []
  } catch (error) {
    console.error('Error loading template types:', error)
  }
}

const toggleProductStatus = async (product: any) => {
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

const deleteProduct = async (product: any) => {
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

const editProduct = (product: any) => {
  navigateTo(`/dashboard/products/create?edit=${product.id}`)
}

const createSampleProducts = async () => {
  try {
    const response = await $fetch('/api/admin/products/sample', {
      method: 'POST'
    })
    useToast().success('Sample products created successfully!')
    await loadProducts()
  } catch (error) {
    console.error('Error creating sample products:', error)
    useToast().error('Failed to create sample products')
  }
}

// Search and Filter Methods
const onSearch = useDebounceFn(() => {
  loadProducts(true)
}, 300)

const onFilterChange = () => {
  loadProducts(true)
}

const clearSearch = () => {
  searchQuery.value = ''
  loadProducts(true)
}

const clearFilters = () => {
  selectedCategory.value = ''
  selectedStatus.value = ''
  selectedTemplateType.value = ''
  loadProducts(true)
}

// Initialize
onMounted(async () => {
  await Promise.all([
    loadCategories(),
    loadTemplateTypes(),
    loadProducts()
  ])
})
</script>