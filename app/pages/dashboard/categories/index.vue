<template>
  <!-- Admin Loading State -->
  <AdminLoader v-if="isCheckingAccess" />
  
  <!-- Admin Content -->
  <div v-else-if="hasAdminAccess">
    <!-- Header -->
    <div class="mb-8">
      <div>
        <h1 class="text-3xl font-heading font-medium text-gray-900">Categories</h1>
        <p class="text-gray-600 mt-2">Organize your templates into categories</p>
      </div>
    </div>

      <!-- Categories List -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <!-- Loading State -->
        <div v-if="isLoading" class="p-8 text-center text-gray-500">
          <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading categories...</p>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="categories.length === 0" class="p-8 text-center text-gray-500">
          <Icon name="heroicons:folder" class="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p class="text-lg font-medium mb-2">No categories found</p>
          <NuxtLink to="/dashboard/categories/create" class="text-brand-brown hover:text-brand-brown/80 font-medium">
            Create your first category →
          </NuxtLink>
        </div>

        <!-- Categories Responsive View -->
        <div v-else>
          <!-- Mobile List View -->
          <div class="lg:hidden space-y-3">
            <div 
              v-for="category in categories" 
              :key="category.id" 
              class="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
              @click="editCategory(category)"
            >
              <div class="p-4">
                <div class="flex items-start justify-between mb-3">
                  <div class="flex-1 min-w-0 pr-3">
                    <h3 class="text-base font-medium text-gray-900 truncate">
                      {{ category.name }}
                    </h3>
                    <p class="text-sm text-gray-500 mt-1">
                      /{{ category.slug }}
                    </p>
                  </div>
                  
                  <span :class="[
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0',
                    category.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  ]">
                    {{ category.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <span class="text-gray-500">Products:</span>
                    <span class="ml-1 font-medium text-gray-900">{{ category.product_count || 0 }}</span>
                  </div>
                  <div class="text-right">
                    <span class="text-gray-500">Order:</span>
                    <span class="ml-1 font-medium text-gray-900">{{ category.sort_order || 0 }}</span>
                  </div>
                </div>

                <div v-if="category.description" class="mb-3">
                  <p class="text-sm text-gray-600 line-clamp-2">{{ category.description }}</p>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span class="text-xs text-gray-500">
                    {{ formatDate(category.created_at) }}
                  </span>
                  
                  <div class="flex items-center space-x-2" @click.stop>
                    <button
                      @click="editCategory(category)"
                      class="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <Icon name="heroicons:pencil" class="w-4 h-4" />
                    </button>
                    <button
                      @click="toggleCategoryStatus(category)"
                      class="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <Icon :name="category.is_active ? 'heroicons:eye-slash' : 'heroicons:eye'" class="w-4 h-4" />
                    </button>
                    <button
                      @click="deleteCategory(category)"
                      class="text-red-400 hover:text-red-600 p-1"
                    >
                      <Icon name="heroicons:trash" class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop Table View -->
          <div class="hidden lg:block overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sort Order
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              <tr v-for="category in categories" :key="category.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ category.name }}
                    </div>
                    <div class="text-sm text-gray-500 truncate max-w-xs">
                      {{ category.description }}
                    </div>
                  </div>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap">
                  <code class="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {{ category.slug }}
                  </code>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ category.product_count || 0 }}
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ category.sort_order }}
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                    :class="{
                      'bg-green-100 text-green-800': category.is_active,
                      'bg-gray-100 text-gray-800': !category.is_active
                    }"
                  >
                    {{ category.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(category.created_at) }}
                </td>
                
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      @click="toggleCategoryStatus(category)"
                      class="text-gray-600 hover:text-gray-900 p-1"
                      :title="category.is_active ? 'Deactivate' : 'Activate'"
                    >
                      <Icon :name="category.is_active ? 'heroicons:eye-slash' : 'heroicons:eye'" class="w-4 h-4" />
                    </button>
                    
                    <button
                      @click="deleteCategory(category)"
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
        </div>
      </div>

    <!-- Floating Action Button -->
    <NuxtLink 
      to="/dashboard/categories/create" 
      class="fixed bottom-6 left-6 z-50 w-14 h-14 bg-brand-brown hover:bg-brand-brown/90 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      title="Add Category"
    >
      <Icon name="heroicons:plus" class="w-6 h-6" />
    </NuxtLink>
  </div>
</template>

<script setup>
import { AdminService } from '@/services'

// Admin Guard
const { isCheckingAccess, hasAdminAccess } = useAdminGuard()

// Middleware
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

// SEO
useSeoMeta({
  title: 'Categories | Dashboard',
  robots: 'noindex, nofollow'
})

// State
const isLoading = ref(false)
const categories = ref([])

// Methods
const loadCategories = async () => {
  isLoading.value = true
  
  try {
    const response = await AdminService.getCategories()
    categories.value = response.data || []
  } catch (error) {
    console.error('Error loading categories:', error)
    useToast().error('Failed to load categories')
  } finally {
    isLoading.value = false
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const toggleCategoryStatus = async (category) => {
  try {
    const response = await AdminService.updateCategory(category.id, { is_active: !category.is_active })
    
    category.is_active = !category.is_active
    useToast().success(`Category ${category.is_active ? 'activated' : 'deactivated'}`)
  } catch (error) {
    console.error('Error updating category status:', error)
    useToast().error('Failed to update category status')
  }
}

const editCategory = (category) => {
  navigateTo(`/dashboard/categories/edit/${category.id}`)
}

const deleteCategory = async (category) => {
  if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
    return
  }
  
  try {
    await AdminService.deleteCategory(category.id)
    
    useToast().success('Category deleted successfully')
    await loadCategories()
  } catch (error) {
    console.error('Error deleting category:', error)
    useToast().error('Failed to delete category')
  }
}

// Initialize
onMounted(() => {
  loadCategories()
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
