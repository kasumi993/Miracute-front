<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
    <nav class="space-y-2">
      <NuxtLink
        to="/account"
        :class="[
          'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
          currentPath === '/account'
            ? 'text-gray-900 bg-gray-100 font-medium'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        ]"
      >
        <Icon name="heroicons:arrow-down-tray" class="w-5 h-5" />
        <span>My Downloads</span>
      </NuxtLink>

      <NuxtLink
        to="/account/profile"
        :class="[
          'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
          currentPath === '/account/profile'
            ? 'text-gray-900 bg-gray-100 font-medium'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        ]"
      >
        <Icon name="heroicons:user" class="w-5 h-5" />
        <span>Profile</span>
      </NuxtLink>

      <NuxtLink
        to="/account/preferences"
        :class="[
          'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
          currentPath === '/account/preferences'
            ? 'text-gray-900 bg-gray-100 font-medium'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        ]"
      >
        <Icon name="heroicons:cog-6-tooth" class="w-5 h-5" />
        <span>Preferences</span>
      </NuxtLink>

      <div class="border-t border-gray-200 pt-2 mt-2">
        <button
          @click="handleSignOut"
          class="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-700 hover:bg-red-50 hover:text-red-900 transition-colors w-full text-left"
        >
          <Icon name="heroicons:arrow-right-on-rectangle" class="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  </div>
</template>

<script setup>
const route = useRoute()
const auth = useAuth()

// Computed property for current path
const currentPath = computed(() => route.path)

// Handle sign out
const handleSignOut = async () => {
  try {
    await auth.signOut()
  } catch (error) {
    console.error('Sign out error:', error)
    useToast().error('Failed to sign out. Please try again.')
  }
}
</script>