<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Admin Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="container-custom py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-heading font-medium text-gray-900">Admin Dashboard</h1>
            <p class="text-gray-600 mt-1">Manage your Miracute platform</p>
          </div>
          
          <div class="flex items-center space-x-4">
            <NuxtLink to="/" class="text-brand-brown hover:text-brand-brown/80 font-medium">
              ← Back to Site
            </NuxtLink>
            <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Icon name="heroicons:shield-check" class="w-4 h-4 text-red-600" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container-custom py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
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
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-3">
          <slot />
        </div>
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