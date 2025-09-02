<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Main Content -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <footer class="text-center py-8 text-sm text-gray-500">
      <p>&copy; {{ new Date().getFullYear() }} Miracute. All rights reserved.</p>
      <div class="flex justify-center space-x-4 mt-2">
        <NuxtLink to="/privacy" class="hover:text-gray-700 transition-colors">Privacy</NuxtLink>
        <NuxtLink to="/terms" class="hover:text-gray-700 transition-colors">Terms</NuxtLink>
        <NuxtLink to="/contact" class="hover:text-gray-700 transition-colors">Contact</NuxtLink>
      </div>
    </footer>

    <!-- Toast Notifications -->
    <UIToast />
  </div>
</template>

<script setup>
</script>