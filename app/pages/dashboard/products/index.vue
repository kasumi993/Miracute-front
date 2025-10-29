<template>
  <!-- Admin Loading State -->
  <AdminLoader v-if="isCheckingAccess" />
  
  <!-- Admin Content -->
  <div v-else-if="hasAdminAccess">
    <!-- Header -->
    <div class="mb-4 sm:mb-6 lg:mb-8">
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-heading font-medium text-gray-900">Products</h1>
        <p class="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage your digital templates and downloads</p>
      </div>
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

    <!-- Empty States -->
    <AdminProductEmptyState 
      v-if="products.length === 0 && !isLoading"
      :type="searchQuery || hasActiveFilters ? 'no-results' : 'empty'"
      @create-samples="createSampleProducts"
      @clear-all="() => { clearFilters(); clearSearch(); }"
    />

    <!-- Products View (Grid on desktop, List on mobile) -->
    <AdminProductView
      v-else
      :products="products"
      :categories="categories"
      :is-loading="isLoading"
      @edit="editProduct"
      @toggle-status="toggleProductStatus"
      @delete="deleteProduct"
    />

    <!-- Infinite Scroll Loader -->
    <AdminInfiniteScrollLoader
      :has-next-page="pagination.hasNextPage ?? false"
      :is-initial-loading="isLoading"
      :is-loading-more="isLoadingMore"
      @load-more="loadMoreProducts"
    />

    <!-- Delete Confirmation Modal -->
    <UIConfirmationModal
      :is-open="showDeleteModal"
      :title="deleteModalTitle"
      :message="deleteModalMessage"
      confirm-text="Delete Product"
      cancel-text="Cancel"
      loading-text="Deleting..."
      :is-loading="isDeleting"
      variant="danger"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
      @close="cancelDelete"
    />

    <!-- Floating Action Button -->
    <NuxtLink 
      to="/dashboard/products/create" 
      class="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-brown hover:bg-brand-brown/90 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      title="Add Template"
    >
      <Icon name="heroicons:plus" class="w-6 h-6" />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
// Import services
import { CategoryService } from '@/services/CategoryService'
import { TemplateTypeService } from '@/services/TemplateTypeService'
import { ProductService } from '@/services/ProductService'

// Admin Guard
const { isCheckingAccess, hasAdminAccess } = useAdminGuard()

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

// Composables are imported via auto-imports

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

// Delete Modal State
const showDeleteModal = ref(false)
const productToDelete = ref(null)
const isDeleting = ref(false)

// Computed properties
const hasActiveFilters = computed(() => {
  return selectedCategory.value || selectedStatus.value || selectedTemplateType.value
})

const filteredProductsCount = computed(() => pagination.value.total)
const totalProductsCount = computed(() => pagination.value.total)

const deleteModalTitle = computed(() => {
  return `Delete ${productToDelete.value?.name || 'Product'}?`
})

const deleteModalMessage = computed(() => {
  return `Are you sure you want to delete '${productToDelete.value?.name}'? This action cannot be undone and will permanently remove the product from your store.`
})

// Methods
const loadProducts = async (reset = true) => {
  if (reset) {
    isLoading.value = true
    pagination.value.page = 1
  } else {
    isLoadingMore.value = true
  }

  try {
    const filters = {
      search: searchQuery.value || undefined,
      category: selectedCategory.value || undefined,
      status: selectedStatus.value || undefined,
      template_type: selectedTemplateType.value || undefined
    }

    const paginationParams = {
      page: pagination.value.page,
      limit: pagination.value.limit
    }

    const response = await ProductService.getProducts(filters, paginationParams)

    if (response.success && response.data) {
      if (reset) {
        products.value = response.data.data || []
      } else {
        products.value.push(...(response.data.data || []))
      }

      pagination.value = response.data.pagination || pagination.value
    } else {
      throw new Error(response.error || 'Failed to load products')
    }

  } catch (error: any) {
    console.error('Error loading products:', error)
    useToast().error(error.message || 'Failed to load products')
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
    const response = await CategoryService.getCategories()
    if (response.success && response.data) {
      categories.value = response.data.filter(cat => cat.is_active) || []
    }
  } catch (error) {
    console.error('Error loading categories:', error)
  }
}

const loadTemplateTypes = async () => {
  try {
    const response = await TemplateTypeService.getTemplateTypes()
    if (response.success && response.data) {
      templateTypes.value = response.data || []
    }
  } catch (error) {
    console.error('Error loading template types:', error)
  }
}

const toggleProductStatus = async (product: any) => {
  try {
    const newStatus = !product.is_active

    const response = await ProductService.updateProductStatus(product.id, newStatus)

    if (response.success) {
      product.is_active = newStatus
      useToast().success(`Product ${product.is_active ? 'activated' : 'deactivated'}`)
    } else {
      throw new Error(response.error || 'Failed to update product status')
    }
  } catch (error: any) {
    console.error('Error updating product status:', error)
    useToast().error(error.message || 'Failed to update product status')
  }
}

const deleteProduct = (product: any) => {
  productToDelete.value = product
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!productToDelete.value) return

  isDeleting.value = true

  try {
    const response = await ProductService.deleteProduct(productToDelete.value.id)

    if (response.success) {
      useToast().success('Product deleted successfully')
      await loadProducts()
      cancelDelete()
    } else {
      throw new Error(response.error || 'Failed to delete product')
    }
  } catch (error: any) {
    console.error('Error deleting product:', error)
    useToast().error(error.message || 'Failed to delete product')
  } finally {
    isDeleting.value = false
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  productToDelete.value = null
  isDeleting.value = false
}

const editProduct = (product: any) => {
  navigateTo(`/dashboard/products/create?edit=${product.id}`)
}

const createSampleProducts = async () => {
  try {
    const response = await ProductService.createSampleProducts()

    if (response.success) {
      useToast().success('Sample products created successfully!')
      await loadProducts()
    } else {
      throw new Error(response.error || 'Failed to create sample products')
    }
  } catch (error: any) {
    console.error('Error creating sample products:', error)
    useToast().error(error.message || 'Failed to create sample products')
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