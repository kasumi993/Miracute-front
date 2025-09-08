<template>
  <div>
    <!-- Mobile List View -->
    <div class="lg:hidden space-y-3">
      <!-- Loading Skeletons -->
      <div v-if="isLoading && categories.length === 0" class="space-y-4">
        <div v-for="n in 6" :key="`mobile-skeleton-${n}`" class="bg-white rounded-xl border border-gray-200 p-4">
          <div class="animate-pulse">
            <div class="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
            <div class="flex justify-between items-center">
              <div class="h-6 bg-gray-200 rounded w-16"></div>
              <div class="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Category List -->
      <div 
        v-else
        v-for="category in categories" 
        :key="category.id" 
        class="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
        @click="$emit('edit', category)"
      >
        <div class="p-4">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0 pr-3">
              <h3 class="text-base font-medium text-gray-900 line-clamp-1">
                {{ category.name }}
              </h3>
              <p class="text-sm text-gray-500 mt-1">
                /{{ category.slug }}
              </p>
            </div>
            
            <!-- Status Badge -->
            <div class="flex-shrink-0">
              <span :class="[
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                category.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              ]">
                {{ category.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>

          <!-- Category Details -->
          <div class="grid grid-cols-2 gap-4 text-sm mb-3">
            <div>
              <span class="text-gray-500">Products:</span>
              <span class="ml-1 font-medium text-gray-900">{{ category.product_count || 0 }}</span>
            </div>
            <div class="text-right">
              <span class="text-gray-500">Sort:</span>
              <span class="ml-1 font-medium text-gray-900">{{ category.sort_order || 0 }}</span>
            </div>
          </div>

          <!-- Description -->
          <div v-if="category.description" class="mb-3">
            <p class="text-sm text-gray-600 line-clamp-2">{{ category.description }}</p>
          </div>

          <!-- Actions and Date -->
          <div class="flex items-center justify-between pt-3 border-t border-gray-100">
            <span class="text-xs text-gray-500">
              {{ formatDate(category.created_at) }}
            </span>
            
            <div @click.stop>
              <AdminCategoryActions 
                :category="category"
                variant="compact"
                @edit="(category) => $emit('edit', category)"
                @toggle-status="(category) => $emit('toggleStatus', category)"
                @delete="(category) => $emit('delete', category)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop Table View -->
    <div class="hidden lg:block">
      <AdminCategoryTable
        :categories="categories"
        :is-loading="isLoading"
        @edit="$emit('edit', $event)"
        @toggle-status="$emit('toggleStatus', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  categories: any[]
  isLoading: boolean
}

interface Emits {
  (e: 'edit', category: any): void
  (e: 'toggleStatus', category: any): void
  (e: 'delete', category: any): void
}

defineProps<Props>()
defineEmits<Emits>()

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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>