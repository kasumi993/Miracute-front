<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Header -->
    <section class="bg-white border-b border-gray-200">
      <div class="container-custom py-8">
        <div>
          <h1 class="text-3xl font-heading font-medium text-gray-900">
            Profile Settings
          </h1>
          <p class="text-gray-600 mt-1">Update your personal information and profile details</p>
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
          <!-- Profile Information -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div class="flex items-center space-x-6 mb-8">
              <div class="relative">
                <div class="w-20 h-20 bg-brand-pink rounded-full flex items-center justify-center text-2xl font-medium text-gray-700">
                  {{ getUserInitials() }}
                </div>
                <!-- Note: Avatar upload could be added here later -->
              </div>
              <div>
                <h2 class="text-xl font-heading font-medium text-gray-900">Profile Picture</h2>
                <p class="text-sm text-gray-600">This is generated from your name initials</p>
              </div>
            </div>

            <form @submit.prevent="saveProfile" class="space-y-6">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <!-- First Name -->
                <div>
                  <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <UIInput
                    id="firstName"
                    v-model="profileForm.first_name"
                    type="text"
                    placeholder="Enter your first name"
                    :disabled="isSaving"
                  />
                </div>

                <!-- Last Name -->
                <div>
                  <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <UIInput
                    id="lastName"
                    v-model="profileForm.last_name"
                    type="text"
                    placeholder="Enter your last name"
                    :disabled="isSaving"
                  />
                </div>
              </div>

              <!-- Email (Read-only) -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <UIInput
                  id="email"
                  :model-value="user?.email || 'Not available'"
                  type="email"
                  disabled
                  readonly
                />
                <p class="text-xs text-gray-500 mt-1">
                  Your email address cannot be changed. This is your sign-in email.
                </p>
              </div>

              <!-- Country -->
              <div>
                <label for="country" class="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <UISelect
                  id="country"
                  v-model="profileForm.country"
                  :options="countryOptions"
                  placeholder="Select your country"
                  :disabled="isSaving || isLoadingCountries"
                />
              </div>

              <!-- Save Button -->
              <div class="pt-4 border-t border-gray-200">
                <div class="flex items-center justify-between">
                  <p class="text-sm text-gray-600">
                    <span v-if="lastSaved" class="text-green-600">
                      Last saved {{ formatRelativeTime(lastSaved) }}
                    </span>
                  </p>
                  <div class="flex space-x-3">
                    <button
                      type="button"
                      @click="resetForm"
                      :disabled="isSaving || !hasChanges"
                      class="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reset
                    </button>
                    <button
                      type="submit"
                      :disabled="isSaving || !hasChanges"
                      class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span v-if="!isSaving">Save Changes</span>
                      <span v-else class="flex items-center space-x-2">
                        <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
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
  title: 'Profile Settings | Miracute Account',
  description: 'Update your profile information and account settings',
  robots: 'noindex, nofollow'
})

// Composables
const user = useSupabaseUser()
const toast = useToast()

// Services
import { authService } from '~/services/AuthService'

// State
const userProfile = ref(null)
const isSaving = ref(false)
const isLoading = ref(true)
const isLoadingCountries = ref(true)
const lastSaved = ref(null)

const profileForm = reactive({
  first_name: '',
  last_name: '',
  country: ''
})

const originalForm = ref({})

// Country options loaded from backend
const countryOptions = ref([
  { value: '', label: 'Loading countries...' }
])

// Computed
const hasChanges = computed(() => {
  const hasFormChanges = JSON.stringify(profileForm) !== JSON.stringify(originalForm.value)
  const hasRequiredFields = profileForm.first_name?.trim() && profileForm.last_name?.trim()
  return hasFormChanges && hasRequiredFields
})

// Methods
const loadCountries = async () => {
  try {
    isLoadingCountries.value = true
    const response = await $fetch('/api/countries')

    if (response.success && response.data) {
      countryOptions.value = response.data
    } else {
      console.warn('Failed to load countries:', response.error || response.message)
      // Keep the fallback option if API fails
      countryOptions.value = [
        { value: '', label: 'Select a country' },
        { value: 'US', label: 'United States' },
        { value: 'CA', label: 'Canada' },
        { value: 'GB', label: 'United Kingdom' }
      ]
    }
  } catch (error) {
    console.error('Failed to load countries:', error)
    // Fallback countries on error
    countryOptions.value = [
      { value: '', label: 'Select a country' },
      { value: 'US', label: 'United States' },
      { value: 'CA', label: 'Canada' },
      { value: 'GB', label: 'United Kingdom' }
    ]
    toast.error('Failed to load countries list')
  } finally {
    isLoadingCountries.value = false
  }
}

const loadUserProfile = async () => {
  try {
    isLoading.value = true
    const response = await authService.getCurrentProfile()

    if (response.success && response.data?.user) {
      userProfile.value = response.data.user

      // Populate form with existing data
      profileForm.first_name = userProfile.value.first_name || ''
      profileForm.last_name = userProfile.value.last_name || ''
      profileForm.country = userProfile.value.country || ''

      // Store original form state
      originalForm.value = { ...profileForm }
    }
  } catch (error) {
    console.error('Failed to load user profile:', error)
    toast.error('Failed to load profile data')
  } finally {
    isLoading.value = false
  }
}

const saveProfile = async () => {
  if (!hasChanges.value) return

  try {
    isSaving.value = true
    console.log('Saving profile with data:', {
      first_name: profileForm.first_name || null,
      last_name: profileForm.last_name || null,
      country: profileForm.country || null
    })

    const response = await authService.updateProfile({
      first_name: profileForm.first_name || null,
      last_name: profileForm.last_name || null,
      country: profileForm.country || null
    })

    console.log('Profile save response:', response)

    if (response.success && response.data?.user) {
      userProfile.value = response.data.user
      originalForm.value = { ...profileForm }
      lastSaved.value = new Date()
      toast.success('Profile updated successfully!')
    } else {
      throw new Error(response.error || 'Failed to update profile')
    }
  } catch (error) {
    console.error('Save profile error:', error)
    toast.error(error.message || 'Failed to save profile. Please try again.')
  } finally {
    isSaving.value = false
  }
}

const resetForm = () => {
  Object.assign(profileForm, originalForm.value)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatRelativeTime = (date) => {
  if (!date) return ''
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}

const getUserInitials = () => {
  const firstName = profileForm.first_name || user.value?.user_metadata?.first_name
  const lastName = profileForm.last_name || user.value?.user_metadata?.last_name

  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (firstName) {
    return firstName.charAt(0).toUpperCase()
  }

  return user.value?.email?.charAt(0).toUpperCase() || 'U'
}

// Initialize
onMounted(async () => {
  // Load countries and user profile in parallel
  await Promise.all([
    loadCountries(),
    loadUserProfile()
  ])
})
</script>