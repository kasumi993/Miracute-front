<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-30">
    <div class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
      <!-- Left side: Mobile menu button + breadcrumbs -->
      <div class="flex items-center flex-1">
        <!-- Mobile Menu Button -->
        <button
          @click="toggleSidebar"
          class="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition-colors mr-3 flex items-center justify-center"
          aria-label="Toggle navigation menu"
          style="min-width: 44px; min-height: 44px;"
        >
          <Icon name="heroicons:bars-3" class="w-5 h-5" />
          <span class="sr-only">Menu</span>
        </button>

        <!-- Breadcrumbs / Page Title -->
        <div class="flex items-center space-x-2 min-w-0">
          <nav class="flex items-center space-x-2 text-sm" aria-label="Breadcrumb">
            <NuxtLink 
              to="/dashboard" 
              class="text-gray-500 hover:text-gray-700 transition-colors hidden sm:block"
            >
              Dashboard
            </NuxtLink>
            <Icon 
              v-if="breadcrumbs.length > 0" 
              name="heroicons:chevron-right" 
              class="w-4 h-4 text-gray-400 hidden sm:block" 
            />
            <span 
              v-for="(crumb, index) in breadcrumbs" 
              :key="index"
              class="flex items-center space-x-2"
            >
              <NuxtLink 
                v-if="crumb.to && index < breadcrumbs.length - 1"
                :to="crumb.to"
                class="text-gray-500 hover:text-gray-700 transition-colors hidden sm:block"
              >
                {{ crumb.label }}
              </NuxtLink>
              <span 
                v-else
                class="font-medium text-gray-900 truncate"
                :class="{ 'text-base sm:text-lg': index === breadcrumbs.length - 1 }"
              >
                {{ crumb.label }}
              </span>
              <Icon 
                v-if="index < breadcrumbs.length - 1" 
                name="heroicons:chevron-right" 
                class="w-4 h-4 text-gray-400 hidden sm:block" 
              />
            </span>
          </nav>
        </div>
      </div>

      <!-- Right side: Actions -->
      <div class="flex items-center space-x-2">
        <!-- Quick Search (desktop) -->
        <div class="hidden md:block">
          <div class="relative">
            <Icon 
              name="heroicons:magnifying-glass" 
              class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" 
            />
            <input
              v-model="quickSearch"
              @input="onQuickSearch"
              @focus="showQuickResults = true"
              @blur="hideQuickResults"
              type="text"
              placeholder="Quick search..."
              class="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-transparent w-48 lg:w-64"
            />
            <!-- Quick search results dropdown -->
            <div 
              v-if="showQuickResults && quickSearchResults.length > 0"
              class="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            >
              <div 
                v-for="result in quickSearchResults" 
                :key="result.id"
                class="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                @click="navigateToResult(result)"
              >
                <div class="font-medium text-gray-900">{{ result.title }}</div>
                <div class="text-gray-500 text-xs">{{ result.type }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Simple User Indicator -->
        <div class="flex items-center text-sm text-gray-600">
          <div class="hidden sm:block mr-2">
            {{ user?.first_name || user?.email?.split('@')[0] || 'Admin' }}
          </div>
          <div class="w-8 h-8 bg-brand-brown text-white rounded-full flex items-center justify-center text-sm font-medium">
            {{ userInitials }}
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Breadcrumb {
  label: string
  to?: string
}

interface QuickSearchResult {
  id: string
  title: string
  type: string
  url: string
}

interface Props {
  breadcrumbs?: Breadcrumb[]
}

const props = withDefaults(defineProps<Props>(), {
  breadcrumbs: () => []
})

const emit = defineEmits(['toggle-sidebar'])

// Auth composable
const { authUser: user, userInitials } = useAuth()

// Reactive state
const quickSearch = ref('')
const showQuickResults = ref(false)
const quickSearchResults = ref<QuickSearchResult[]>([])

// Methods
const toggleSidebar = () => {
  emit('toggle-sidebar')
}

// Removed toggleUserMenu as it's no longer needed

const onQuickSearch = useDebounceFn(async () => {
  if (quickSearch.value.length < 2) {
    quickSearchResults.value = []
    return
  }
  
  // This would be replaced with actual search API call
  quickSearchResults.value = [
    { id: '1', title: 'Product Management', type: 'Page', url: '/dashboard/products' },
    { id: '2', title: 'User Analytics', type: 'Page', url: '/dashboard/analytics' },
    { id: '3', title: 'Sample Product', type: 'Product', url: '/dashboard/products/1' }
  ].filter(result => 
    result.title.toLowerCase().includes(quickSearch.value.toLowerCase())
  )
}, 300)

const hideQuickResults = () => {
  setTimeout(() => {
    showQuickResults.value = false
  }, 200)
}

const navigateToResult = (result: QuickSearchResult) => {
  navigateTo(result.url)
  showQuickResults.value = false
  quickSearch.value = ''
}

// Close quick search on route change
const route = useRoute()
watch(() => route.path, () => {
  showQuickResults.value = false
  quickSearch.value = ''
})
</script>