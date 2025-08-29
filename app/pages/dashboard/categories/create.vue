<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-heading font-medium text-gray-900">Add Category</h1>
        <p class="text-gray-600 mt-2">Create a new template category</p>
      </div>
      <NuxtLink to="/dashboard/categories" class="btn-secondary">
        <Icon name="heroicons:arrow-left" class="w-5 h-5 mr-2" />
        Back to Categories
      </NuxtLink>
    </div>

      <!-- Form -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
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
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent"
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
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent"
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
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent"
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
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent"
                placeholder="0"
              >
            </div>

            <div class="flex items-center">
              <input
                v-model="form.is_active"
                type="checkbox"
                id="is_active"
                class="h-4 w-4 text-brand-sage focus:ring-brand-sage border-gray-300 rounded"
              >
              <label for="is_active" class="ml-2 block text-sm text-gray-700">
                Active (visible to users)
              </label>
            </div>
          </div>

          <!-- Submit -->
          <div class="flex gap-4 pt-4">
            <button
              type="submit"
              :disabled="isLoading"
              class="btn-primary"
            >
              <Icon v-if="isLoading" name="heroicons:arrow-path" class="w-5 h-5 mr-2 animate-spin" />
              <Icon v-else name="heroicons:plus" class="w-5 h-5 mr-2" />
              Create Category
            </button>
            
            <NuxtLink to="/dashboard/categories" class="btn-secondary">
              Cancel
            </NuxtLink>
          </div>
        </form>
      </div>

      <!-- Quick Add Sample Categories -->
      <div class="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-8">
        <h3 class="text-lg font-medium text-blue-900 mb-2">Quick Start</h3>
        <p class="text-blue-700 mb-4">Add sample categories to get started quickly:</p>
        <button
          @click="addSampleCategories"
          :disabled="isLoading"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <Icon v-if="isLoading" name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
          Add Sample Categories
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
