<template>
  <section class="bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
    <!-- Striking Background Design -->
    <div class="absolute inset-0 pointer-events-none">
      <!-- Large geometric shapes -->
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand-sage/20 to-brand-pink/15 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-brand-warm/25 to-brand-sage/20 rounded-full blur-3xl"></div>
      <div class="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-bl from-brand-pink/15 to-transparent rounded-full blur-2xl"></div>
      
      <!-- Dynamic wave pattern -->
      <div class="absolute top-0 left-0 w-full h-full">
        <svg class="w-full h-full" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
          <!-- Flowing lines -->
          <path d="M0,400 Q300,200 600,400 T1200,300" stroke="#bbcfca" stroke-width="2" fill="none" opacity="0.3"/>
          <path d="M0,500 Q300,300 600,500 T1200,400" stroke="#d7c6c8" stroke-width="1.5" fill="none" opacity="0.4"/>
          <path d="M0,300 Q300,100 600,300 T1200,200" stroke="#e9d1be" stroke-width="3" fill="none" opacity="0.25"/>
          
          <!-- Curved shapes -->
          <path d="M200,0 Q400,200 200,400 Q0,200 200,0 Z" fill="#bbcfca" opacity="0.08"/>
          <path d="M1000,400 Q800,600 1000,800 Q1200,600 1000,400 Z" fill="#d7c6c8" opacity="0.1"/>
        </svg>
      </div>
      
      <!-- Card-style decorative elements to match featured section -->
      <div class="absolute top-20 right-8 bg-white/40 backdrop-blur-sm rounded-2xl w-32 h-20 shadow-sm transform rotate-12 opacity-60"></div>
      <div class="absolute bottom-32 left-8 bg-white/30 backdrop-blur-sm rounded-2xl w-24 h-16 shadow-sm transform -rotate-6 opacity-50"></div>
      <div class="absolute top-1/2 left-1/3 bg-white/25 backdrop-blur-sm rounded-xl w-20 h-12 shadow-sm transform rotate-3 opacity-40"></div>
      
      <!-- Floating animated elements -->
      <div class="absolute top-40 right-32 w-6 h-6 bg-brand-pink/30 rounded-lg animate-float transform rotate-45"></div>
      <div class="absolute bottom-48 left-24 w-4 h-4 bg-brand-sage/40 rounded-full animate-float" style="animation-delay: 2s;"></div>
      <div class="absolute top-64 left-1/2 w-8 h-8 bg-brand-warm/25 rounded-xl animate-float transform rotate-12" style="animation-delay: 4s;"></div>
      
      <!-- Grid overlay pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="h-full w-full" style="background-image: linear-gradient(#955a3f 1px, transparent 1px), linear-gradient(90deg, #955a3f 1px, transparent 1px); background-size: 80px 80px;"></div>
      </div>
    </div>

    <!-- Hero Content -->
    <div class="container-custom pt-16 pb-20 relative">
      <!-- Main Hero Text -->
      <div class="max-w-4xl mx-auto text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-6">
          Beautiful Website and Email Templates
          <span class="text-brand-brown">That actually work together</span>
        </h1>
        <p class="text-md md:text-lg text-gray-600 mb-8 max-w-4xl mx-auto">
          Complete template bundles for businesses, weddings, and creatives, crafted with genuine care, not AI algorithms. Every template works with Canva Free, so you save money for what matters most. Download, customize, and launch in minutes.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink to="/templates" class="btn-primary text-lg px-8 py-4">
            Find Your Perfect Bundle
            <Icon name="heroicons:arrow-right" class="ml-2 w-5 h-5" />
          </NuxtLink>
          <NuxtLink to="/about" class="btn-secondary text-lg px-8 py-4">
            See What's Possible
          </NuxtLink>
        </div>
      </div>

      <!-- Category Preview Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">

      <!-- Canva Category -->
        <NuxtLink to="/categories/canva-templates" class="group block">
          <div class="text-center">
            <div class="border-3 border-brand-brown/20 rounded-full w-20 h-20 mx-auto mb-3 flex items-center justify-center cursor-pointer hover:border-brand-brown hover:shadow-xl hover:bg-brand-brown/5 transition-all duration-200 group-hover:scale-110 active:scale-95">
              <Icon name="simple-icons:canva" class="w-20 h-20 text-[#bdccd7]" />
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
            <p class="text-xs text-gray-500 mt-1">Complete wedding flows & Wedding planner portfolios</p>
          </div>
        </NuxtLink>

        <!-- Business Category -->
        <NuxtLink to="/categories/business-templates" class="group block">
          <div class="text-center">
            <div class="bg-[#bbcfca] border-3 border-brand-brown/20 rounded-full w-20 h-20 mx-auto mb-3 flex items-center justify-center cursor-pointer hover:border-brand-brown hover:shadow-xl hover:bg-brand-brown/5 transition-all duration-200 group-hover:scale-110 active:scale-95">
              <Icon name="heroicons:briefcase" class="w-6 h-6 text-brand-brown" />
            </div>
            <h3 class="text-sm font-medium text-gray-900 group-hover:text-brand-brown transition-colors">Business</h3>
            <p class="text-xs text-gray-500 mt-1">Professional website templates for businesses (Therapist, coaches, consultants, etc.)</p>
          </div>
        </NuxtLink>

        <!-- Portfolio Category -->
        <NuxtLink to="/categories/portfolio-templates" class="group block">
          <div class="text-center">
            <div class="bg-[#d7c6c8] border-3 border-brand-brown/20 rounded-full w-20 h-20 mx-auto mb-3 flex items-center justify-center cursor-pointer hover:border-brand-brown hover:shadow-xl hover:bg-brand-brown/5 transition-all duration-200 group-hover:scale-110 active:scale-95">
              <Icon name="heroicons:photo" class="w-6 h-6 text-brand-brown" />
            </div>
            <h3 class="text-sm font-medium text-gray-900 group-hover:text-brand-brown transition-colors">Portfolios and Showcases</h3>
            <p class="text-xs text-gray-500 mt-1">Creative showcase & Trust-building templates for self-promotion</p>
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