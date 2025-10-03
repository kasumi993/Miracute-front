<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Header -->
    <section class="bg-white border-b border-gray-200">
      <div class="container-custom py-8">
        <div>
          <h1 class="text-3xl font-heading font-medium text-gray-900">
            Preferences
          </h1>
          <p class="text-gray-600 mt-1">Manage your newsletter and notification settings</p>
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
        <div class="lg:col-span-2 space-y-8">
          <!-- Email Preferences -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 class="text-xl font-heading font-medium text-gray-900 mb-6">Email Preferences</h2>
            
            <form @submit.prevent="savePreferences" class="space-y-6">
              <!-- Newsletter -->
              <div class="flex items-start space-x-4">
                <div class="flex items-center h-5">
                  <input
                    id="newsletter"
                    v-model="preferences.newsletter"
                    type="checkbox"
                    class="h-4 w-4 text-brand-sage focus:ring-brand-sage border-gray-300 rounded"
                  >
                </div>
                <div class="flex-1">
                  <label for="newsletter" class="text-sm font-medium text-gray-900">Newsletter Updates</label>
                  <p class="text-sm text-gray-600">Get notified about new template releases, design tips, and exclusive offers.</p>
                </div>
              </div>

              <!-- New Releases -->
              <div class="flex items-start space-x-4">
                <div class="flex items-center h-5">
                  <input
                    id="newReleases"
                    v-model="preferences.newReleases"
                    type="checkbox"
                    class="h-4 w-4 text-brand-sage focus:ring-brand-sage border-gray-300 rounded"
                  >
                </div>
                <div class="flex-1">
                  <label for="newReleases" class="text-sm font-medium text-gray-900">New Template Releases</label>
                  <p class="text-sm text-gray-600">Be the first to know when we launch new templates in your favorite categories.</p>
                </div>
              </div>

              <!-- Special Offers -->
              <div class="flex items-start space-x-4">
                <div class="flex items-center h-5">
                  <input
                    id="specialOffers"
                    v-model="preferences.specialOffers"
                    type="checkbox"
                    class="h-4 w-4 text-brand-sage focus:ring-brand-sage border-gray-300 rounded"
                  >
                </div>
                <div class="flex-1">
                  <label for="specialOffers" class="text-sm font-medium text-gray-900">Special Offers & Discounts</label>
                  <p class="text-sm text-gray-600">Receive exclusive discounts, bundle deals, and limited-time offers.</p>
                </div>
              </div>

              <!-- Order Updates -->
              <div class="flex items-start space-x-4">
                <div class="flex items-center h-5">
                  <input
                    id="orderUpdates"
                    v-model="preferences.orderUpdates"
                    type="checkbox"
                    class="h-4 w-4 text-brand-sage focus:ring-brand-sage border-gray-300 rounded"
                  >
                </div>
                <div class="flex-1">
                  <label for="orderUpdates" class="text-sm font-medium text-gray-900">Order Updates</label>
                  <p class="text-sm text-gray-600">Important notifications about your purchases and download links. (Recommended)</p>
                </div>
              </div>

              <!-- Save Button -->
              <div class="pt-4">
                <button
                  type="submit"
                  :disabled="isSaving"
                  class="btn-primary disabled:opacity-50"
                >
                  <span v-if="!isSaving">Save Preferences</span>
                  <span v-else class="flex items-center space-x-2">
                    <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </span>
                </button>
              </div>
            </form>
          </div>

          <!-- Account Info -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 class="text-xl font-heading font-medium text-gray-900 mb-6">Account Information</h2>
            
            <div class="space-y-4">
              <div>
                <label class="text-sm font-medium text-gray-700">Email Address</label>
                <p class="text-sm text-gray-900 mt-1">{{ auth.user.value?.email }}</p>
                <p class="text-xs text-gray-500 mt-1">This is your sign-in email and where we'll send your downloads.</p>
              </div>

              <div>
                <label class="text-sm font-medium text-gray-700">Member Since</label>
                <p class="text-sm text-gray-900 mt-1">{{ formatDate(auth.user.value?.created_at) }}</p>
              </div>

              <div>
                <label class="text-sm font-medium text-gray-700">Authentication Method</label>
                <p class="text-sm text-gray-900 mt-1">
                  {{ auth.user.value?.app_metadata?.provider === 'google' ? 'Google Account' : 'Magic Link' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Account Actions
          <div class="bg-white rounded-2xl shadow-sm border border-red-100 border-2 p-8">
            <h2 class="text-xl font-heading font-medium text-red-900 mb-6">Account Actions</h2>
            
            <div class="space-y-4">
              <div>
                <h3 class="text-sm font-medium text-gray-900 mb-2">Delete Account</h3>
                <p class="text-sm text-gray-600 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                  Your purchased templates will no longer be accessible.
                </p>
                <button
                  @click="confirmDeleteAccount"
                  class="btn-secondary border-red-300 text-red-700 hover:bg-red-50"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div> -->
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
  title: 'Preferences | Miracute Account',
  description: 'Manage your newsletter preferences and account settings',
  robots: 'noindex, nofollow'
})

// Composables
const auth = useAuth()

// State
const preferences = reactive({
  newsletter: true,
  newReleases: true,
  specialOffers: false,
  orderUpdates: true
})

const isSaving = ref(false)

// Methods
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const savePreferences = async () => {
  isSaving.value = true

  try {
    // Simulate API call to save preferences
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Here you would call your API to save preferences
    // await $fetch('/api/account/preferences', {
    //   method: 'PUT',
    //   body: preferences
    // })

    useToast().success('Preferences saved successfully!')
    
  } catch (error) {
    console.error('Save preferences error:', error)
    useToast().error('Failed to save preferences. Please try again.')
  } finally {
    isSaving.value = false
  }
}

// const confirmDeleteAccount = () => {
//   if (confirm('Are you sure you want to delete your account? This action cannot be undone and you will lose access to all your purchased templates.')) {
//     deleteAccount()
//   }
// }

// const deleteAccount = async () => {
//   try {
//     // Here you would call your API to delete the account
//     // await $fetch('/api/account/delete', { method: 'DELETE' })
    
//     useToast().error('Account deletion is not yet implemented. Please contact support.')
//   } catch (error) {
//     console.error('Delete account error:', error)
//     useToast().error('Failed to delete account. Please contact support.')
//   }
// }

// Load user preferences on mount
onMounted(async () => {
  try {
    // Load preferences from API
    // const userPrefs = await $fetch('/api/account/preferences')
    // Object.assign(preferences, userPrefs)
  } catch (error) {
    console.error('Load preferences error:', error)
  }
})
</script>