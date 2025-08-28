<template>
  <section class="bg-white">
    <!-- Hero Content -->
    <div class="container-custom pt-16 pb-20">
      <!-- Main Hero Text -->
      <div class="max-w-4xl mx-auto text-center mb-12">
        <h1 class="text-3xl md:text-5xl font-heading font-bold text-gray-900 mb-6">
          Beautiful Website and Email Templates
          <span class="text-brand-brown">That actually work together</span>
        </h1>
        <p class="text-lg text-gray-600 mb-8 max-w-4xl mx-auto">
          Complete template bundles for businesses, weddings, and creatives, crafted with genuine care, not AI algorithms. Every template works with Canva Free, so you save money for what matters most. Download, customize, and launch in minutes.
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
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-12">

      <!-- Canva Category -->
        <NuxtLink to="/categories/canva-templates" class="group block">
          <div class="text-center">
            <div class="border-3 border-brand-brown/20 rounded-full w-20 h-20 mx-auto mb-3 flex items-center justify-center cursor-pointer hover:border-brand-brown hover:shadow-xl hover:bg-brand-brown/5 transition-all duration-200 group-hover:scale-110 active:scale-95">
              <Icon name="simple-icons:canva" class="w-20 h-20 text-brand-brown" />
            </div>
            <h3 class="text-sm font-medium text-gray-900 group-hover:text-brand-brown transition-colors">Canva</h3>
            <p class="text-xs text-gray-500 mt-1">Ready-to-edit</p>
          </div>
        </NuxtLink>

        <!-- Wedding Category -->
        <NuxtLink to="/categories/wedding-templates" class="group block">
          <div class="text-center">
            <div class="bg-[#e9d1be] border-3 border-brand-brown/20 rounded-full w-20 h-20 mx-auto mb-3 flex items-center justify-center cursor-pointer hover:border-brand-brown hover:shadow-xl hover:bg-brand-brown/5 transition-all duration-200 group-hover:scale-110 active:scale-95">
              <Icon name="heroicons:heart" class="w-6 h-6 text-brand-brown" />
            </div>
            <h3 class="text-sm font-medium text-gray-900 group-hover:text-brand-brown transition-colors">Wedding</h3>
            <p class="text-xs text-gray-500 mt-1">Wedding RSVP websites & Wedding planner portfolios</p>
          </div>
        </NuxtLink>

        <!-- Business Category -->
        <NuxtLink to="/categories/business-templates" class="group block">
          <div class="text-center">
            <div class="bg-[#cdd3d7] border-3 border-brand-brown/20 rounded-full w-20 h-20 mx-auto mb-3 flex items-center justify-center cursor-pointer hover:border-brand-brown hover:shadow-xl hover:bg-brand-brown/5 transition-all duration-200 group-hover:scale-110 active:scale-95">
              <Icon name="heroicons:briefcase" class="w-6 h-6 text-brand-brown" />
            </div>
            <h3 class="text-sm font-medium text-gray-900 group-hover:text-brand-brown transition-colors">Business</h3>
            <p class="text-xs text-gray-500 mt-1">Professional website templates for businesses</p>
          </div>
        </NuxtLink>

        <!-- Wellness Category -->
        <NuxtLink to="/categories/therapist-templates" class="group block">
          <div class="text-center">
            <div class="bg-[#d7c6c8] border-3 border-brand-brown/20 rounded-full w-20 h-20 mx-auto mb-3 flex items-center justify-center cursor-pointer hover:border-brand-brown hover:shadow-xl hover:bg-brand-brown/5 transition-all duration-200 group-hover:scale-110 active:scale-95">
              <Icon name="heroicons:hand-raised" class="w-6 h-6 text-brand-brown" />
            </div>
            <h3 class="text-sm font-medium text-gray-900 group-hover:text-brand-brown transition-colors">Wellness</h3>
            <p class="text-xs text-gray-500 mt-1">Calming designs</p>
          </div>
        </NuxtLink>

        <!-- Portfolio Category -->
        <NuxtLink to="/categories/portfolio-templates" class="group block">
          <div class="text-center">
            <div class="bg-[#bbcfca] border-3 border-brand-brown/20 rounded-full w-20 h-20 mx-auto mb-3 flex items-center justify-center cursor-pointer hover:border-brand-brown hover:shadow-xl hover:bg-brand-brown/5 transition-all duration-200 group-hover:scale-110 active:scale-95">
              <Icon name="heroicons:photo" class="w-6 h-6 text-brand-brown" />
            </div>
            <h3 class="text-sm font-medium text-gray-900 group-hover:text-brand-brown transition-colors">Portfolio</h3>
            <p class="text-xs text-gray-500 mt-1">Creative showcase</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Social Proof -->
      <div class="text-center">
        <p class="text-gray-500 mb-4">Where human creativity meets personal care—every template crafted with passion, not algorithms.</p>
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