<template>
  <div class="flex items-center space-x-4">
    <!-- Mobile Search Toggle -->
    <button 
      @click="$emit('toggleMobileSearch')"
      class="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
    >
      <Icon name="heroicons:magnifying-glass" class="w-5 h-5" />
    </button>

    <!-- My Downloads Button (only for authenticated users) -->
    <NuxtLink 
      v-if="isAuthenticated" 
      to="/account" 
      class="hidden sm:flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
    >
      <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
      <span>My Downloads</span>
    </NuxtLink>

    <!-- Wishlist -->
    <button @click="wishlist.goToWishlist()" class="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
      <Icon name="heroicons:heart" class="w-6 h-6" />
      <!-- Wishlist Badge -->
      <span 
        v-if="wishlist.wishlistCount.value > 0" 
        class="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium min-w-[20px]"
      >
        {{ wishlist.wishlistCount.value }}
      </span>
    </button>

    <!-- Cart -->
    <button @click="cartCounter.goToCart()" class="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
      <Icon name="heroicons:shopping-bag" class="w-6 h-6" />
      <!-- Cart Badge -->
      <span 
        v-if="cartCounter.cartCount.value > 0" 
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium min-w-[20px]"
      >
        {{ cartCounter.cartCount.value }}
      </span>
    </button>

    <!-- Authentication Actions -->
    <div v-if="isAuthenticated" class="hidden lg:flex items-center">
      <!-- User Menu -->
      <div class="relative">
        <button 
          @click="toggleUserMenu"
          class="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <div class="w-8 h-8 bg-brand-pink rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
            {{ userInitials }}
          </div>
        </button>

        <!-- User Dropdown -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div 
            v-show="isUserMenuOpen"
            class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          >
            <div class="px-4 py-3 border-b border-gray-100">
              <p class="text-sm text-gray-900 font-medium">{{ userEmail }}</p>
              <p class="text-xs text-gray-500">{{ accountType }}</p>
            </div>
            
            <NuxtLink to="/account" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 mr-3" />
              My Downloads
            </NuxtLink>
            
            <NuxtLink to="/account/preferences" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              <Icon name="heroicons:cog-6-tooth" class="w-4 h-4 mr-3" />
              Preferences
            </NuxtLink>
            
            <hr class="my-2 border-gray-100">
            
            <button 
              @click="handleSignOut"
              class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
            >
              <Icon name="heroicons:arrow-right-on-rectangle" class="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Sign In/Sign Up (for guests) -->
    <div v-else class="hidden lg:flex items-center">
      <NuxtLink 
        :to="`/auth/login?redirect=${encodeURIComponent($route.fullPath)}`" 
        class="btn-primary px-6 py-2 text-sm"
      >
        Access Downloads
      </NuxtLink>
    </div>

    <!-- Mobile Menu Toggle -->
    <button 
      @click="$emit('toggleMobileMenu')" 
      class="lg:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
    >
      <Icon name="heroicons:bars-3" class="w-6 h-6" />
    </button>
  </div>
</template>

<script setup>
// Composables
const auth = useAuth()
const cartCounter = useCartCounter()
const wishlist = useWishlist()
const route = useRoute()

// Emits
defineEmits(['toggleMobileSearch', 'toggleMobileMenu'])

// State
const isUserMenuOpen = ref(false)

// Computed
const isAuthenticated = computed(() => auth.isAuthenticated.value)
const userEmail = computed(() => auth.authUser.value?.email || '')
const userInitials = computed(() => auth.userInitials.value || 'U')
const accountType = computed(() => {
  const provider = auth.authUser.value?.app_metadata?.provider
  return provider === 'google' ? 'Google Account' : 'Magic Link Account'
})

// Methods
const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const handleSignOut = async () => {
  isUserMenuOpen.value = false
  await auth.signOut()
}


// Close user menu when clicking outside
const closeUserMenuOnClickOutside = (event) => {
  if (isUserMenuOpen.value && !event.target.closest('.relative')) {
    isUserMenuOpen.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', closeUserMenuOnClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', closeUserMenuOnClickOutside)
})
</script>