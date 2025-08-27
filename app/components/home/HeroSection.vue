<template>
  <section class="bg-white">
    <!-- Hero Content -->
    <div class="container-custom pt-16 pb-20">
      <!-- Main Hero Text -->
      <div class="max-w-4xl mx-auto text-center mb-12">
        <h1 class="text-4xl md:text-6xl font-heading font-bold text-gray-900 mb-6">
          Beautiful Website Templates
          <span class="text-brand-brown">Made Simple</span>
        </h1>
        <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Professional, mobile-ready designs for businesses, weddings, and creatives. 
          No coding required—just download and customize.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/templates" class="btn-primary text-lg px-8 py-4">
            Browse Templates
            <Icon name="heroicons:arrow-right" class="ml-2 w-5 h-5" />
          </NuxtLink>
          <NuxtLink to="/about" class="btn-secondary text-lg px-8 py-4">
            See Examples
          </NuxtLink>
        </div>
      </div>

      <!-- Category Preview Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <!-- Wedding Category -->
        <NuxtLink to="/categories/wedding-templates" class="group">
          <div class="bg-[#e9d1be] rounded-3xl p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div class="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon name="heroicons:heart" class="w-8 h-8 text-brand-brown" />
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Wedding</h3>
            <span class="text-brand-brown font-medium text-sm group-hover:underline">Explore →</span>
          </div>
        </NuxtLink>

        <!-- Business Category -->
        <NuxtLink to="/categories/business-templates" class="group">
          <div class="bg-[#cdd3d7] rounded-3xl p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div class="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon name="heroicons:briefcase" class="w-8 h-8 text-brand-brown" />
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Business</h3>
            <span class="text-brand-brown font-medium text-sm group-hover:underline">Explore →</span>
          </div>
        </NuxtLink>

        <!-- Wellness Category -->
        <NuxtLink to="/categories/therapist-templates" class="group">
          <div class="bg-[#d7c6c8] rounded-3xl p-8 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div class="w-16 h-16 bg-white rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon name="heroicons:hand-raised" class="w-8 h-8 text-brand-brown" />
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">Wellness</h3>
            <span class="text-brand-brown font-medium text-sm group-hover:underline">Explore →</span>
          </div>
        </NuxtLink>

        <!-- Portfolio Category -->
        <NuxtLink to="/categories/portfolio-templates" class="group">
          <div class="bg-[#cdd3d7] rounded-[100%] p-24 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <h3 class="text-lg font-bold text-gray-900 mb-2">Portfolio</h3>
            <span class="text-brand-brown font-medium text-sm group-hover:underline">Explore →</span>
          </div>
        </NuxtLink>
      </div>

      <!-- Social Proof -->
      <div class="text-center">
        <p class="text-gray-500 mb-4">Self owned business that values quality and customer satisfaction.</p>
        <div class="flex justify-center space-x-1 mb-2">
          <Icon name="heroicons:star-20-solid" class="w-5 h-5 text-yellow-400" />
          <Icon name="heroicons:star-20-solid" class="w-5 h-5 text-yellow-400" />
          <Icon name="heroicons:star-20-solid" class="w-5 h-5 text-yellow-400" />
          <Icon name="heroicons:star-20-solid" class="w-5 h-5 text-yellow-400" />
          <Icon name="heroicons:star-20-solid" class="w-5 h-5 text-yellow-400" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const searchQuery = ref('')

// Popular search terms for templates
const popularSearches = ref([
  'wedding websites',
  'business templates',
  'therapy sites',
  'portfolio designs',
  'canva templates'
])

// Top categories for navigation bar
const topCategories = ref([
  { name: 'Wedding', slug: 'wedding-templates', icon: 'heroicons:heart' },
  { name: 'Business', slug: 'business-templates', icon: 'heroicons:briefcase' },
  { name: 'Wellness', slug: 'therapist-templates', icon: 'heroicons:hand-raised' },
  { name: 'Portfolio', slug: 'portfolio-templates', icon: 'heroicons:photo' },
  { name: 'Canva', slug: 'canva-designs', icon: 'heroicons:paint-brush' },
  { name: 'New', slug: 'new-templates', icon: 'heroicons:sparkles' }
])

const performSearch = () => {
  if (searchQuery.value.trim()) {
    navigateTo(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}
</script>