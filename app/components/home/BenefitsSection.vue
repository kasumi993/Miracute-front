<template>
  <section class="py-12 sm:py-16 lg:py-20 bg-white">
    <div class="container-custom">
      <div class="text-center mb-12 sm:mb-16 px-4 sm:px-0">
        <h2 class="text-2xl sm:text-3xl lg:text-4xl font-heading font-medium text-gray-900 mb-3 sm:mb-4">
          Why Choose Miracute Templates?
        </h2>
        <p class="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Every template is carefully crafted by a real designer who understands your needs. No mass-produced designs—just beautiful, personal creations made with love.
        </p>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
        <div v-for="benefit in benefits" :key="benefit.title" 
             class="text-center p-6 sm:p-8 rounded-2xl hover-glow">
          <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
               :class="benefit.iconBg">
            <Icon :name="benefit.icon" class="w-6 h-6 sm:w-8 sm:h-8 text-gray-700" />
          </div>
          <h3 class="font-heading font-medium text-lg sm:text-xl text-gray-900 mb-3 sm:mb-4">{{ benefit.title }}</h3>
          <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
            {{ benefit.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const benefits = ref([
  {
    title: 'Crafted with Personal Care',
    description: 'Each template is thoughtfully designed by hand—no AI, no algorithms, just genuine creativity and attention to detail that makes your event truly special.',
    icon: 'heroicons:heart',
    iconBg: 'bg-brand-pink'
  },
  {
    title: 'Works with Canva Free',
    description: 'All templates are optimized to work beautifully with Canva\'s free version. No premium subscriptions needed—just download and customize.',
    icon: 'heroicons:sparkles',
    iconBg: 'bg-brand-sage'
  },
  {
    title: 'Real Person, Real Support',
    description: 'When you have questions, you\'ll talk directly to the designer. Personal help from someone who truly cares about making your vision come to life.',
    icon: 'heroicons:user-circle',
    iconBg: 'bg-brand-warm'
  }
])
</script>