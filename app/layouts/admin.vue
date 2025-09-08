<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Admin Header -->
    <AdminHeader 
      :breadcrumbs="breadcrumbs"
      @toggle-sidebar="toggleSidebar" 
    />
    
    <div class="flex">
      <!-- Responsive Sidebar -->
      <AdminSidebar 
        :is-open="isSidebarOpen"
        @close="closeSidebar" 
      />

      <!-- Main Content Area -->
      <div class="flex-1 lg:ml-0">
        <!-- Page Content -->
        <main class="p-3 sm:p-4 lg:p-6 xl:p-8">
          <slot />
        </main>
      </div>
    </div>

    <UIToast />
  </div>
</template>

<script setup>
// Use admin layout composable for state management
const { isSidebarOpen, toggleSidebar, closeSidebar, generateBreadcrumbs } = useAdminLayout()

// Computed breadcrumbs based on route
const route = useRoute()
const breadcrumbs = computed(() => generateBreadcrumbs(route.path))

useHead({
  titleTemplate: (title) => title ? `${title} | Admin` : 'Admin | Miracute',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>