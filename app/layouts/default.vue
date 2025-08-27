<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Header -->
    <LayoutHeader />

    <!-- Main Content -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <LayoutFooter />

    <!-- Cart Drawer - Temporarily disabled -->
    <!-- <CartDrawer /> -->

    <!-- Toast Notifications - Temporarily disabled -->
    <!-- <UIToast /> -->

    <!-- Loading Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isGlobalLoading" 
           class="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div class="text-center">
          <div class="loading-spinner mx-auto mb-4"></div>
          <p class="text-gray-600">Loading...</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
// Global loading state
const isGlobalLoading = ref(false)

// Initialize cart for all users (authenticated and guest)
const cart = useCart()
onMounted(async () => {
  await cart.init()
})

// Page metadata can be set here for global defaults
useHead({
  titleTemplate: (title) => title ? `${title} | Miracute` : 'Miracute - Beautiful Website Templates',
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#F4F1ED' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

// Global SEO defaults
useSeoMeta({
  ogSiteName: 'Miracute',
  twitterSite: '@miracute',
  twitterCreator: '@miracute'
})
</script>

<style>
/* Global scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Loading spinner animation */
.loading-spinner {
  @apply animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900;
}

/* Custom scrollbar for webkit browsers */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #F4F1ED;
}

::-webkit-scrollbar-thumb {
  background: #B8C4C2;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #A5B3B1;
}
</style>