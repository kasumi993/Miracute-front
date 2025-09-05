<template>
  <div>
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
        <HeaderSearchBar v-model="searchQuery" @search="handleSearch" />
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
          <NuxtLink to="/templates" @click="closeMenu" class="block text-gray-700 hover:text-gray-900 font-medium py-2">
            Templates
          </NuxtLink>
          
          <!-- Mobile Categories -->
          <div>
            <button 
              @click="toggleCategories"
              class="flex items-center justify-between w-full text-left text-gray-700 hover:text-gray-900 font-medium py-2"
            >
              <span>Categories</span>
              <Icon name="heroicons:chevron-down" class="w-4 h-4" :class="{ 'rotate-180': showCategories }" />
            </button>
            
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 -translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-1"
            >
              <div v-show="showCategories" class="pl-4 mt-2 space-y-2">
                <NuxtLink 
                  v-for="category in categories" 
                  :key="category.slug"
                  :to="`/templates?category=${category.slug}`" 
                  @click="closeMenu"
                  class="block text-sm text-gray-600 hover:text-gray-900 py-1"
                >
                  {{ category.name }}
                </NuxtLink>
                <NuxtLink to="/templates" @click="closeMenu" class="block text-sm text-gray-600 hover:text-gray-900 py-1 font-medium">
                  View All Categories →
                </NuxtLink>
              </div>
            </Transition>
          </div>

          <NuxtLink to="/blog" @click="closeMenu" class="block text-gray-700 hover:text-gray-900 font-medium py-2">
            Blog
          </NuxtLink>

          <NuxtLink to="/about" @click="closeMenu" class="block text-gray-700 hover:text-gray-900 font-medium py-2">
            About
          </NuxtLink>

          <NuxtLink to="/contact" @click="closeMenu" class="block text-gray-700 hover:text-gray-900 font-medium py-2">
            Contact
          </NuxtLink>

          <!-- Authentication Actions for Mobile -->
          <div class="pt-4 border-t border-gray-200">
            <template v-if="isAuthenticated">
              <NuxtLink to="/account" @click="closeMenu" class="block text-gray-700 hover:text-gray-900 font-medium py-2">
                My Downloads
              </NuxtLink>
              <NuxtLink to="/account/preferences" @click="closeMenu" class="block text-gray-700 hover:text-gray-900 font-medium py-2">
                Preferences
              </NuxtLink>
              <button 
                @click="handleSignOut" 
                class="block w-full text-left text-red-700 hover:text-red-900 font-medium py-2"
              >
                Sign Out
              </button>
            </template>
            <template v-else>
              <NuxtLink 
                :to="`/auth/login?redirect=${encodeURIComponent($route.fullPath)}`"
                @click="closeMenu"
                class="block text-gray-700 hover:text-gray-900 font-medium py-2"
              >
                Access Downloads
              </NuxtLink>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  showMobileSearch: {
    type: Boolean,
    default: false
  },
  showMobileMenu: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close-menu'])

// Composables
const auth = useAuth()
const route = useRoute()

// State
const searchQuery = ref('')
const showCategories = ref(false)

// Categories data (this could be moved to a composable or fetched from API)
const categories = [
  { name: 'Wedding Templates', slug: 'wedding-templates' },
  { name: 'Business Templates', slug: 'business-templates' },
  { name: 'Therapist Templates', slug: 'therapist-templates' },
  { name: 'Portfolio Templates', slug: 'portfolio-templates' }
]

// Computed
const isAuthenticated = computed(() => auth.isAuthenticated.value)

// Methods
const closeMenu = () => {
  emit('close-menu')
  showCategories.value = false
}

const toggleCategories = () => {
  showCategories.value = !showCategories.value
}

const handleSearch = (query) => {
  // Search functionality would be handled here
  console.log('Mobile search:', query)
  closeMenu()
}

const handleSignOut = async () => {
  await auth.signOut()
  closeMenu()
}
</script>