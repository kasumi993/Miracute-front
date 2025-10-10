<template>
  <button
    @click="handleClick"
    class="relative p-2 text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
  >
    <Icon name="heroicons:shopping-bag" class="w-6 h-6" />
    <!-- Cart Badge -->
    <span
      v-if="cartCounter.cartCount.value > 0"
      class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium min-w-[20px]"
    >
      {{ cartCounter.cartCount.value }}
    </span>
  </button>
</template>

<script setup>
// Use cart composable for SSR safety
const cartCounter = useCartCounter()

const handleClick = () => {
  cartCounter.goToCart()
}
</script>