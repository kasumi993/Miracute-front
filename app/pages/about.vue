<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Hero Section -->
    <section class="bg-gradient-to-br from-brand-pink via-neutral-50 to-brand-sage relative overflow-hidden">
      <div class="container-custom py-16 sm:py-20 lg:py-24 relative z-10">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-medium text-gray-900 mb-4 sm:mb-6">
            About Miracute
          </h1>
          <p class="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-6 sm:mb-8 leading-relaxed">
            Making beautiful design accessible to everyone, because every project deserves to
            <span class="text-brand-brown font-medium">make someone smile</span>.
          </p>
        </div>
      </div>
      
      <!-- Decorative Elements -->
      <div class="absolute top-10 sm:top-20 right-4 sm:right-20 w-16 h-16 sm:w-32 sm:h-32 bg-white/20 rounded-full animate-float"></div>
      <div class="absolute bottom-20 sm:bottom-40 left-4 sm:left-20 w-12 h-12 sm:w-24 sm:h-24 bg-white/30 rounded-full animate-float" style="animation-delay: -2s"></div>
    </section>

    <!-- Our Story -->
    <section class="container-custom py-12 sm:py-16">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
        <div>
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-heading font-medium text-gray-900 mb-4 sm:mb-6">Our Story</h2>
          <div class="prose prose-base sm:prose-lg prose-gray">
            <p class="text-sm sm:text-base leading-relaxed mb-4">
              Miracute was born from a simple belief: beautiful design shouldn't be reserved for those with big budgets or technical expertise. We saw too many amazing ideas, businesses, and celebrations held back by the complexity and cost of professional web design.
            </p>
            <p class="text-sm sm:text-base leading-relaxed mb-4">
              Our mission is to democratize design, making it possible for anyone to create something truly beautiful. Whether you're planning your dream wedding, launching a business, or sharing your creative work with the world, we believe you deserve templates that reflect your vision and values.
            </p>
            <p class="text-sm sm:text-base leading-relaxed">
              Every template in our collection is crafted with care, attention to detail, and the goal of making someone smile. Because at the end of the day, that's what great design does – it creates joy, connection, and memorable experiences.
            </p>
          </div>
        </div>
        
        <div class="relative mt-8 lg:mt-0">
          <div class="aspect-square rounded-2xl bg-gradient-to-br from-brand-pink to-brand-sage p-6 sm:p-8 flex items-center justify-center">
            <div class="text-center text-white">
              <div class="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6">
                <svg viewBox="0 0 100 100" class="w-full h-full">
                  <path d="M20 40 Q20 20, 40 20 Q50 25, 50 35 Q50 25, 60 20 Q80 20, 80 40 Q75 50, 65 50 L50 75 L35 50 Q25 50, 20 40 Z" 
                        fill="white" stroke="none"/>
                </svg>
              </div>
              <h3 class="text-lg sm:text-xl lg:text-2xl font-heading font-medium mb-1 sm:mb-2">Design with Purpose</h3>
              <p class="text-white/90 text-sm sm:text-base">Every template tells a story</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Our Values -->
    <section class="bg-white border-y border-gray-200">
      <div class="container-custom py-12 sm:py-16">
        <div class="text-center mb-12 sm:mb-16">
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-heading font-medium text-gray-900 mb-3 sm:mb-4">Our Values</h2>
          <p class="text-base sm:text-lg lg:text-xl text-gray-600">The principles that guide everything we do</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div class="text-center p-6 sm:p-8">
            <div class="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Icon name="heroicons:heart" class="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <h3 class="text-lg sm:text-xl font-heading font-medium text-gray-900 mb-3 sm:mb-4">Accessibility</h3>
            <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
              Beautiful design should be available to everyone, regardless of budget or technical skill. We create templates that are easy to customize and affordable for all.
            </p>
          </div>

          <div class="text-center p-6 sm:p-8">
            <div class="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Icon name="heroicons:sparkles" class="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <h3 class="text-lg sm:text-xl font-heading font-medium text-gray-900 mb-3 sm:mb-4">Quality</h3>
            <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
              Every template is meticulously crafted with attention to detail, modern design principles, and user experience best practices.
            </p>
          </div>

          <div class="text-center p-6 sm:p-8">
            <div class="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Icon name="heroicons:users" class="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
            <h3 class="text-lg sm:text-xl font-heading font-medium text-gray-900 mb-3 sm:mb-4">Community</h3>
            <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
              We're more than a template marketplace – we're a community of creators, entrepreneurs, and dreamers supporting each other's success.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="container-custom py-12 sm:py-16">
      <div class="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white">
        <div class="text-center mb-8 sm:mb-12">
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-heading font-medium mb-3 sm:mb-4">Making an Impact</h2>
          <p class="text-base sm:text-lg lg:text-xl text-gray-300">Our community continues to grow every day</p>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          <div class="text-center">
            <div class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">10,000+</div>
            <div class="text-gray-300 text-xs sm:text-sm lg:text-base">Happy Customers</div>
          </div>
          <div class="text-center">
            <div class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">500+</div>
            <div class="text-gray-300 text-xs sm:text-sm lg:text-base">Beautiful Templates</div>
          </div>
          <div class="text-center">
            <div class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">50+</div>
            <div class="text-gray-300 text-xs sm:text-sm lg:text-base">Categories</div>
          </div>
          <div class="text-center">
            <div class="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">99%</div>
            <div class="text-gray-300 text-xs sm:text-sm lg:text-base">Satisfaction Rate</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="bg-white border-t border-gray-200">
      <div class="container-custom py-12 sm:py-16">
        <div class="text-center mb-12 sm:mb-16">
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-heading font-medium text-gray-900 mb-3 sm:mb-4">Meet Our Team</h2>
          <p class="text-base sm:text-lg lg:text-xl text-gray-600">The people behind Miracute</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
          <div class="text-center">
            <div class="w-20 h-20 sm:w-24 sm:h-24 bg-brand-pink rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center text-lg sm:text-2xl font-medium text-gray-700">
              SM
            </div>
            <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-1">Sarah Mitchell</h3>
            <p class="text-gray-600 text-xs sm:text-sm mb-2">Founder & Creative Director</p>
            <p class="text-gray-500 text-xs sm:text-sm">Passionate about making design accessible to everyone.</p>
          </div>

          <div class="text-center">
            <div class="w-20 h-20 sm:w-24 sm:h-24 bg-brand-sage rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center text-lg sm:text-2xl font-medium text-gray-700">
              MJ
            </div>
            <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-1">Marcus Johnson</h3>
            <p class="text-gray-600 text-xs sm:text-sm mb-2">Lead Designer</p>
            <p class="text-gray-500 text-xs sm:text-sm">Creates beautiful templates that tell compelling stories.</p>
          </div>

          <div class="text-center">
            <div class="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-warm rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center text-lg sm:text-2xl font-medium text-gray-700">
              EW
            </div>
            <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-1">Emma Wilson</h3>
            <p class="text-gray-600 text-xs sm:text-sm mb-2">Customer Success Manager</p>
            <p class="text-gray-500 text-xs sm:text-sm">Ensures every customer has an amazing experience.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gradient-to-r from-brand-pink to-brand-sage">
      <div class="container-custom py-12 sm:py-16">
        <div class="text-center max-w-2xl mx-auto">
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-heading font-medium text-gray-900 mb-4 sm:mb-6">
            Ready to Create Something Beautiful?
          </h2>
          <p class="text-base sm:text-lg lg:text-xl text-gray-700 mb-6 sm:mb-8">
            Join thousands of customers who've transformed their ideas into reality with our templates.
          </p>
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-lg mx-auto sm:max-w-none">
            <NuxtLink to="/templates" class="btn-primary bg-gray-900 hover:bg-gray-800 w-full sm:w-auto justify-center">
              Browse Templates
            </NuxtLink>
            <NuxtLink to="/contact" class="btn-secondary border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white w-full sm:w-auto justify-center">
              Get In Touch
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// SEO
useSeoMeta({
  title: 'About Us | Miracute - Making Design Accessible',
  description: 'Learn about Miracute\'s mission to make beautiful design accessible to everyone. Discover our story, values, and the team behind our template marketplace.',
  keywords: 'about miracute, design accessibility, template marketplace, website design, creative team',
  ogTitle: 'About Miracute - Making Design Accessible',
  ogDescription: 'Learn about our mission to democratize design and make beautiful templates accessible to everyone.',
  ogImage: '/images/og-about.jpg'
})
</script>