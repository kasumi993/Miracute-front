<template>
  <header class="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
    <nav class="container-custom">
      <div class="flex items-center justify-between h-16 lg:h-20">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <NuxtImg src="/logo.png" alt="Miracute Logo" width="80"/>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <div class="hidden lg:flex items-center space-x-8">
          <NuxtLink to="/templates" 
                    class="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                    :class="{ 'text-gray-900': $route.path.startsWith('/templates') }">
            Templates
          </NuxtLink>
          
          <!-- Categories Dropdown -->
          <div class="relative" @mouseenter="showCategories = true" @mouseleave="showCategories = false">
            <button class="flex items-center space-x-1 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                    :class="{ 'text-gray-900': $route.path.startsWith('/categories') }">
              <span>Categories</span>
              <Icon name="heroicons:chevron-down" class="w-4 h-4" />
            </button>
            
            <!-- Categories Dropdown Menu -->
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <div v-show="showCategories" 
                   class="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                <NuxtLink v-for="category in categories" 
                          :key="category.id"
                          :to="`/categories/${category.slug}`"
                          class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  {{ category.name }}
                </NuxtLink>
                <div class="border-t border-gray-100 mt-2 pt-2">
                  <NuxtLink to="/categories" 
                            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-medium transition-colors">
                    View All Categories →
                  </NuxtLink>
                </div>
              </div>
            </Transition>
          </div>

          <NuxtLink to="/blog" 
                    class="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                    :class="{ 'text-gray-900': $route.path.startsWith('/blog') }">
            Blog
          </NuxtLink>
        </div>

        <!-- Search Bar -->
        <div class="hidden md:flex flex-1 max-w-md mx-8">
          <div class="relative w-full">
            <input
              v-model="searchQuery"
              @keyup.enter="performSearch"
              type="text"
              placeholder="Search templates..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent"
            >
            <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <button v-if="searchQuery" 
                    @click="clearSearch"
                    class="absolute right-3 top-2.5 w-5 h-5 text-gray-400 hover:text-gray-600">
              <Icon name="heroicons:x-mark" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Right Side Actions -->
        <div class="flex items-center space-x-4">
          <!-- Mobile Search Toggle -->
          <button @click="toggleMobileSearch" 
                  class="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors">
            <Icon name="heroicons:magnifying-glass" class="w-5 h-5" />
          </button>

          <!-- Cart -->
          <button @click="toggleCart" 
                  class="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
            <Icon name="heroicons:shopping-bag" class="w-6 h-6" />
            <span v-if="cartItemCount > 0"
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {{ cartItemCount }}
            </span>
          </button>

          <!-- User Menu -->
          <div v-if="isAuthenticated" class="relative">
            <div class="relative">
              <button class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div class="w-8 h-8 bg-brand-pink rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                  {{ userInitials }}
                </div>
                <Icon name="heroicons:chevron-down" class="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          <!-- Sign In / Sign Up -->
          <div v-else class="flex items-center space-x-3">
            <NuxtLink to="/auth/login" 
                      class="text-gray-700 hover:text-gray-900 font-medium transition-colors">
              Sign In
            </NuxtLink>
            <NuxtLink to="/auth/register" 
                      class="btn-primary px-4 py-2 text-sm">
              Sign Up
            </NuxtLink>
          </div>

          <!-- Mobile Menu Toggle -->
          <button @click="toggleMobileMenu" 
                  class="lg:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors">
            <Icon :name="showMobileMenu ? 'heroicons:x-mark' : 'heroicons:bars-3'" class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Mobile Search -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform translate-y-2 opacity-0"
      >
        <div v-show="showMobileSearch" class="md:hidden border-t border-gray-200 px-4 py-3">
          <div class="relative">
            <input
              v-model="searchQuery"
              @keyup.enter="performSearch"
              type="text"
              placeholder="Search templates..."
              class="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent"
            >
            <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <button v-if="searchQuery" 
                    @click="clearSearch"
                    class="absolute right-3 top-2.5 w-5 h-5 text-gray-400 hover:text-gray-600">
              <Icon name="heroicons:x-mark" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </Transition>

      <!-- Mobile Menu -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform translate-y-0 opacity-100"
        leave-to-class="transform translate-y-2 opacity-0"
      >
        <div v-show="showMobileMenu" class="lg:hidden border-t border-gray-200 bg-white">
          <div class="px-4 py-3 space-y-3">
            <NuxtLink @click="closeMobileMenu" 
                      to="/templates" 
                      class="block text-gray-700 hover:text-gray-900 font-medium py-2">
              Templates
            </NuxtLink>
            
            <!-- Mobile Categories -->
            <div>
              <button @click="toggleMobileCategories"
                      class="flex items-center justify-between w-full text-left text-gray-700 hover:text-gray-900 font-medium py-2">
                <span>Categories</span>
                <Icon :name="showMobileCategories ? 'heroicons:chevron-up' : 'heroicons:chevron-down'" class="w-4 h-4" />
              </button>
              
              <Transition
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
              >
                <div v-show="showMobileCategories" class="pl-4 mt-2 space-y-2">
                  <NuxtLink v-for="category in categories" 
                            :key="category.id"
                            @click="closeMobileMenu"
                            :to="`/categories/${category.slug}`"
                            class="block text-sm text-gray-600 hover:text-gray-900 py-1">
                    {{ category.name }}
                  </NuxtLink>
                  <NuxtLink @click="closeMobileMenu" 
                            to="/categories" 
                            class="block text-sm text-gray-600 hover:text-gray-900 py-1 font-medium">
                    View All Categories →
                  </NuxtLink>
                </div>
              </Transition>
            </div>

            <NuxtLink @click="closeMobileMenu" 
                      to="/blog" 
                      class="block text-gray-700 hover:text-gray-900 font-medium py-2">
              Blog
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </nav>
  </header>
</template>

<script setup>
// State
const searchQuery = ref('')
const showMobileMenu = ref(false)
const showMobileSearch = ref(false)
const showMobileCategories = ref(false)
const showCategories = ref(false)

// Mock data for now
const categories = ref([
  { id: '1', name: 'Wedding Templates', slug: 'wedding-templates' },
  { id: '2', name: 'Business Templates', slug: 'business-templates' },
  { id: '3', name: 'Therapist Templates', slug: 'therapist-templates' },
  { id: '4', name: 'Portfolio Templates', slug: 'portfolio-templates' }
])

// Mock auth state
const isAuthenticated = ref(false)
const userInitials = ref('')
const isAdmin = ref(false)

// Mock cart state
const cartItemCount = ref(0)

// Methods
const performSearch = () => {
  if (searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value)}`)
    showMobileSearch.value = false
  }
}

const clearSearch = () => {
  searchQuery.value = ''
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  showMobileSearch.value = false
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
  showMobileCategories.value = false
}

const toggleMobileSearch = () => {
  showMobileSearch.value = !showMobileSearch.value
  showMobileMenu.value = false
}

const toggleMobileCategories = () => {
  showMobileCategories.value = !showMobileCategories.value
}

const toggleCart = () => {
  console.log('Cart toggled')
}

const signOut = () => {
  console.log('Sign out')
}

// Close mobile menu when route changes
const route = useRoute()
watch(() => route.path, () => {
  closeMobileMenu()
})
</script>