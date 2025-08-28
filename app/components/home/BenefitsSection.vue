<template>
  <section class="section-padding bg-white">
    <div class="container-custom">
      <div class="text-center mb-16">
        <h2 class="font-heading font-medium text-gray-900 mb-4">
          Why Choose Miracute Templates?
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Every template is carefully crafted by a real designer who understands your needs. No mass-produced designs—just beautiful, personal creations made with love.
        </p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div v-for="benefit in benefits" :key="benefit.title" 
             class="text-center p-8 rounded-2xl hover-glow">
          <div class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
               :class="benefit.iconBg">
            <Icon :name="benefit.icon" class="w-8 h-8 text-gray-700" />
          </div>
          <h3 class="font-heading font-medium text-xl text-gray-900 mb-4">{{ benefit.title }}</h3>
          <p class="text-gray-600 leading-relaxed">
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
    icon: 'heroicons:device-phone-mobile',
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