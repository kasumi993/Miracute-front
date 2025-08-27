<template>
  <div class="relative">
    <button 
      @click="toggleMenu"
      @mouseenter="showMenu"
      @mouseleave="hideMenuDelayed"
      class="flex items-center space-x-1 text-gray-700 hover:text-gray-900 font-medium transition-colors uppercase tracking-wide text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
    >
      <span>Shop by Categories</span>
      <Icon name="heroicons:chevron-down" class="w-4 h-4" />
    </button>

    <!-- Categories Mega Menu -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div 
        v-show="isMenuOpen" 
        @mouseenter="showMenu"
        @mouseleave="hideMenuDelayed"
        class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-screen max-w-5xl bg-white rounded-2xl shadow-2xl border border-gray-100 py-8 px-8 z-50"
      >
        <div class="grid grid-cols-4 gap-8">
          <!-- Wedding Templates -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200">
              Wedding
            </h3>
            <div class="space-y-3">
              <NuxtLink to="/categories/wedding-templates" class="flex items-center space-x-3 text-sm text-gray-600 hover:text-gray-900 transition-colors group">
                <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Icon name="heroicons:heart" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <div class="font-medium">Wedding Invitations</div>
                  <div class="text-xs text-gray-500">Beautiful templates</div>
                </div>
              </NuxtLink>
              <NuxtLink to="/categories/wedding-websites" class="block text-sm text-gray-600 hover:text-gray-900 transition-colors pl-15">
                Wedding Websites
              </NuxtLink>
              <NuxtLink to="/categories/save-the-dates" class="block text-sm text-gray-600 hover:text-gray-900 transition-colors pl-15">
                Save the Dates
              </NuxtLink>
            </div>
          </div>

          <!-- Business & Professional -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200">
              Business
            </h3>
            <div class="space-y-3">
              <NuxtLink to="/categories/business-templates" class="flex items-center space-x-3 text-sm text-gray-600 hover:text-gray-900 transition-colors group">
                <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Icon name="heroicons:briefcase" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <div class="font-medium">Business Templates</div>
                  <div class="text-xs text-gray-500">Professional designs</div>
                </div>
              </NuxtLink>
              <NuxtLink to="/categories/therapist-templates" class="block text-sm text-gray-600 hover:text-gray-900 transition-colors pl-15">
                Therapist Templates
              </NuxtLink>
              <NuxtLink to="/categories/coach-templates" class="block text-sm text-gray-600 hover:text-gray-900 transition-colors pl-15">
                Coach Templates
              </NuxtLink>
            </div>
          </div>

          <!-- Creative & Personal -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200">
              Creative
            </h3>
            <div class="space-y-3">
              <NuxtLink to="/categories/canva-templates" class="flex items-center space-x-3 text-sm text-gray-600 hover:text-gray-900 transition-colors group">
                <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Icon name="heroicons:sparkles" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <div class="font-medium">Canva Templates</div>
                  <div class="text-xs text-gray-500">Ready-to-use designs</div>
                </div>
              </NuxtLink>
              <NuxtLink to="/categories/baby-templates" class="block text-sm text-gray-600 hover:text-gray-900 transition-colors pl-15">
                Baby Templates
              </NuxtLink>
              <NuxtLink to="/categories/portfolio-templates" class="block text-sm text-gray-600 hover:text-gray-900 transition-colors pl-15">
                Portfolio Templates
              </NuxtLink>
            </div>
          </div>

          <!-- Bundles & More -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200">
              Special
            </h3>
            <div class="space-y-3">
              <NuxtLink to="/categories/bundles" class="flex items-center space-x-3 text-sm text-gray-600 hover:text-gray-900 transition-colors group">
                <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Icon name="heroicons:gift" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <div class="font-medium">Template Bundles</div>
                  <div class="text-xs text-gray-500">Save with bundles</div>
                </div>
              </NuxtLink>
              <NuxtLink to="/templates?featured=true" class="block text-sm text-gray-600 hover:text-gray-900 transition-colors pl-15">
                Featured Templates
              </NuxtLink>
              <NuxtLink to="/templates?sort=newest" class="block text-sm text-gray-600 hover:text-gray-900 transition-colors pl-15">
                New Arrivals
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Bottom CTA -->
        <div class="mt-8 pt-6 border-t border-gray-200 text-center">
          <NuxtLink to="/templates" class="inline-flex items-center space-x-2 text-brand-brown hover:text-brand-brown/80 font-medium">
            <span>Browse All Templates</span>
            <Icon name="heroicons:arrow-right" class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
// State
const isMenuOpen = ref(false)
let hideTimeout = null

// Methods
const showMenu = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
    hideTimeout = null
  }
  isMenuOpen.value = true
}

const hideMenuDelayed = () => {
  hideTimeout = setTimeout(() => {
    isMenuOpen.value = false
  }, 150)
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// Cleanup
onUnmounted(() => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
  }
})
</script>