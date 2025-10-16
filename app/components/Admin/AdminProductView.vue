<template>
  <div>
    <!-- Mobile List View -->
    <div class="lg:hidden">
      <!-- Loading Skeletons -->
      <div v-if="isLoading && products.length === 0" class="space-y-4">
        <AdminProductSkeleton 
          v-for="n in 8" 
          :key="`mobile-skeleton-${n}`" 
          type="mobile" 
        />
      </div>
      
      <!-- Product List -->
      <div v-else class="space-y-3">
        <div 
          v-for="product in products" 
          :key="product.id" 
          class="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer overflow-hidden"
          @click="$emit('edit', product)"
        >
          <div class="p-4">
            <div class="flex items-start space-x-4">
              <!-- Product Image -->
              <div class="flex-shrink-0">
                <img 
                  v-if="product.preview_images?.[0]" 
                  class="h-16 w-16 rounded-lg object-cover"
                  :src="product.preview_images[0]" 
                  :alt="product.name"
                />
                <div v-else class="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Icon name="heroicons:photo" class="w-8 h-8 text-gray-400" />
                </div>
              </div>
              
              <!-- Content -->
              <div class="flex-1 min-w-0">
                <!-- Title and Status -->
                <div class="flex items-start justify-between mb-2">
                  <div class="flex-1 min-w-0 pr-2">
                    <h3 class="text-base font-medium text-gray-900 line-clamp-1">
                      {{ product.name }}
                    </h3>
                    <p class="text-sm text-gray-500 line-clamp-1 mt-1">
                      {{ getCategoryName(product.category_id) }}
                    </p>
                  </div>
                  
                  <!-- Status Badge -->
                  <div class="flex-shrink-0">
                    <span :class="[
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      product.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    ]">
                      {{ product.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </div>

                <!-- Price and File Status -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-2">
                    <span class="text-lg font-semibold text-gray-900">${{ product.price }}</span>
                    <span v-if="product.compare_at_price" class="text-sm text-gray-500 line-through">
                      ${{ product.compare_at_price }}
                    </span>
                  </div>
                  
                  <div class="flex items-center space-x-3">
                    <!-- File Status -->
                    <div class="flex items-center">
                      <Icon 
                        :name="product.download_files?.length ? 'heroicons:document-check' : 'heroicons:document-minus'" 
                        class="w-4 h-4 mr-1"
                        :class="product.download_files?.length ? 'text-green-600' : 'text-red-500'" 
                      />
                      <span class="text-xs" :class="product.download_files?.length ? 'text-green-800' : 'text-red-600'">
                        {{ product.download_files?.length ? 'File' : 'No File' }}
                      </span>
                    </div>
                    
                    <!-- Actions -->
                    <div @click.stop>
                      <AdminProductActions
                        :product="product"
                        variant="compact"
                        @edit="(product) => $emit('edit', product)"
                        @toggle-status="(product) => $emit('toggle-status', product)"
                        @delete="(product) => $emit('delete', product)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Grid View -->
    <div class="hidden lg:block">
      <AdminProductList
        :products="products"
        :categories="categories"
        :is-loading="isLoading"
        @edit="$emit('edit', $event)"
        @toggle-status="$emit('toggle-status', $event)"
        @delete="$emit('delete', $event)"
      />
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
  (e: 'toggle-status', product: any): void
  (e: 'delete', product: any): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

const getCategoryName = (categoryId: string) => {
  if (!categoryId) return 'Uncategorized'
  const category = props.categories.find(cat => cat.id === categoryId)
  return category?.name || 'Unknown'
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