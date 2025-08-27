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
            <div class="relative w-full">
              <input
                v-model="searchQuery"
                @keyup.enter="performSearch"
                type="text"
                placeholder="Search templates..."
                class="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-brand-sage focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
              >
              <Icon name="heroicons:magnifying-glass" class="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <button v-if="searchQuery" 
                      @click="clearSearch"
                      class="absolute right-4 top-3.5 w-5 h-5 text-gray-400 hover:text-gray-600">
                <Icon name="heroicons:x-mark" class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Right Side: Cart, Track Order, Auth -->
          <div class="flex items-center space-x-4">
            <!-- Mobile Search Toggle -->
            <button @click="toggleMobileSearch" 
                    class="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors">
              <Icon name="heroicons:magnifying-glass" class="w-5 h-5" />
            </button>

            <!-- My Downloads Button (only for authenticated users) -->
            <NuxtLink v-if="isAuthenticated" to="/account/downloads" class="hidden sm:flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors">
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
              <span>My Downloads</span>
            </NuxtLink>

            <!-- Cart -->
            <NuxtLink to="/cart" class="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
              <Icon name="heroicons:shopping-bag" class="w-6 h-6" />
              <span v-if="cartItemCount > 0"
                    class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {{ cartItemCount }}
              </span>
            </NuxtLink>

            <!-- User Menu or Sign In/Up -->
            <div v-if="isAuthenticated" class="relative">
              <button class="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div class="w-8 h-8 bg-brand-pink rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
                  {{ userInitials }}
                </div>
                <Icon name="heroicons:chevron-down" class="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div v-else class="hidden lg:flex items-center">
              <NuxtLink :to="`/auth/login?redirect=${encodeURIComponent($route.fullPath)}`" 
                        class="btn-primary px-6 py-2 text-sm">
                Access Downloads
              </NuxtLink>
            </div>

            <!-- Mobile Menu Toggle -->
            <button @click="toggleMobileMenu" 
                    class="lg:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors">
              <Icon :name="showMobileMenu ? 'heroicons:x-mark' : 'heroicons:bars-3'" class="w-6 h-6" />
            </button>
          </div>
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
          <div class="relative" @mouseenter="showCategoriesMega = true" @mouseleave="showCategoriesMega = false">
            <button class="flex items-center space-x-1 text-gray-700 hover:text-gray-900 font-medium transition-colors uppercase tracking-wide text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
                    :class="{ 'text-gray-900 bg-gray-50': $route.path.startsWith('/templates') || $route.path.startsWith('/categories') }">
              <span>Shop by Categories</span>
              <Icon name="heroicons:chevron-down" class="w-4 h-4" />
            </button>
            
            <!-- Categories Mega Menu -->
            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="transform opacity-0 translate-y-2"
              enter-to-class="transform opacity-100 translate-y-0"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="transform opacity-100 translate-y-0"
              leave-to-class="transform opacity-0 translate-y-2"
            >
              <div v-show="showCategoriesMega" 
                   class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-screen max-w-5xl bg-white rounded-2xl shadow-2xl border border-gray-100 py-8 px-8 z-50">
                <div class="grid grid-cols-4 gap-8">
                  <!-- Wedding Templates -->
                  <div class="space-y-4">
                    <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200">Wedding</h3>
                    <div class="space-y-3">
                      <NuxtLink to="/categories/wedding-templates" 
                                class="flex items-center space-x-3 text-sm text-gray-600 hover:text-gray-900 transition-colors group">
                        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Icon name="heroicons:heart" class="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div class="font-medium">Wedding Invitations</div>
                          <div class="text-xs text-gray-500">Beautiful templates</div>
                        </div>
                      </NuxtLink>
                      <NuxtLink to="/categories/wedding-websites" 
                                class="block text-sm text-gray-600 hover:text-gray-900 transition-colors pl-15">
                        Wedding Websites
                      </NuxtLink>
                      <NuxtLink to="/categories/save-the-dates" 
                                class="block text-sm text-gray-600 hover:text-gray-900 transition-colors pl-15">
                        Save the Dates
                      </NuxtLink>
                    </div>
                  </div>

                  <!-- Business & Professional -->
                  <div class="space-y-4">
                    <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200">Business</h3>
                    <div class="space-y-3">
                      <NuxtLink to="/categories/business-templates" 
                                class="flex items-center space-x-3 text-sm text-gray-600 hover:text-gray-900 transition-colors group">
                        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Icon name="heroicons:briefcase" class="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div class="font-medium">Business Templates</div>
                          <div class="text-xs text-gray-500">Professional designs</div>
                        </div>
                      </NuxtLink>
                      <NuxtLink to="/categories/therapist-templates" 
                                class="block text-sm text-gray-600 hover:text-gray-900 transition-colors pl-15">
                        Therapist Templates
                      </NuxtLink>
                      <NuxtLink to="/categories/coach-templates" 
                                class="block text-sm text-gray-600 hover:text-gray-900 transition-colors pl-15">
                        Coach Templates
                      </NuxtLink>
                    </div>
                  </div>

                  <!-- Creative & Personal -->
                  <div class="space-y-4">
                    <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200">Creative</h3>
                    <div class="space-y-3">
                      <NuxtLink to="/categories/canva-templates" 
                                class="flex items-center space-x-3 text-sm text-gray-600 hover:text-gray-900 transition-colors group">
                        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Icon name="heroicons:sparkles" class="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div class="font-medium">Canva Templates</div>
                          <div class="text-xs text-gray-500">Ready-to-use designs</div>
                        </div>
                      </NuxtLink>
                      <NuxtLink to="/categories/baby-templates" 
                                class="block text-sm text-gray-600 hover:text-gray-900 transition-colors pl-15">
                        Baby Templates
                      </NuxtLink>
                      <NuxtLink to="/categories/portfolio-templates" 
                                class="block text-sm text-gray-600 hover:text-gray-900 transition-colors pl-15">
                        Portfolio Templates
                      </NuxtLink>
                    </div>
                  </div>

                  <!-- Bundles & More -->
                  <div class="space-y-4">
                    <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200">Special</h3>
                    <div class="space-y-3">
                      <NuxtLink to="/categories/bundles" 
                                class="flex items-center space-x-3 text-sm text-gray-600 hover:text-gray-900 transition-colors group">
                        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Icon name="heroicons:gift" class="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div class="font-medium">Template Bundles</div>
                          <div class="text-xs text-gray-500">Save with bundles</div>
                        </div>
                      </NuxtLink>
                      <NuxtLink to="/templates?featured=true" 
                                class="block text-sm text-gray-600 hover:text-gray-900 transition-colors pl-15">
                        Featured Templates
                      </NuxtLink>
                      <NuxtLink to="/templates?sort=newest" 
                                class="block text-sm text-gray-600 hover:text-gray-900 transition-colors pl-15">
                        New Arrivals
                      </NuxtLink>
                    </div>
                  </div>
                </div>

                <!-- Bottom CTA -->
                <div class="mt-8 pt-6 border-t border-gray-200 text-center">
                  <NuxtLink to="/templates" 
                            class="inline-flex items-center space-x-2 text-brand-brown hover:text-brand-brown/80 font-medium">
                    <span>Browse All Templates</span>
                    <Icon name="heroicons:arrow-right" class="w-4 h-4" />
                  </NuxtLink>
                </div>
              </div>
            </Transition>
          </div>

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
  </header>
</template>

<script setup>
// State
const searchQuery = ref('')
const showMobileMenu = ref(false)
const showMobileSearch = ref(false)
const showMobileCategories = ref(false)
const showCategories = ref(false)
const showCategoriesMega = ref(false)

// Mock data for now
const categories = ref([
  { id: '1', name: 'Wedding Templates', slug: 'wedding-templates' },
  { id: '2', name: 'Business Templates', slug: 'business-templates' },
  { id: '3', name: 'Therapist Templates', slug: 'therapist-templates' },
  { id: '4', name: 'Portfolio Templates', slug: 'portfolio-templates' }
])

// Auth state
const { user, isAuthenticated } = useAuth()
const userInitials = computed(() => {
  if (!user.value) return ''
  const firstName = user.value.user_metadata?.firstName || user.value.email?.charAt(0) || ''
  const lastName = user.value.user_metadata?.lastName || ''
  return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
})
const isAdmin = ref(false) // TODO: Implement admin role check

// Cart state
const cart = useCart()
const cartItemCount = cart.itemCount

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