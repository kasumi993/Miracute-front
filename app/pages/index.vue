<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-gradient min-h-screen flex items-center relative overflow-hidden">
      <!-- Background Elements -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute top-20 right-20 w-32 h-32 bg-brand-sage rounded-full animate-float"></div>
        <div class="absolute bottom-40 left-20 w-24 h-24 bg-brand-pink rounded-full animate-float" style="animation-delay: -2s"></div>
        <div class="absolute top-1/2 right-1/3 w-16 h-16 bg-brand-sage rounded-full animate-float" style="animation-delay: -4s"></div>
      </div>
      
      <div class="container-custom relative z-10">
        <div class="max-w-4xl mx-auto text-center">
          <!-- Logo -->
          <div class="mb-8 animate-fade-in">
            <div class="inline-flex items-center space-x-3">
              <!-- Miracute Bow Icon -->
              <NuxtImg 
                src="/logo.png" 
                alt="Miracute Logo" 
                width="48" 
                height="48" 
                class="w-12 h-12"
              />
              <span class="text-4xl font-heading font-medium text-gray-900">miracute</span>
            </div>
          </div>
          
          <!-- Tagline -->
          <p class="text-brand-brown text-lg sm:text-xl mb-12 animate-slide-up">
            Make Someone Smile, Every Day
          </p>
          
          <!-- Hero Headline -->
          <h1 class="text-5xl sm:text-6xl lg:text-7xl font-heading font-medium text-gray-900 mb-6 animate-slide-up">
            Beautiful Website
            <span class="block text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-green-300">
              Templates
            </span>
            <span class="block">Made Simple</span>
          </h1>
          
          <!-- Hero Description -->
          <p class="text-xl sm:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up">
            Professional, customizable templates for businesses, weddings, therapists, and creative professionals. 
            <span class="text-brand-brown font-medium">No coding required.</span>
          </p>
          
          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
            <NuxtLink to="/templates" class="btn-primary text-lg px-8 py-4">
              Browse Templates
              <Icon name="heroicons:arrow-right" class="ml-2 w-5 h-5" />
            </NuxtLink>
            <NuxtLink to="/categories" class="btn-secondary text-lg px-8 py-4">
              View Categories
            </NuxtLink>
          </div>
          
          <!-- Trust Indicators -->
          <div class="mt-16 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-500">
            <div class="flex items-center space-x-2">
              <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-500" />
              <span>Instant Download</span>
            </div>
            <div class="flex items-center space-x-2">
              <Icon name="heroicons:device-phone-mobile" class="w-5 h-5 text-blue-500" />
              <span>Mobile Responsive</span>
            </div>
            <div class="flex items-center space-x-2">
              <Icon name="heroicons:heart" class="w-5 h-5 text-red-500" />
              <span>Easy to Customize</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Categories Section -->
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
          <div v-for="category in featuredCategories" :key="category.slug" 
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

    <!-- Featured Products Section -->
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
          <div v-for="product in featuredProducts" :key="product.slug" 
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

    <!-- Benefits Section -->
    <section class="section-padding bg-white">
      <div class="container-custom">
        <div class="text-center mb-16">
          <h2 class="font-heading font-medium text-gray-900 mb-4">
            Why Choose Miracute?
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            We make beautiful design accessible to everyone, no matter your technical skills.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center p-8 rounded-2xl hover-glow">
            <div class="w-16 h-16 bg-brand-pink rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="heroicons:bolt" class="w-8 h-8 text-gray-700" />
            </div>
            <h3 class="font-heading font-medium text-xl text-gray-900 mb-4">Lightning Fast Setup</h3>
            <p class="text-gray-600 leading-relaxed">
              Download, customize, and launch your website in minutes. Our templates are designed for quick deployment.
            </p>
          </div>
          
          <div class="text-center p-8 rounded-2xl hover-glow">
            <div class="w-16 h-16 bg-brand-sage rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="heroicons:device-phone-mobile" class="w-8 h-8 text-gray-700" />
            </div>
            <h3 class="font-heading font-medium text-xl text-gray-900 mb-4">Mobile Responsive</h3>
            <p class="text-gray-600 leading-relaxed">
              Every template looks perfect on all devices. Your visitors will have a great experience whether on desktop or mobile.
            </p>
          </div>
          
          <div class="text-center p-8 rounded-2xl hover-glow">
            <div class="w-16 h-16 bg-brand-pink rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="heroicons:heart" class="w-8 h-8 text-gray-700" />
            </div>
            <h3 class="font-heading font-medium text-xl text-gray-900 mb-4">Customer Support</h3>
            <p class="text-gray-600 leading-relaxed">
              Need help? Our friendly support team is here to help you succeed with your new website.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="section-padding bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div class="container-custom text-center">
        <h2 class="font-heading font-medium text-4xl sm:text-5xl mb-6">
          Ready to Create Something
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-green-300">
            Beautiful?
          </span>
        </h2>
        <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Join thousands of happy customers who've transformed their online presence with our templates.
        </p>
        <NuxtLink to="/templates" class="btn-primary bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-4">
          Start Browsing
          <Icon name="heroicons:arrow-right" class="ml-2 w-5 h-5" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
// SEO Meta Tags
useHead({
  title: 'Beautiful Website Templates | Miracute - Make Someone Smile Every Day',
  meta: [
    { name: 'description', content: 'Professional website templates for businesses, weddings, therapists, and creatives. Easy to customize, mobile-responsive designs. No coding required. Download instantly.' },
    { name: 'keywords', content: 'website templates, canva website template, wedding website, business template, therapist website, portfolio template, professional design' }
  ]
})

// Mock data - replace with actual data fetching
const featuredCategories = ref([
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

const featuredProducts = ref([
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

// Add page view tracking
onMounted(() => {
  // Track page view for analytics
  // This would integrate with your analytics service
})
</script>