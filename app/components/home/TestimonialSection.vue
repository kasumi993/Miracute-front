<template>
  <section class="py-16 bg-white">
    <div class="container-custom">
      <div class="text-center mb-12">
        <h2 class="text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-4">
          What My Couples Say
        </h2>
        <p class="text-gray-600 max-w-2xl mx-auto">
          Real feedback from real couples who used Miracute templates for their special day
        </p>
      </div>
      
      <!-- Testimonials Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        <div v-for="testimonial in testimonials" :key="testimonial.id" 
             class="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow">
          <!-- Stars -->
          <div class="flex space-x-1 mb-4">
            <Icon v-for="star in 5" :key="star" 
                  name="heroicons:star-20-solid" 
                  class="w-4 h-4 text-yellow-400" />
          </div>
          
          <!-- Quote -->
          <p class="text-gray-600 mb-4 italic">
            "{{ testimonial.quote }}"
          </p>
          
          <!-- Author -->
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-brand-pink rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-brand-brown">{{ testimonial.author.charAt(0) }}</span>
            </div>
            <div>
              <p class="font-medium text-gray-900 text-sm">{{ testimonial.author }}</p>
              <p class="text-xs text-gray-500">{{ testimonial.template }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Trust Indicators -->
      <div class="bg-gray-50 rounded-2xl p-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div class="text-2xl font-bold text-brand-brown mb-2">20+</div>
            <p class="text-gray-600 text-sm">Happy Couples Served</p>
          </div>
          <div>
            <div class="text-2xl font-bold text-brand-brown mb-2">5★</div>
            <p class="text-gray-600 text-sm">Average Rating</p>
          </div>
          <div>
            <div class="text-2xl font-bold text-brand-brown mb-2">24h</div>
            <p class="text-gray-600 text-sm">Average Response Time</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const testimonials = ref([
  {
    id: 1,
    quote: "The garden wedding template was exactly what we needed! Easy to customize and absolutely beautiful. Our guests loved the invitations.",
    author: "Sarah & Mike",
    template: "Elegant Garden Wedding"
  },
  {
    id: 2,
    quote: "So affordable and elegant. The designer helped me customize colors to match our theme perfectly. Couldn't be happier!",
    author: "Emma L.",
    template: "Minimalist Blush Wedding"
  },
  {
    id: 3,
    quote: "Personal service that you can't find anywhere else. The designer truly cares about making your wedding stationery perfect.",
    author: "Jessica & Tom",
    template: "Elegant Garden Wedding"
  }
])
</script>