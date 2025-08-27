<template>
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
    title: 'Lightning Fast Setup',
    description: 'Download, customize, and launch your website in minutes. Our templates are designed for quick deployment.',
    icon: 'heroicons:bolt',
    iconBg: 'bg-brand-pink'
  },
  {
    title: 'Mobile Responsive',
    description: 'Every template looks perfect on all devices. Your visitors will have a great experience whether on desktop or mobile.',
    icon: 'heroicons:device-phone-mobile',
    iconBg: 'bg-brand-sage'
  },
  {
    title: 'Customer Support',
    description: 'Need help? Our friendly support team is here to help you succeed with your new website.',
    icon: 'heroicons:heart',
    iconBg: 'bg-brand-pink'
  }
])
</script>