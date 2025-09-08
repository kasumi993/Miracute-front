<template>
  <div>
    <!-- Loading Skeletons -->
    <div v-if="isLoading && products.length === 0" class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
      <AdminProductSkeleton 
        v-for="n in 12" 
        :key="`grid-skeleton-${n}`" 
        type="card" 
      />
    </div>
    
    <!-- Product Grid -->
    <div v-else class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
      <div 
        v-for="product in products" 
        :key="product.id" 
        class="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
        @click="$emit('edit', product)"
      >
        <!-- Product Image -->
        <div class="relative w-full h-40 sm:h-48 bg-gray-50 overflow-hidden">
          <img 
            v-if="product.preview_images?.[0]" 
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            :src="product.preview_images[0]" 
            :alt="product.name"
          />
          <div v-else class="w-full h-full flex items-center justify-center">
            <Icon name="heroicons:photo" class="w-8 h-8 sm:w-12 sm:h-12 text-gray-300" />
          </div>
          
          <!-- Status Overlay -->
          <div class="absolute top-2 left-2 sm:top-3 sm:left-3">
            <span :class="[
              'inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium backdrop-blur-sm',
              product.is_active 
                ? 'bg-green-100/90 text-green-800 border border-green-200/50' 
                : 'bg-red-100/90 text-red-800 border border-red-200/50'
            ]">
              {{ product.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
          
          <!-- Featured Badge -->
          <div v-if="product.is_featured" class="absolute top-2 right-2 sm:top-3 sm:right-3">
            <span class="inline-flex items-center px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium bg-purple-100/90 text-purple-800 border border-purple-200/50 backdrop-blur-sm">
              <Icon name="heroicons:star" class="w-3 h-3 mr-1" />
              <span class="hidden sm:inline">Featured</span>
            </span>
          </div>
          
          <!-- Quick Actions Overlay -->
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div class="flex items-center space-x-2" @click.stop>
              <AdminProductActions 
                :product="product"
                variant="overlay"
                @edit="(product) => $emit('edit', product)"
                @toggle-status="(product) => $emit('toggleStatus', product)"
                @delete="(product) => $emit('delete', product)"
              />
            </div>
          </div>
        </div>
        
        <!-- Product Info -->
        <div class="p-3 sm:p-4">
          <!-- Title and Category -->
          <div class="mb-2">
            <h3 class="font-medium text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-brand-brown transition-colors">
              {{ product.name }}
            </h3>
            <p class="text-xs text-gray-500 truncate">
              {{ getCategoryName(product.category_id) }}
            </p>
          </div>
          
          <!-- Price and File Status -->
          <div class="flex items-center justify-between mb-2 sm:mb-3">
            <div class="flex items-center space-x-1 sm:space-x-2 min-w-0">
              <span class="text-base sm:text-lg font-semibold text-gray-900 truncate">${{ product.price }}</span>
              <span v-if="product.compare_at_price" class="text-xs sm:text-sm text-gray-500 line-through truncate">
                ${{ product.compare_at_price }}
              </span>
            </div>
            <div class="flex items-center flex-shrink-0">
              <Icon 
                :name="product.download_files?.length ? 'heroicons:document-check' : 'heroicons:document-minus'" 
                class="w-4 h-4"
                :class="product.download_files?.length ? 'text-green-600' : 'text-red-500'" 
              />
            </div>
          </div>
          
          <!-- Stats Row -->
          <div class="flex items-center justify-between text-xs text-gray-500">
            <div class="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <span class="flex items-center">
                <Icon name="heroicons:eye" class="w-3 h-3 mr-1" />
                {{ product.view_count || 0 }}
              </span>
              <span class="flex items-center">
                <Icon name="heroicons:heart" class="w-3 h-3 mr-1" />
                {{ product.favorite_count || 0 }}
              </span>
            </div>
            <span class="truncate ml-2">{{ formatDate(product.created_at) }}</span>
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
    month: 'short',
    day: 'numeric',
    year: '2-digit'
  })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>