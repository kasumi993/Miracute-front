<template>
  <section class="py-16 bg-white">
    <div class="container-custom">
      <!-- Compact Header -->
      <div class="flex items-center justify-between mb-10">
        <div>
          <h2 class="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-2">
            Popular Templates
          </h2>
          <p class="text-gray-600">Complete bundles that work together</p>
        </div>
        <NuxtLink to="/templates" 
                  class="hidden md:flex items-center text-brand-brown hover:text-brand-brown/80 font-medium group">
          View All
          <Icon name="heroicons:arrow-right" class="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </NuxtLink>
      </div>

      <!-- Horizontal Scrollable Template Cards -->
      <div class="overflow-x-auto pb-4">
        <div class="flex space-x-6 min-w-max">
          <div v-for="product in featuredProducts" :key="product.id" class="group flex-none w-80">
            <NuxtLink :to="`/templates/${product.slug}`" class="block">
              <div class="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-brand-brown/20 hover:shadow-lg transition-all duration-300">
                <!-- Template Preview - Compact -->
                <div class="relative overflow-hidden bg-gray-100 h-48">
                  <img 
                    :src="product.previewImage" 
                    :alt="product.name"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <!-- Quick view overlay -->
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div class="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium text-sm">
                      Quick View
                    </div>
                  </div>
                  <!-- Category + Price badge -->
                  <div class="absolute top-3 left-3 flex space-x-2">
                    <span class="bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                      {{ product.category }}
                    </span>
                    <span class="bg-brand-brown text-white px-2 py-1 rounded-full text-xs font-bold">
                      ${{ product.price }}
                    </span>
                  </div>
                </div>
                
                <!-- Compact Product Info -->
                <div class="p-5">
                  <div class="flex items-start justify-between mb-3">
                    <h3 class="font-heading font-bold text-lg text-gray-900 group-hover:text-brand-brown transition-colors line-clamp-1">
                      {{ product.name }}
                    </h3>
                    <div class="flex items-center space-x-1 ml-2">
                      <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                      <span class="text-sm font-medium text-gray-700">{{ product.rating }}</span>
                    </div>
                  </div>
                  <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                    {{ product.description }}
                  </p>
                  <!-- Features Icons -->
                  <div class="flex items-center space-x-4 text-xs text-gray-500">
                    <div class="flex items-center space-x-1">
                      <Icon name="heroicons:device-phone-mobile" class="w-3 h-3" />
                      <span>Mobile</span>
                    </div>
                    <div class="flex items-center space-x-1">
                      <Icon name="heroicons:envelope" class="w-3 h-3" />
                      <span>Emails</span>
                    </div>
                    <div class="flex items-center space-x-1">
                      <Icon name="simple-icons:canva" class="w-3 h-3" />
                      <span>Canva</span>
                    </div>
                    <span class="text-gray-400">+{{ product.reviews }} reviews</span>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Mobile CTA -->
      <div class="text-center mt-8 md:hidden">
        <NuxtLink to="/templates" 
                  class="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors">
          View All Templates
          <Icon name="heroicons:arrow-right" class="ml-2 w-4 h-4" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
const featuredProducts = ref([
  {
    id: 1,
    name: 'Complete Wedding Bundle',
    slug: 'elegant-wedding-template',
    category: 'Wedding',
    description: 'Everything you need for your special day: website, email invitations, RSVP system, and thank you cards. Designed to work together seamlessly.',
    previewImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=500&fit=crop&crop=center',
    price: 59,
    reviews: 127,
    rating: 5
  },
  {
    id: 2,
    name: 'Professional Coach Template',
    slug: 'modern-business-template',
    category: 'Business',
    description: 'Complete business system for coaches and consultants. Website, email sequences, and client onboarding materials.',
    previewImage: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=500&fit=crop&crop=center',
    price: 49,
    reviews: 89,
    rating: 5
  },
  {
    id: 3,
    name: 'Wellness Practice Bundle',
    slug: 'therapy-practice-template',
    category: 'Wellness',
    description: 'Calming design system for therapists and wellness professionals. Includes intake forms and appointment scheduling.',
    previewImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop&crop=center',
    price: 45,
    reviews: 64,
    rating: 5
  },
  {
    id: 4,
    name: 'Creative Portfolio System',
    slug: 'creative-portfolio-template',
    category: 'Portfolio',
    description: 'Showcase your work beautifully with this complete portfolio system. Website, client presentation templates, and proposal forms.',
    previewImage: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=500&fit=crop&crop=center',
    price: 52,
    reviews: 156,
    rating: 5
  }
])
</script>