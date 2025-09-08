<template>
  <div class="lg:hidden divide-y divide-gray-200">
    <!-- Loading Skeletons -->
    <AdminProductSkeleton 
      v-if="isLoading && products.length === 0" 
      v-for="n in 5" 
      :key="`mobile-skeleton-${n}`" 
      type="mobile" 
    />
    
    <!-- Product Cards -->
    <div 
      v-else
      v-for="product in products" 
      :key="product.id" 
      class="p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
      @click="$emit('edit', product)"
    >
      <div class="flex items-start space-x-3 sm:space-x-4">
        <!-- Product Image -->
        <div class="flex-shrink-0">
          <img 
            v-if="product.preview_images?.[0]" 
            class="h-12 w-12 sm:h-16 sm:w-16 rounded-lg object-cover"
            :src="product.preview_images[0]" 
            :alt="product.name"
          />
          <div v-else class="h-12 w-12 sm:h-16 sm:w-16 rounded-lg bg-gray-200 flex items-center justify-center">
            <Icon name="heroicons:photo" class="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
          </div>
        </div>
        
        <!-- Content -->
        <div class="flex-1 min-w-0">
          <!-- Title and Status -->
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0 pr-2">
              <h3 class="text-sm font-medium text-gray-900 line-clamp-1">
                {{ product.name }}
              </h3>
              <p class="text-xs sm:text-sm text-gray-500 line-clamp-1 mt-1">
                {{ product.short_description }}
              </p>
            </div>
            
            <!-- Status Badges -->
            <div class="flex flex-col items-end space-y-1 flex-shrink-0">
              <span :class="[
                'inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium',
                product.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              ]">
                {{ product.is_active ? 'Active' : 'Inactive' }}
              </span>
              <span v-if="product.is_featured" class="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Featured
              </span>
            </div>
          </div>

          <!-- Details Grid -->
          <div class="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm mt-3">
            <!-- Category -->
            <div class="min-w-0">
              <span class="text-gray-500">Category:</span>
              <span class="ml-1 text-gray-900 truncate block sm:inline">{{ getCategoryName(product.category_id) }}</span>
            </div>
            
            <!-- Price -->
            <div class="text-left sm:text-right min-w-0">
              <span class="text-gray-500">Price:</span>
              <div class="ml-1 truncate">
                <span class="text-gray-900 font-medium">${{ product.price }}</span>
                <span v-if="product.compare_at_price" class="text-xs text-gray-500 line-through ml-1">
                  ${{ product.compare_at_price }}
                </span>
              </div>
            </div>

            <!-- File Status -->
            <div class="min-w-0">
              <span class="text-gray-500">File:</span>
              <span 
                class="ml-1 inline-flex items-center truncate"
                :class="product.download_files?.length ? 'text-green-800' : 'text-red-600'"
              >
                <Icon 
                  :name="product.download_files?.length ? 'heroicons:document-check' : 'heroicons:document-minus'" 
                  class="w-3 h-3 mr-1 flex-shrink-0" 
                />
                {{ product.download_files?.length ? 'Uploaded' : 'Missing' }}
              </span>
            </div>

            <!-- Created Date -->
            <div class="text-left sm:text-right min-w-0">
              <span class="text-gray-500">Created:</span>
              <span class="ml-1 text-gray-900 truncate block sm:inline">{{ formatDate(product.created_at) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end mt-3 pt-3 border-t border-gray-100">
            <AdminProductActions 
              :product="product"
              @edit="(product) => $emit('edit', product)"
              @toggle-status="(product) => $emit('toggleStatus', product)"
              @delete="(product) => $emit('delete', product)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  products: any[]
  categories: any[]
  isLoading: boolean
}

interface Emits {
  (e: 'edit', product: any): void
  (e: 'toggleStatus', product: any): void
  (e: 'delete', product: any): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const getCategoryName = (categoryId: string) => {
  if (!categoryId) return 'Uncategorized'
  const category = props.categories.find(cat => cat.id === categoryId)
  return category?.name || 'Unknown'
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>