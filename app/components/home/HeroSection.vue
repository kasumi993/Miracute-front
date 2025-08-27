<template>
  <section class="hero-gradient min-h-screen flex items-center relative overflow-hidden">
    <!-- Background Elements -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-20 right-20 w-32 h-32 bg-brand-sage rounded-full animate-float"></div>
      <div class="absolute bottom-40 left-20 w-24 h-24 bg-brand-pink rounded-full animate-float" style="animation-delay: -2s"></div>
      <div class="absolute top-1/2 right-1/3 w-16 h-16 bg-brand-sage rounded-full animate-float" style="animation-delay: -4s"></div>
    </div>
    
    <div class="container-custom relative z-10">
      <div class="max-w-4xl mx-auto text-center">
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
</template>