<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
      <div class="min-w-0 flex-1">
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-heading font-medium text-gray-900">Add Category</h1>
        <p class="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Create a new template category</p>
      </div>
      <div class="flex-shrink-0">
        <NuxtLink to="/dashboard/categories" class="btn-secondary w-full sm:w-auto justify-center items-center h-12 sm:h-10 text-base sm:text-sm px-6 sm:px-4 rounded-xl sm:rounded-lg inline-flex">
          <Icon name="heroicons:arrow-left" class="w-5 h-5 sm:w-4 sm:h-4 mr-2 sm:mr-1.5" />
          <span>Back to Categories</span>
        </NuxtLink>
      </div>
    </div>

      <!-- Form -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
        <form @submit.prevent="createCategory" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-base sm:text-sm h-12 sm:h-auto"
                placeholder="e.g., Wedding Templates"
                @input="generateSlug"
              >
            </div>

            <!-- Slug -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                URL Slug *
              </label>
              <input
                v-model="form.slug"
                type="text"
                required
                class="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-base sm:text-sm h-12 sm:h-auto"
                placeholder="e.g., wedding-templates"
              >
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              v-model="form.description"
              rows="4"
              class="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-base sm:text-sm min-h-[120px] sm:min-h-[80px]"
              placeholder="Brief description of this category..."
            ></textarea>
          </div>

          <!-- Sort Order -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <input
                v-model.number="form.sort_order"
                type="number"
                min="0"
                class="w-full px-4 py-3 sm:px-3 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-base sm:text-sm h-12 sm:h-auto"
                placeholder="0"
              >
            </div>

            <div class="flex items-center p-4 sm:p-2 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
              <input
                v-model="form.is_active"
                type="checkbox"
                id="is_active"
                class="h-5 w-5 sm:h-4 sm:w-4 text-brand-sage focus:ring-brand-sage border-gray-300 rounded"
              >
              <label for="is_active" class="ml-3 sm:ml-2 block text-base sm:text-sm text-gray-700 font-medium sm:font-normal">
                Active (visible to users)
              </label>
            </div>
          </div>

          <!-- Submit -->
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-4">
            <button
              type="submit"
              :disabled="isLoading"
              class="btn-primary w-full sm:w-auto justify-center items-center h-12 sm:h-10 text-base sm:text-sm px-6 sm:px-4 rounded-xl sm:rounded-lg font-medium order-1 sm:order-none inline-flex"
            >
              <Icon v-if="isLoading" name="heroicons:arrow-path" class="w-5 h-5 sm:w-4 sm:h-4 mr-2 animate-spin" />
              <Icon v-else name="heroicons:plus" class="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
              <span>Create Category</span>
            </button>
            
            <NuxtLink to="/dashboard/categories" class="btn-secondary w-full sm:w-auto justify-center items-center h-12 sm:h-10 text-base sm:text-sm px-6 sm:px-4 rounded-xl sm:rounded-lg order-2 sm:order-none inline-flex">
              <span>Cancel</span>
            </NuxtLink>
          </div>
        </form>
      </div>

      <!-- Quick Add Sample Categories -->
      <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-6 mt-6 sm:mt-8">
        <h3 class="text-base sm:text-lg font-medium text-blue-900 mb-2">Quick Start</h3>
        <p class="text-blue-700 mb-4 text-sm sm:text-base">Add sample categories to get started quickly:</p>
        <button
          @click="addSampleCategories"
          :disabled="isLoading"
          class="bg-blue-600 text-white px-6 py-3 sm:px-4 sm:py-2 rounded-xl sm:rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 w-full sm:w-auto h-12 sm:h-auto text-base sm:text-sm font-medium inline-flex items-center justify-center"
        >
          <Icon v-if="isLoading" name="heroicons:arrow-path" class="w-5 h-5 sm:w-4 sm:h-4 mr-2 animate-spin" />
          <span>Add Sample Categories</span>
        </button>
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
  title: 'Add Category | Dashboard',
  robots: 'noindex, nofollow'
})

const supabase = useSupabaseClient()

// State
const isLoading = ref(false)
const form = ref({
  name: '',
  slug: '',
  description: '',
  sort_order: 0,
  is_active: true
})

// Methods
const generateSlug = () => {
  if (form.value.name && !form.value.slug) {
    form.value.slug = form.value.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
}

const createCategory = async () => {
  isLoading.value = true
  
  try {
    const { error } = await supabase
      .from('categories')
      .insert(form.value)
    
    if (error) throw error
    
    useToast().success('Category created successfully!')
    await navigateTo('/dashboard/categories')
  } catch (error) {
    console.error('Error creating category:', error)
    useToast().error('Failed to create category')
  } finally {
    isLoading.value = false
  }
}

const addSampleCategories = async () => {
  isLoading.value = true
  
  try {
    console.log('Adding sample categories via API...')
    const response = await $fetch('/api/admin/categories/sample', {
      method: 'POST'
    })
    
    console.log('API response:', response)
    
    useToast().success('Sample categories added successfully!')
    await navigateTo('/dashboard/categories')
  } catch (error) {
    console.error('Full error details:', error)
    useToast().error(`Failed to add sample categories: ${error.data?.message || error.message}`)
  } finally {
    isLoading.value = false
  }
}
</script>
