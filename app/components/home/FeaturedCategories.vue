<template>
  <section class="section-padding bg-white">
    <div class="container-custom">
      <div class="text-center mb-16">
        <h2 class="font-heading font-medium text-gray-900 mb-4">
          Choose Your Style
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          From elegant wedding sites to professional business pages, find the perfect template for your needs.
        </p>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div v-for="category in categories" :key="category.slug" 
             class="group cursor-pointer">
          <NuxtLink :to="`/categories/${category.slug}`" class="block">
            <div class="relative overflow-hidden rounded-2xl aspect-square mb-4 hover-lift">
              <img 
                :src="category.image" 
                :alt="category.name"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div class="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 class="font-heading font-medium text-lg">{{ category.name }}</h3>
                <p class="text-sm text-gray-200">{{ category.count }}+ templates</p>
              </div>
            </div>
            <h3 class="font-heading font-medium text-xl text-gray-900 mb-2">{{ category.name }}</h3>
            <p class="text-gray-600">{{ category.description }}</p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const categories = ref([
  {
    name: 'Wedding Templates',
    slug: 'wedding-templates',
    description: 'Romantic designs for your special day',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=400&fit=crop',
    count: 12
  },
  {
    name: 'Business Templates',
    slug: 'business-templates', 
    description: 'Professional designs for companies',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop',
    count: 18
  },
  {
    name: 'Therapist Templates',
    slug: 'therapist-templates',
    description: 'Calming designs for wellness practices',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop',
    count: 8
  },
  {
    name: 'Portfolio Templates',
    slug: 'portfolio-templates',
    description: 'Showcase your creative work',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop',
    count: 15
  }
])
</script>