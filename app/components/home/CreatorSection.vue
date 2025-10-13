<template>
  <section class="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-brand-pink/10 to-brand-sage/10">
    <div class="container-custom">
      <div class="max-w-4xl mx-auto text-center px-4 sm:px-0">
        <!-- Creator Image/Avatar -->
        <div class="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 relative">
          <img
            src="/images/creator5.png"
            alt="Kasumi, founder and creative mind behind Miracute"
            class="w-full h-full rounded-full object-cover border-2 border-brand-warm shadow-lg"
            loading="lazy"
          />
          <div class="absolute inset-0 rounded-full ring-2 ring-brand-pink/20 ring-offset-2"></div>
        </div>
        
        <!-- Creator Story -->
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4 sm:mb-6">
          Hi, I'm the Creative Mind Behind Miracute
        </h2>
        
        <div class="text-sm sm:text-base text-gray-600 space-y-6 mb-6 sm:mb-8 max-w-3xl mx-auto">
          <p>
            Behind every template is just me, a multi-passionate creator with web development roots, and my tireless team. We believe creativity should stay human in an AI-driven world.
          </p>

          <!-- Featured sentiment with special styling -->
          <div class="relative py-4 sm:py-6">
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-brand-pink/20 to-transparent rounded-lg"></div>
            <div class="relative text-center">
              <p class="text-lg sm:text-xl md:text-2xl font-medium text-brand-brown italic leading-relaxed">
                "I genuinely love what I do and hope you do too."
              </p>
              <div class="flex justify-center mt-2 sm:mt-3">
                <div class="w-12 h-0.5 bg-gradient-to-r from-brand-pink to-brand-sage rounded-full"></div>
              </div>
            </div>
          </div>

          <p>
            I started Miracute because I believe we can get designs that feel personal, cohesive and not mass-produced without breaking the bank.
            Whether it's your wedding day or launching your practice, I want to help you tell your story beautifully.
            So do not hesitate to contact me and my team if you have any questions or need help.
          </p>
        </div>

        <!-- Personal signature -->
        <div class="mt-6 sm:mt-8 mb-8 sm:mb-10 text-center">
          <div class="inline-block relative">
            <p class="text-xl sm:text-2xl font-script text-brand-brown italic opacity-90">
              – Kasumi
            </p>
            <div class="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-brown/30 to-transparent"></div>
          </div>
        </div>

        <!-- Values/Promise -->
        <div class="bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20">
          <h3 class="text-lg sm:text-xl font-heading font-semibold text-gray-900 mb-3 sm:mb-4">My Promise to You</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-sm text-gray-600">
            <div class="flex items-start space-x-3">
              <div class="w-2 h-2 bg-brand-brown rounded-full mt-2 flex-shrink-0"></div>
              <p>My team and I personally design each element with your goals and budget in mind</p>
            </div>
            <div class="flex items-start space-x-3">
              <div class="w-2 h-2 bg-brand-brown rounded-full mt-2 flex-shrink-0"></div>
              <p>Personal support whenever you need help</p>
            </div>
            <div class="flex items-start space-x-3">
              <div class="w-2 h-2 bg-brand-brown rounded-full mt-2 flex-shrink-0"></div>
              <p>Quality over quantity—I'd rather create fewer perfect templates</p>
            </div>
            <div class="flex items-start space-x-3">
              <div class="w-2 h-2 bg-brand-brown rounded-full mt-2 flex-shrink-0"></div>
              <p>Continuous improvement based on your feedback</p>
            </div>
          </div>
        </div>
        
        <!-- Coming Soon Preview -->
        <div class="mt-8 sm:mt-12 bg-white/40 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
          <h4 class="text-base sm:text-lg font-heading font-semibold text-gray-900 mb-2 sm:mb-3">Coming Soon</h4>
          <p class="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">We're currently working on templates for wellness professionals and life coaches. Each collection will have the same attention to detail you see in the wedding designs.</p>
          <div class="flex flex-wrap justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <span class="bg-brand-sage/20 text-brand-brown px-2 sm:px-3 py-1 rounded-full">Therapist Templates</span>
            <span class="bg-brand-warm/30 text-brand-brown px-2 sm:px-3 py-1 rounded-full">Life Coach Designs</span>
            <span class="bg-brand-pink/30 text-brand-brown px-2 sm:px-3 py-1 rounded-full">Wellness Practice Kits</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Creator section - no reactive data needed for now
</script>