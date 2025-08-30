<template>
  <div class="relative">
    <NuxtLink 
      to="/templates"
      @mouseenter="showMenu"
      @mouseleave="hideMenuDelayed"
      class="flex items-center space-x-1 text-gray-700 hover:text-gray-900 font-medium transition-colors uppercase tracking-wide text-sm px-4 py-2 rounded-lg hover:bg-gray-50"
    >
      <span>Explore Templates</span>
      <Icon name="heroicons:chevron-down" class="w-4 h-4" />
    </NuxtLink>

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
        class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-screen max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 py-8 px-8 z-50"
      >
        <div class="grid grid-cols-3 gap-8">
          <!-- Featured Collection -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-brand-brown/20">
              🌸 Available Now
            </h3>
            <div class="space-y-4">
              <NuxtLink to="/templates?category=wedding-templates" class="flex items-center space-x-3 text-sm text-gray-600 hover:text-gray-900 transition-colors group p-3 rounded-xl hover:bg-brand-pink/10">
                <div class="w-12 h-12 rounded-lg bg-brand-pink flex items-center justify-center">
                  <Icon name="heroicons:heart" class="w-6 h-6 text-brand-brown" />
                </div>
                <div>
                  <div class="font-semibold text-gray-900">Wedding Collection</div>
                  <div class="text-xs text-gray-500">Wedding websites or wedding planner templates</div>
                  <div class="text-xs text-brand-brown font-medium">Ready to download</div>
                </div>
              </NuxtLink>
            </div>
          </div>

          <!-- Coming Soon Collection -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-brand-brown/20">
              🎨 In Development
            </h3>
            <div class="space-y-4">
              <div class="flex items-center space-x-3 text-sm text-gray-500 p-3 rounded-xl bg-gray-50">
                <div class="w-12 h-12 rounded-lg bg-brand-sage flex items-center justify-center">
                  <Icon name="heroicons:hand-raised" class="w-6 h-6 text-brand-brown" />
                </div>
                <div>
                  <div class="font-semibold text-gray-700">Wellness & Therapy</div>
                  <div class="text-xs text-gray-500">Calming, professional designs</div>
                  <div class="text-xs text-brand-brown font-medium">Coming this month</div>
                </div>
              </div>
              <div class="flex items-center space-x-3 text-sm text-gray-500 p-3 rounded-xl bg-gray-50">
                <div class="w-12 h-12 rounded-lg bg-brand-warm flex items-center justify-center">
                  <Icon name="heroicons:megaphone" class="w-6 h-6 text-brand-brown" />
                </div>
                <div>
                  <div class="font-semibold text-gray-700">Life Coach Templates</div>
                  <div class="text-xs text-gray-500">Inspiring, motivational designs</div>
                  <div class="text-xs text-brand-brown font-medium">Coming next month</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Why Choose Us -->
          <div class="space-y-4">
            <h3 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-brand-brown/20">
              ✨ The Miracute Difference
            </h3>
            <div class="space-y-4 text-xs">
              <div class="flex items-start space-x-3 p-2 rounded-lg">
                <div class="w-2 h-2 bg-brand-brown rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <div class="font-medium text-gray-900">Handcrafted Quality</div>
                  <div class="text-gray-600">No AI, no mass production—just personal attention to every detail</div>
                </div>
              </div>
              <div class="flex items-start space-x-3 p-2 rounded-lg">
                <div class="w-2 h-2 bg-brand-brown rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <div class="font-medium text-gray-900">Works with Canva Free</div>
                  <div class="text-gray-600">All templates optimized for the free version—no premium needed</div>
                </div>
              </div>
              <div class="flex items-start space-x-3 p-2 rounded-lg">
                <div class="w-2 h-2 bg-brand-brown rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <div class="font-medium text-gray-900">Personal Support</div>
                  <div class="text-gray-600">Direct access to the designer—real help when you need it</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Bottom CTA -->
        <div class="mt-8 pt-6 border-t border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NuxtLink to="/templates?category=wedding-templates" class="flex items-center justify-center space-x-2 bg-brand-brown text-white px-4 py-3 rounded-xl font-medium hover:bg-brand-brown/90 transition-colors">
              <Icon name="heroicons:heart" class="w-4 h-4" />
              <span>View Wedding Templates</span>
            </NuxtLink>
            <NuxtLink to="/contact" class="flex items-center justify-center space-x-2 border-2 border-brand-brown text-brand-brown px-4 py-3 rounded-xl font-medium hover:bg-brand-brown hover:text-white transition-colors">
              <Icon name="heroicons:chat-bubble-left-right" class="w-4 h-4" />
              <span>Get Personal Help</span>
            </NuxtLink>
          </div>
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


// Cleanup
onUnmounted(() => {
  if (hideTimeout) {
    clearTimeout(hideTimeout)
  }
})
</script>