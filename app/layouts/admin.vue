<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Main Content -->
    <main>
      <slot />
    </main>

    <!-- Toast Notifications -->
    <div id="toast-container"></div>
  </div>
</template>

<script setup>
// This layout is specifically for admin pages
// It's cleaner and focused on admin functionality

// Global loading state for admin operations
const isAdminLoading = ref(false)

// Initialize admin-specific functionality
onMounted(async () => {
  // Any admin-specific initialization can go here
})

// Page metadata for admin pages
useHead({
  titleTemplate: (title) => title ? `${title} | Admin` : 'Admin | Miracute',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<style scoped>
/* Admin-specific styles can go here */
</style>