<template>
  <div class="text-center py-24">
    <div class="max-w-md mx-auto">
      <!-- Icon -->
      <div class="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <Icon name="heroicons:shopping-cart" class="w-10 h-10 text-gray-400" />
      </div>

      <!-- Text -->
      <h3 class="text-2xl font-semibold text-gray-900 mb-3">Your cart is empty</h3>
      <p class="text-gray-600 mb-8">Browse our templates to get started</p>

      <!-- Button -->
      <NuxtLink
        to="/listings"
        class="inline-flex items-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors"
      >
        <span>Browse Templates</span>
        <Icon name="heroicons:arrow-right" class="w-4 h-4" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
</script>