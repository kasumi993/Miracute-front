<template>
  <section class="py-20 bg-white">
    <div class="container-custom">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
          Featured Templates
        </h2>
        <p class="text-lg text-gray-600 max-w-3xl mx-auto">
          Professional, ready-to-use website templates that you can customize and launch in minutes.
        </p>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="product in featuredProducts" :key="product.id" class="group">
          <NuxtLink :to="`/templates/${product.slug}`" class="block">
            <!-- Template Preview Image -->
            <div class="relative overflow-hidden rounded-2xl mb-4 bg-gray-100 aspect-[4/5]">
              <img 
                :src="product.previewImage" 
                :alt="product.name"
                class="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <!-- Hover overlay with "View Template" button -->
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div class="bg-white text-gray-900 px-6 py-2 rounded-full font-medium">
                  View Template
                </div>
              </div>
              <!-- Category badge -->
              <div class="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                {{ product.category }}
              </div>
            </div>
            
            <!-- Product Info -->
            <div class="space-y-2">
              <h3 class="font-heading font-bold text-lg text-gray-900 group-hover:text-brand-brown transition-colors">
                {{ product.name }}
              </h3>
              <p class="text-gray-600 text-sm line-clamp-2">
                {{ product.description }}
              </p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-1">
                  <div class="flex">
                    <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                    <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                    <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                    <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                    <Icon name="heroicons:star-20-solid" class="w-4 h-4 text-yellow-400" />
                  </div>
                  <span class="text-xs text-gray-500">({{ product.reviews }})</span>
                </div>
                <span class="font-bold text-gray-900">${{ product.price }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
      
      <!-- Bottom CTA -->
      <div class="text-center mt-16">
        <NuxtLink to="/templates" 
                  class="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-2xl font-medium hover:bg-gray-800 transition-colors">
          Browse All Templates
          <Icon name="heroicons:arrow-right" class="ml-2 w-5 h-5" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
const featuredProducts = ref([
  {
    id: 1,
    name: 'Elegant Wedding Website',
    slug: 'elegant-wedding-template',
    category: 'Wedding',
    description: 'Beautiful romantic design perfect for your special day. Includes RSVP forms, photo galleries, and timeline.',
    previewImage: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&h=500&fit=crop&crop=top',
    price: 39,
    reviews: 127,
    rating: 5
  },
  {
    id: 2,
    name: 'Modern Business Template',
    slug: 'modern-business-template',
    category: 'Business',
    description: 'Professional and clean design for agencies and consultants. Conversion-optimized with contact forms.',
    previewImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=500&fit=crop&crop=top',
    price: 49,
    reviews: 89,
    rating: 5
  },
  {
    id: 3,
    name: 'Calm Therapy Practice',
    slug: 'therapy-practice-template',
    category: 'Wellness',
    description: 'Soothing design for mental health professionals. Includes appointment booking and resource pages.',
    previewImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=500&fit=crop&crop=top',
    price: 35,
    reviews: 64,
    rating: 5
  },
  {
    id: 4,
    name: 'Creative Portfolio Showcase',
    slug: 'creative-portfolio-template',
    category: 'Portfolio',
    description: 'Stunning portfolio design for photographers and designers. Full-screen galleries and project cases.',
    previewImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=500&fit=crop&crop=top',
    price: 42,
    reviews: 156,
    rating: 5
  }
])
</script>