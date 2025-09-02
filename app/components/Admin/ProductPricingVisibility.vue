<template>
  <div class="space-y-6">
    <!-- Pricing -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
      
      <div class="mb-4">
        <label for="price" class="form-label">Price *</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
          <input
            id="price"
            :value="product.price"
            @input="updateProduct('price', ($event.target as HTMLInputElement).value)"
            type="number"
            step="0.01"
            min="0"
            required
            class="form-input pl-8"
            placeholder="9.99"
          />
        </div>
      </div>

      <div class="mb-4">
        <label for="compareAtPrice" class="form-label">Compare at price (optional)</label>
        <div class="relative">
          <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
          <input
            id="compareAtPrice"
            :value="product.compare_at_price"
            @input="updateProduct('compare_at_price', ($event.target as HTMLInputElement).value)"
            type="number"
            step="0.01"
            min="0"
            class="form-input pl-8"
            placeholder="19.99"
          />
        </div>
        <p class="mt-1 text-sm text-gray-500">
          Original price to show savings
        </p>
      </div>
    </div>

    <!-- Visibility & Status -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Visibility</h3>
      
      <div class="space-y-4">
        <label class="flex items-center">
          <input
            :checked="product.is_active"
            @change="updateProduct('is_active', ($event.target as HTMLInputElement).checked)"
            type="checkbox"
            class="form-checkbox"
          />
          <span class="ml-2 text-sm font-medium text-gray-700">
            Product is active and visible to customers
          </span>
        </label>

        <label class="flex items-center">
          <input
            :checked="product.is_featured"
            @change="updateProduct('is_featured', ($event.target as HTMLInputElement).checked)"
            type="checkbox"
            class="form-checkbox"
          />
          <span class="ml-2 text-sm font-medium text-gray-700">
            Feature this product (shows in featured section)
          </span>
        </label>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div class="space-y-3">
        <button
          type="submit"
          :disabled="isLoading"
          class="btn-primary w-full"
        >
          <span v-if="!isLoading">{{ isEditing ? 'Update Template' : 'Create Template' }}</span>
          <span v-else class="flex items-center justify-center">
            <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
            {{ isEditing ? 'Updating...' : 'Creating...' }}
          </span>
        </button>

        <button
          type="button"
          @click="$emit('save-draft')"
          :disabled="isLoading"
          class="btn-secondary w-full"
        >
          Save as Draft
        </button>

        <NuxtLink
          to="/dashboard/products"
          class="btn-outline w-full block text-center"
        >
          Cancel
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  product: any
  isLoading: boolean
  isEditing: boolean
}

interface Emits {
  (e: 'update:product', value: any): void
  (e: 'save-draft'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Helper function to update specific fields
const updateProduct = (field: string, value: any) => {
  const updatedProduct = { ...props.product, [field]: value }
  emit('update:product', updatedProduct)
}
</script>