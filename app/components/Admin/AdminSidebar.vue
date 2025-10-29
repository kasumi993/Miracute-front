<template>
  <div>
    <!-- Mobile Overlay -->
    <div
      v-if="isOpen"
      @click="$emit('close')"
      class="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
    ></div>

    <!-- Sidebar -->
    <div
      :class="[
        'fixed lg:sticky inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
      :style="{
        top: '64px',
        height: 'calc(100vh - 64px)',
        willChange: 'transform'
      }"
    >
      <!-- Mobile Close Button -->
      <div class="lg:hidden flex justify-between items-center p-4 border-b border-gray-100">
        <div>
          <h2 class="text-lg font-heading font-medium text-gray-900">Admin</h2>
          <p class="text-gray-600 text-sm">Dashboard</p>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <Icon name="heroicons:x-mark" class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation -->
      <div class="flex-1 p-4 sm:p-6 overflow-y-auto">
        <nav class="space-y-1">
          <AdminSidebarLink
            to="/dashboard"
            :active="route.path === '/dashboard'"
            icon="heroicons:home"
            @click="$emit('close')"
          >
            Dashboard
          </AdminSidebarLink>

          <AdminSidebarLink
            to="/dashboard/products"
            :active="route.path.startsWith('/dashboard/products')"
            icon="heroicons:squares-2x2"
            @click="$emit('close')"
          >
            Products
          </AdminSidebarLink>

          <AdminSidebarLink
            to="/dashboard/categories"
            :active="route.path.startsWith('/dashboard/categories')"
            icon="heroicons:folder"
            @click="$emit('close')"
          >
            Categories
          </AdminSidebarLink>

          <AdminSidebarLink
            to="/dashboard/orders"
            :active="route.path.startsWith('/dashboard/orders')"
            icon="heroicons:shopping-bag"
            @click="$emit('close')"
          >
            Orders
          </AdminSidebarLink>

          <AdminSidebarLink
            to="/dashboard/customers"
            :active="route.path.startsWith('/dashboard/customers')"
            icon="heroicons:users"
            @click="$emit('close')"
          >
            Customers
          </AdminSidebarLink>

          <AdminSidebarLink
            to="/dashboard/coupons"
            :active="route.path.startsWith('/dashboard/coupons')"
            icon="heroicons:ticket"
            @click="$emit('close')"
          >
            Coupons
          </AdminSidebarLink>

          <AdminSidebarLink
            to="/dashboard/bundles"
            :active="route.path.startsWith('/dashboard/bundles')"
            icon="heroicons:squares-plus"
            @click="$emit('close')"
          >
            Bundles
          </AdminSidebarLink>

          <AdminSidebarLink
            to="/dashboard/analytics"
            :active="route.path.startsWith('/dashboard/analytics')"
            icon="heroicons:chart-bar"
            @click="$emit('close')"
          >
            Analytics
          </AdminSidebarLink>

          <AdminSidebarLink
            to="/dashboard/emails/test"
            :active="route.path.startsWith('/dashboard/emails')"
            icon="heroicons:envelope"
            @click="$emit('close')"
          >
            Email Testing
          </AdminSidebarLink>

          <AdminSidebarLink
            to="/dashboard/maintenance"
            :active="route.path.startsWith('/dashboard/maintenance')"
            icon="heroicons:cog-6-tooth"
            @click="$emit('close')"
          >
            Maintenance
          </AdminSidebarLink>
        </nav>
      </div>

      <!-- Back to Site Link -->
      <div class="p-4 sm:p-6 border-t border-gray-200">
        <NuxtLink
          to="/"
          @click="$emit('close')"
          class="flex items-center space-x-2 text-brand-brown hover:text-brand-brown/80 font-medium text-sm py-2 px-2 rounded-lg hover:bg-brand-brown/5 transition-colors"
        >
          <Icon name="heroicons:arrow-left" class="w-4 h-4" />
          <span>Back to Site</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
}

defineProps<Props>()
const emit = defineEmits(['close'])

// Close sidebar on route change
const route = useRoute()
watch(() => route.path, () => {
  // Emit close when route changes
  nextTick(() => {
    emit('close')
  })
})

// Close sidebar on escape key
onMounted(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      emit('close')
    }
  }
  document.addEventListener('keydown', handleEscape)
  
  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
  })
})
</script>