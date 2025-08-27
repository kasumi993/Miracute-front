<template>
  <header class="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
    <!-- Top Row: Logo, Search, Cart, Track Order -->
    <div class="border-b border-gray-100">
      <div class="container-custom">
        <div class="flex items-center justify-between h-16">
          <!-- Logo (Left) -->
          <div class="flex-shrink-0">
            <NuxtLink to="/" class="flex items-center hover:opacity-80 transition-opacity">
              <NuxtImg src="/logo.png" alt="Miracute Logo" width="120" class="h-auto"/>
            </NuxtLink>
          </div>

          <!-- Search Bar (Center) -->
          <div class="hidden md:flex flex-1 max-w-2xl mx-8">
            <HeaderSearchBar v-model="searchQuery" @search="handleSearch" />
          </div>

          <!-- Right Side: Cart, Track Order, Auth -->
          <HeaderUserActions 
            @toggle-mobile-search="toggleMobileSearch" 
            @toggle-mobile-menu="toggleMobileMenu" 
          />
        </div>
      </div>
    </div>

    <!-- Bottom Row: Main Navigation -->
    <div class="hidden lg:block">
      <div class="container-custom">
        <div class="flex items-center justify-center space-x-8 h-14">
          <!-- Home -->
          <NuxtLink to="/" 
                    class="text-gray-700 hover:text-gray-900 font-medium transition-colors uppercase tracking-wide text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
                    :class="{ 'text-gray-900 bg-gray-50': $route.path === '/' }">
            Home
          </NuxtLink>

          <!-- Shop by Categories (Mega Menu) -->
          <HeaderMegaMenu />

          <!-- About -->
          <NuxtLink to="/about" 
                    class="text-gray-700 hover:text-gray-900 font-medium transition-colors uppercase tracking-wide text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
                    :class="{ 'text-gray-900 bg-gray-50': $route.path === '/about' }">
            About
          </NuxtLink>

          <!-- Blog -->
          <NuxtLink to="/blog" 
                    class="text-gray-700 hover:text-gray-900 font-medium transition-colors uppercase tracking-wide text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
                    :class="{ 'text-gray-900 bg-gray-50': $route.path.startsWith('/blog') }">
            Blog
          </NuxtLink>

          <!-- Contact -->
          <NuxtLink to="/contact" 
                    class="text-gray-700 hover:text-gray-900 font-medium transition-colors uppercase tracking-wide text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
                    :class="{ 'text-gray-900 bg-gray-50': $route.path === '/contact' }">
            Contact
          </NuxtLink>
        </div>
      </div>
    </div>

      <!-- Mobile Menus -->
      <HeaderMobileMenu 
        :show-mobile-search="showMobileSearch" 
        :show-mobile-menu="showMobileMenu" 
      />
  </header>
</template>

<script setup>
// State
const searchQuery = ref('')
const showMobileMenu = ref(false)
const showMobileSearch = ref(false)

// Methods
const handleSearch = (query) => {
  if (query.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(query)}`)
    showMobileSearch.value = false
  }
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  showMobileSearch.value = false
}

const toggleMobileSearch = () => {
  showMobileSearch.value = !showMobileSearch.value
  showMobileMenu.value = false
}

// Close mobile menu when route changes
const route = useRoute()
watch(() => route.path, () => {
  showMobileMenu.value = false
})
</script>