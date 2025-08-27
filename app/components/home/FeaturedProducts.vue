<template>
  <section class="section-padding bg-gradient-to-b from-white to-gray-50">
    <div class="container-custom">
      <div class="text-center mb-16">
        <h2 class="font-heading font-medium text-gray-900 mb-4">
          Featured Templates
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Our most popular templates, loved by thousands of customers worldwide.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div v-for="product in products" :key="product.slug" 
             class="card-product group">
          <NuxtLink :to="`/templates/${product.slug}`">
            <div class="relative aspect-[4/3] overflow-hidden">
              <img 
                :src="product.image" 
                :alt="product.name"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div class="absolute top-4 right-4">
                <span class="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  {{ product.category }}
                </span>
              </div>
            </div>
            <div class="p-6">
              <h3 class="font-heading font-medium text-xl text-gray-900 mb-2">{{ product.name }}</h3>
              <p class="text-gray-600 mb-4 line-clamp-2">{{ product.description }}</p>
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class="text-2xl font-bold text-gray-900">${{ product.price }}</span>
                  <span v-if="product.comparePrice" class="text-lg text-gray-500 line-through">
                    ${{ product.comparePrice }}
                  </span>
                </div>
                <div class="flex items-center space-x-1">
                  <Icon name="heroicons:star-solid" class="w-4 h-4 text-yellow-400" />
                  <span class="text-sm text-gray-600">{{ product.rating }}</span>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
      
      <div class="text-center mt-12">
        <NuxtLink to="/templates" class="btn-primary">
          View All Templates
          <Icon name="heroicons:arrow-right" class="ml-2 w-5 h-5" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup>
const products = ref([
  {
    name: 'Elegant Rose Wedding Website',
    slug: 'elegant-rose-wedding-website',
    description: 'A stunning wedding website featuring elegant rose motifs and romantic typography.',
    price: '29.99',
    comparePrice: '39.99',
    category: 'Wedding',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&h=450&fit=crop',
    rating: '4.9'
  },
  {
    name: 'Professional Consulting Website',
    slug: 'professional-consulting-website',
    description: 'Sophisticated business template designed for consultants and professional services.',
    price: '39.99',
    comparePrice: '49.99',
    category: 'Business',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=450&fit=crop',
    rating: '4.8'
  },
  {
    name: 'Calm Therapy Practice',
    slug: 'calm-therapy-practice-website',
    description: 'Soothing and professional template designed specifically for therapy practices.',
    price: '44.99',
    comparePrice: '54.99',
    category: 'Healthcare',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=450&fit=crop',
    rating: '4.9'
  }
])
</script>