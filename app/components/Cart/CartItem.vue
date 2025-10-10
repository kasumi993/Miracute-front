<template>
  <div class="group relative">
    <div class="flex items-center space-x-6 p-4 hover:bg-gray-50 rounded-xl transition-colors">
      <!-- Product Image -->
      <div class="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
        <img
          v-if="item.product.preview_images && item.product.preview_images.length > 0"
          :src="item.product.preview_images[0]"
          :alt="item.product.name"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        >
        <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
          <Icon name="heroicons:photo" class="w-8 h-8" />
        </div>
      </div>

      <!-- Product Info -->
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{{ item.product.name }}</h3>
        <div class="flex items-center space-x-3 mb-2">
          <span v-if="item.product.category" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {{ item.product.category.name }}
          </span>
          <span class="text-sm text-gray-500">Digital Download</span>
        </div>
        <div class="flex items-center justify-between">
          <p class="text-xl font-bold text-brand-brown">${{ parseFloat(item.price).toFixed(2) }}</p>
          <button
            @click="$emit('remove', item.id)"
            class="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50"
            title="Remove from cart"
          >
            <Icon name="heroicons:trash" class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true
  }
})

defineEmits(['remove'])
</script>