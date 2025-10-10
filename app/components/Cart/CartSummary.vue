<template>
  <div class="bg-white rounded-2xl shadow-lg border border-gray-200 sticky top-8">
    <div class="p-6 border-b border-gray-100">
      <h3 class="text-xl font-semibold text-gray-900">Order Summary</h3>
    </div>

    <div class="p-6 space-y-4">
      <!-- Summary Details -->
      <div class="space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Items ({{ itemCount }})</span>
          <span class="text-gray-900 font-medium">${{ total.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Instant Download</span>
          <span class="text-green-600 font-medium">Free</span>
        </div>
        <div class="border-t pt-3">
          <div class="flex justify-between text-lg font-semibold">
            <span class="text-gray-900">Total</span>
            <span class="text-brand-brown">${{ total.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Checkout Button -->
      <NuxtLink
        to="/cart/checkout"
        class="w-full bg-gradient-to-r from-brand-brown to-brand-brown/90 hover:from-brand-brown/90 hover:to-brand-brown text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl text-center block"
      >
        <div class="flex items-center justify-center space-x-2">
          <Icon name="heroicons:lock-closed" class="w-5 h-5" />
          <span>Secure Checkout</span>
        </div>
      </NuxtLink>

      <!-- Additional Actions -->
      <div class="space-y-3 pt-4 border-t border-gray-100">
        <button
          @click="$emit('clear-cart')"
          class="w-full text-red-600 hover:text-red-700 font-medium py-2 text-sm transition-colors"
        >
          Clear Cart
        </button>
        <div class="text-center">
          <NuxtLink to="/templates" class="text-brand-brown hover:text-brand-brown/80 font-medium text-sm inline-flex items-center space-x-1">
            <Icon name="heroicons:arrow-left" class="w-4 h-4" />
            <span>Continue Shopping</span>
          </NuxtLink>
        </div>
      </div>

      <!-- Trust Badges -->
      <div class="pt-4 border-t border-gray-100">
        <div class="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div class="flex items-center space-x-1">
            <Icon name="heroicons:shield-check" class="w-4 h-4 text-green-500" />
            <span>Secure Payment</span>
          </div>
          <div class="flex items-center space-x-1">
            <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 text-blue-500" />
            <span>Instant Access</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  itemCount: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
})

defineEmits(['clear-cart'])
</script>