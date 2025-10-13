<template>
  <section class="w-full pt-12 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Main Cards Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
        <NuxtLink
          to="/listings"
          class="lg:col-span-3 col-span-1 relative rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group bg-brand-brown block"
        >
          <div class="px-6 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 lg:px-12 lg:py-16 min-h-[180px] sm:h-[200px] md:h-[240px] flex flex-col justify-center">
            <h1 class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif text-white mb-2 sm:mb-3 leading-tight">
              Complete Business Bundles
              <span class="block text-white/90">& Canva Website Templates</span>
            </h1>
            <p class="text-xs sm:text-sm md:text-sm text-white/80 mb-3 sm:mb-4 leading-relaxed">
              Transform your business with our template collections. Get everything you need: website templates, email sequences, and marketing materials – all designed to work seamlessly together.
            </p>
            <button class="inline-flex items-center px-4 sm:px-5 py-2 sm:py-2.5 bg-white text-brand-brown rounded-full font-medium hover:bg-white/90 transition-colors duration-200 shadow-md hover:shadow-lg group-hover:scale-105 transform self-start text-xs sm:text-sm">
              Explore Bundles
              <svg class="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </button>
          </div>
        </NuxtLink>

        <!-- Wedding Templates Card - Hidden on mobile, visible on desktop (40%) -->
        <NuxtLink
          to="/listings?category=wedding-templates"
          class="hidden lg:block lg:col-span-2 relative rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden h-[200px] md:h-[240px]"
        >
          <!-- Background Image -->
          <img
            src="/screen1.webp"
            alt="Wedding template preview"
            class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          <!-- Bottom Overlay Only -->
          <div class="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-brand-brown to-transparent"></div>

          <!-- Content Overlay -->
          <div class="relative z-10 h-full flex flex-col justify-end px-6 md:px-8 py-5">
            <div>
              <h2 class="text-lg md:text-xl font-serif font-bold text-white mb-2 drop-shadow-md">
                Wedding Websites
              </h2>
              <p class="text-xs md:text-sm text-white/90 leading-relaxed drop-shadow-md mb-3">
                Elegant Canva templates for wedding planners and events.
              </p>
              <button class="text-white font-bold hover:text-white/80 inline-flex items-center text-xs drop-shadow-md">
                Browse now
                <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </NuxtLink>
      </div>

      <!-- Category Icons Row -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
        <CategoryIcon
          v-for="category in categories"
          :key="category.slug"
          :title="category.title"
          :description="category.description"
          :icon="category.icon"
          :iconClass="category.iconClass"
          :bgColor="category.bgColor"
          :slug="category.slug"
        />
      </div>

       <!-- Social Proof -->
      <div class="text-center px-4 sm:px-0 py-12">
        <p class="text-sm sm:text-base text-gray-500 mb-3 sm:mb-4 max-w-2xl mx-auto">Where human creativity meets personal care—every template crafted with passion, not algorithms.</p>
        <div class="flex justify-center space-x-1 mb-2">
          <Icon v-for="value in [1, 2, 3, 4, 5]" :key="value" name="heroicons:star-20-solid" class="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const categories = [
  {
    title: 'Canva Ready',
    description: 'Beautifully designed templates you can customize in Canva',
    icon: 'simple-icons:canva',
    iconClass: '!w-16 !h-16 !sm:w-20 !sm:h-20 !text-[#bdccd7]',
    bgColor: '',
    slug: 'canva-templates'
  },
  {
    title: 'Wedding',
    icon: 'heroicons:heart',
    iconClass: 'text-[#e9d1be]',
    description: 'Complete wedding flows & Wedding planner portfolios',
    bgColor: 'bg-[#e9d1be]',
    slug: 'wedding-templates'
  },
  {
    title: 'Business',
    icon: 'heroicons:briefcase',
    iconClass: 'text-[#bbcfca]',
    description: 'Professional website templates for businesses (Therapist, coaches, consultants, etc.)',
    bgColor: 'bg-[#bbcfca]',
    slug: 'business-templates'
  },
  {
    title: 'Portfolios and Showcases',
    description: 'Creative showcase & Trust-building templates for self-promotion',
    icon: 'heroicons:photo',
    bgColor: 'bg-[#d7c6c8]',
    iconClass: 'text-[#d7c6c8]',
    slug: 'portfolio-templates'
  }
]
</script>

<style scoped>
/* Custom Miracute colors - add these to your tailwind.config */
.from-beige-50 { --tw-gradient-from: #faf8f5; }
.to-beige-50 { --tw-gradient-to: #faf8f5; }
.from-beige-100 { --tw-gradient-from: #f5f1eb; }
.to-beige-100 { --tw-gradient-to: #f5f1eb; }
.to-beige-200 { --tw-gradient-to: #ebe5db; }

.from-sage-50 { --tw-gradient-from: #f4f6f4; }
.to-sage-50 { --tw-gradient-to: #f4f6f4; }
.from-sage-100 { --tw-gradient-from: #e8ede8; }
.to-sage-100 { --tw-gradient-to: #e8ede8; }
.to-sage-200 { --tw-gradient-to: #d4dfd4; }
.text-sage-600 { color: #6b8e6b; }
</style>