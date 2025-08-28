<template>
  <section class="section-padding bg-white">
    <div class="container-custom">
      <div class="text-center mb-16">
        <h2 class="font-heading font-medium text-gray-900 mb-4">
          Why Miracute Stands Out?
        </h2>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Professional designs that work together as complete business systems, with personal support. Accessible to everyone regardless of budget or technical skills.
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
    title: 'Ready in Minutes, Not Months',
    description: 'Complete template bundles designed for quick setup. Everything you need to launch professionally : website, emails, and more—in one cohesive package.',
    icon: 'heroicons:bolt',
    iconBg: 'bg-brand-pink'
  },
  {
    title: 'Perfect on Every Device',
    description: 'Every template is tested and optimized for mobile, tablet, and desktop. Your visitors get a flawless experience no matter how they find you.',
    icon: 'heroicons:device-phone-mobile',
    iconBg: 'bg-brand-sage'
  },
  {
    title: 'Genuine Support, Not Bots',
    description: 'Questions? You\'ll talk to a real person who genuinely cares about your success. No chatbots, no automated responses—just helpful, human support.',
    icon: 'heroicons:heart',
    iconBg: 'bg-brand-pink'
  }
])
</script>