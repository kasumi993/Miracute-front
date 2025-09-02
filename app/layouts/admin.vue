<template>
  <div class="min-h-screen bg-neutral-50 flex">
    <!-- Sidebar Navigation -->
    <div class="hidden lg:flex w-64 flex-col bg-white border-r border-gray-200">
      <div class="flex flex-col h-full">
        <!-- Admin Header (Sidebar) -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-heading font-medium text-gray-900">Admin</h2>
              <p class="text-gray-600 text-sm mt-1">Dashboard</p>
            </div>
          </div>
        </div>
        
        <!-- Navigation -->
        <div class="flex-1 p-6">
          <nav class="space-y-2">
              <NuxtLink to="/dashboard" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors"
                        :class="$route.path === '/dashboard' ? 'text-gray-900 bg-gray-100 font-medium' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'">
                <Icon name="heroicons:home" class="w-5 h-5" />
                <span>Dashboard</span>
              </NuxtLink>
              
              <NuxtLink to="/dashboard/products" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors"
                        :class="$route.path.startsWith('/dashboard/products') ? 'text-gray-900 bg-gray-100 font-medium' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'">
                <Icon name="heroicons:squares-2x2" class="w-5 h-5" />
                <span>Products</span>
              </NuxtLink>
              
              <NuxtLink to="/dashboard/categories" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors"
                        :class="$route.path.startsWith('/dashboard/categories') ? 'text-gray-900 bg-gray-100 font-medium' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'">
                <Icon name="heroicons:folder" class="w-5 h-5" />
                <span>Categories</span>
              </NuxtLink>
              
              <NuxtLink to="/dashboard/orders" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors"
                        :class="$route.path.startsWith('/dashboard/orders') ? 'text-gray-900 bg-gray-100 font-medium' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'">
                <Icon name="heroicons:shopping-bag" class="w-5 h-5" />
                <span>Orders</span>
              </NuxtLink>
              
              <NuxtLink to="/dashboard/customers" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors"
                        :class="$route.path.startsWith('/dashboard/customers') ? 'text-gray-900 bg-gray-100 font-medium' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'">
                <Icon name="heroicons:users" class="w-5 h-5" />
                <span>Customers</span>
              </NuxtLink>
              
              <NuxtLink to="/dashboard/analytics" 
                        class="flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors"
                        :class="$route.path.startsWith('/dashboard/analytics') ? 'text-gray-900 bg-gray-100 font-medium' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'">
                <Icon name="heroicons:chart-bar" class="w-5 h-5" />
                <span>Analytics</span>
              </NuxtLink>
            </nav>
        </div>
        
        <!-- Back to Site Link -->
        <div class="p-6 border-t border-gray-200">
          <NuxtLink to="/" class="flex items-center space-x-2 text-brand-brown hover:text-brand-brown/80 font-medium text-sm">
            <Icon name="heroicons:arrow-left" class="w-4 h-4" />
            <span>Back to Site</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col">
      <!-- Top Header -->
      <div class="bg-white border-b border-gray-200 lg:hidden">
        <div class="px-4 py-4">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-heading font-medium text-gray-900">Admin Dashboard</h1>
            </div>
            <NuxtLink to="/" class="text-brand-brown hover:text-brand-brown/80 font-medium text-sm">
              ← Back
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Page Content -->
      <div class="flex-1 p-4 lg:p-8">
        <slot />
      </div>
    </div>

    <UIToast />
  </div>
</template>

<script setup>
const isAdminLoading = ref(false)

onMounted(async () => {
})

useHead({
  titleTemplate: (title) => title ? `${title} | Admin` : 'Admin | Miracute',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>