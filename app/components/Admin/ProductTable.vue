<template>
  <div class="hidden lg:block overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Template
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Category
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Price
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            File
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
        <!-- Loading Skeletons -->
        <AdminProductSkeleton 
          v-if="isLoading && products.length === 0" 
          v-for="n in 5" 
          :key="`skeleton-${n}`" 
          type="desktop" 
        />
        
        <!-- Product Rows -->
        <tr 
          v-else
          v-for="product in products" 
          :key="product.id" 
          class="hover:bg-gray-50 cursor-pointer" 
          @click="$emit('edit', product)"
        >
          <!-- Template Info -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="flex-shrink-0 h-12 w-12">
                <img 
                  v-if="product.preview_images?.[0]" 
                  class="h-12 w-12 rounded-lg object-cover"
                  :src="product.preview_images[0]" 
                  :alt="product.name"
                />
                <div v-else class="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Icon name="heroicons:photo" class="w-6 h-6 text-gray-400" />
                </div>
              </div>
              <div class="ml-4">
                <div class="text-sm font-medium text-gray-900 truncate max-w-xs">
                  {{ product.name }}
                </div>
                <div class="text-sm text-gray-500 truncate max-w-xs">
                  {{ product.short_description }}
                </div>
              </div>
            </div>
          </td>
          
          <!-- Category -->
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {{ getCategoryName(product.category_id) }}
          </td>
          
          <!-- Price -->
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            <div class="flex flex-col">
              <span class="font-medium">${{ product.price }}</span>
              <span v-if="product.compare_at_price" class="text-xs text-gray-500 line-through">
                ${{ product.compare_at_price }}
              </span>
            </div>
          </td>
          
          <!-- Status -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center space-x-2">
              <span :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                product.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              ]">
                {{ product.is_active ? 'Active' : 'Inactive' }}
              </span>
              <span v-if="product.is_featured" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Featured
              </span>
            </div>
          </td>
          
          <!-- File Status -->
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <Icon 
                :name="product.download_files?.length ? 'heroicons:document-check' : 'heroicons:document-minus'" 
                :class="product.download_files?.length ? 'text-green-600' : 'text-red-400'"
                class="w-5 h-5 mr-2" 
              />
              <span class="text-sm" :class="product.download_files?.length ? 'text-green-800' : 'text-red-600'">
                {{ product.download_files?.length ? 'Uploaded' : 'Missing' }}
              </span>
            </div>
          </td>
          
          <!-- Created Date -->
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ formatDate(product.created_at) }}
          </td>
          
          <!-- Actions -->
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <AdminProductActions 
              :product="product"
              @edit="(product) => $emit('edit', product)"
              @toggle-status="(product) => $emit('toggleStatus', product)"
              @delete="(product) => $emit('delete', product)"
              @click.stop
            />
          </td>
        </tr>
      </tbody>
    </table>
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