<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Header -->
    <section class="bg-white border-b border-gray-200">
      <div class="container-custom py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-heading font-medium text-gray-900">
              Your Downloads
            </h1>
            <p class="text-gray-600 mt-1">Access all your purchased templates and manage your preferences</p>
          </div>
          
          <div class="hidden sm:flex items-center space-x-4">
            <div class="text-right">
              <p class="text-sm text-gray-500">Member since</p>
              <p class="font-medium">
                {{ formatDate(user?.created_at) }}
              </p>
            </div>
            <div class="w-12 h-12 bg-brand-pink rounded-full flex items-center justify-center text-lg font-medium text-gray-700">
              {{ getUserInitials() }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="container-custom py-12">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1">
          <AccountSidebar />
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-2">
          <!-- User Downloads -->
          <AccountUserDownloads
            :user-downloads="userDownloads"
            @refresh="loadAccountData"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Middleware
definePageMeta({
  middleware: 'auth'
})

// SEO
useSeoMeta({
  title: 'My Account | Miracute',
  description: 'Manage your Miracute account, view your orders and downloads.',
  robots: 'noindex, nofollow'
})

// Composables
const user = useSupabaseUser()

// Services
import { AccountService } from '@/services'

// State
const userDownloads = ref([])
const isLoading = ref(true)

// Methods
const loadAccountData = async () => {
  try {
    console.log('Loading account data...')
    // Load ALL user downloads
    const downloadsResult = await AccountService.getUserDownloads(1, 100) // Get first 100 downloads
    console.log('Downloads result:', downloadsResult)

    // Handle downloads
    if (downloadsResult.success) {
      userDownloads.value = downloadsResult.data || []
      console.log('Loaded downloads:', userDownloads.value.length)
    } else {
      console.warn('Failed to load downloads:', downloadsResult.error)
    }

  } catch (error) {
    console.error('Failed to load account data:', error)
  } finally {
    isLoading.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}


const getUserInitials = () => {
  if (!user.value?.user_metadata?.full_name) {
    return user.value?.email?.charAt(0).toUpperCase() || 'U'
  }
  const names = user.value.user_metadata.full_name.split(' ')
  return names.length > 1
    ? `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
    : names[0].charAt(0).toUpperCase()
}


// Initialize
onMounted(async () => {
  await loadAccountData()
})
</script>