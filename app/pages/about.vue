<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Hero Section -->
    <section class="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-neutral-50 to-white">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <div class="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-heading font-medium text-gray-900 mb-4 sm:mb-6">
            Hi, welcome to Miracute
          </h1>

          <p class="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            I'm Kasumi, and with my team, we handcraft templates that bring personality back to design.
          </p>
        </div>

        <!-- Story Card -->
        <div class="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-12 border border-gray-100">
          <div class="flex flex-col sm:flex-row items-center justify-center mb-6 sm:mb-8">
            <div class="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-0 sm:mr-4 relative flex-shrink-0">
              <img
                src="/images/creator4.png"
                alt="Kasumi, founder of Miracute"
                class="w-full h-full rounded-full object-cover shadow-lg border-2 border-brand-pink"
                loading="lazy"
              />
              <div class="absolute inset-0 rounded-full ring-2 ring-brand-pink/20 ring-offset-2"></div>
            </div>
            <h2 class="text-xl sm:text-2xl lg:text-3xl font-heading font-medium text-gray-900 text-center sm:text-left">
              My story is probably like yours
            </h2>
          </div>

          <div class="max-w-3xl mx-auto">
            <div class="prose prose-gray max-w-none">
              <p class="text-gray-700 leading-relaxed text-sm sm:text-base mb-4 sm:mb-6">
                I used to work behind the scenes at a company, building websites. Clean code, fast loading times, all the technical stuff that makes developers happy. But something always felt... incomplete.
              </p>

              <p class="text-gray-700 leading-relaxed text-sm sm:text-base mb-4 sm:mb-6">
                Every project felt functional but soulless. Where was the heart? The personality? The little spark that makes someone feel genuinely connected to what they're seeing?
              </p>

              <p class="text-gray-700 leading-relaxed text-sm sm:text-base mb-4 sm:mb-6">
                Then AI started making designs. Thousands of them. In seconds. And I realized what I'd been missing all along: the irreplaceable value of someone actually caring about what they're creating.
              </p>

              <!-- Highlighted conclusion -->
              <div class="bg-gradient-to-r from-brand-pink/10 via-brand-sage/10 to-brand-warm/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 border-l-4 border-brand-pink">
                <p class="text-gray-800 leading-relaxed text-sm sm:text-base font-medium mb-3 sm:mb-4">
                  So I started designing templates by hand with my team's support. Every color choice, every font pairing, every little detail, all chosen with care for your project's success.
                </p>
                <p class="text-brand-brown leading-relaxed text-sm sm:text-base font-semibold">
                  That's Miracute. Templates made with actual human care, designed to work with Canva's free plan, because great design shouldn't cost a fortune.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- What Makes It Different -->
    <section class="py-16 sm:py-20 bg-white">
      <div class="max-w-4xl mx-auto px-4">
        <h2 class="text-2xl sm:text-3xl font-heading font-medium text-gray-900 mb-12 text-center">
          Here's what makes these templates different
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Point 1 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-brand-sage rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <span class="text-2xl">✋</span>
            </div>
            <h3 class="text-lg font-heading font-medium text-gray-900 mb-4">Made by hand</h3>
            <p class="text-gray-600 leading-relaxed">
              Every single element is personally crafted by me and my team, pixel by pixel. No AI, no copy-paste, no shortcuts.
            </p>
          </div>

          <!-- Point 2 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-brand-warm rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <span class="text-2xl">💝</span>
            </div>
            <h3 class="text-lg font-heading font-medium text-gray-900 mb-4">Canva free friendly</h3>
            <p class="text-gray-600 leading-relaxed">
              Designed specifically for Canva's free plan. No surprise premium requirements.
            </p>
          </div>

          <!-- Point 3 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-brand-pink rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <span class="text-2xl">💬</span>
            </div>
            <h3 class="text-lg font-heading font-medium text-gray-900 mb-4">Real support</h3>
            <p class="text-gray-600 leading-relaxed">
              Got questions? You'll talk directly to me and my team, the people who designed your template.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Facts -->
    <section class="py-16 sm:py-20 bg-neutral-50">
      <div class="max-w-4xl mx-auto px-4">
        <h2 class="text-2xl sm:text-3xl font-heading font-medium text-gray-900 mb-12 text-center">
          A few quick facts
        </h2>
        
        <div class="bg-white rounded-3xl p-8 sm:p-12 shadow-sm">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div class="text-3xl sm:text-4xl font-heading font-bold text-brand-pink mb-2">6</div>
              <div class="text-sm text-gray-600">Templates so far</div>
            </div>
            
            <div>
              <div class="text-3xl sm:text-4xl font-heading font-bold text-brand-sage mb-2">100%</div>
              <div class="text-sm text-gray-600">Canva free compatible</div>
            </div>
            
            <div>
              <div class="text-3xl sm:text-4xl font-heading font-bold text-brand-warm mb-2">0</div>
              <div class="text-sm text-gray-600">Generic templates</div>
            </div>
            
            <div>
              <div class="text-3xl sm:text-4xl font-heading font-bold text-gray-800 mb-2">1</div>
              <div class="text-sm text-gray-600">Creative team</div>
            </div>
          </div>
          
          <div class="mt-12 pt-8 border-t border-gray-100 text-center">
            <p class="text-gray-600 italic">
              "I'd rather make 6 templates people love than 600 that feel generic."
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- What's Coming -->
    <section class="py-16 sm:py-20 bg-white">
      <div class="max-w-4xl mx-auto px-4">
        <h2 class="text-2xl sm:text-3xl font-heading font-medium text-gray-900 mb-12 text-center">
          What's coming next
        </h2>
        
        <div class="space-y-8">
          <!-- Next Project -->
          <div class="bg-brand-sage/10 rounded-2xl p-6 sm:p-8">
            <div class="flex items-start">
              <div class="w-12 h-12 bg-brand-sage rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                <span class="text-white text-xl">🧘</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center flex-wrap gap-3 mb-3">
                  <h3 class="text-lg font-heading font-medium text-gray-900">Wellness Templates</h3>
                  <span class="bg-brand-sage text-white text-xs px-2 py-1 rounded-full">Coming this month</span>
                </div>
                <p class="text-gray-700 leading-relaxed">
                  Calming, professional designs for therapists and wellness professionals who want to create trust without breaking the bank.
                </p>
              </div>
            </div>
          </div>

          <!-- Planning -->
          <div class="bg-gray-100 rounded-2xl p-6 sm:p-8">
            <div class="flex items-start">
              <div class="w-12 h-12 bg-gray-400 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                <span class="text-white text-xl">💪</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center flex-wrap gap-3 mb-3">
                  <h3 class="text-lg font-heading font-medium text-gray-900">Coach Templates</h3>
                  <span class="bg-gray-400 text-white text-xs px-2 py-1 rounded-full">Planning</span>
                </div>
                <p class="text-gray-700 leading-relaxed">
                  Inspiring designs for life coaches who want to motivate and connect without looking like everyone else.
                </p>
              </div>
            </div>
          </div>

          <!-- Your Ideas -->
          <div class="border-2 border-dashed border-gray-300 rounded-2xl p-6 sm:p-8">
            <div class="flex items-start">
              <div class="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                <span class="text-gray-600 text-xl">💡</span>
              </div>
              <div class="flex-1">
                <div class="flex items-center flex-wrap gap-3 mb-3">
                  <h3 class="text-lg font-heading font-medium text-gray-900">Your Ideas</h3>
                  <span class="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded-full">Always welcome</span>
                </div>
                <p class="text-gray-700 leading-relaxed">
                  What industry needs beautiful, affordable templates? I love creating based on real feedback from real people.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 sm:py-20 bg-gradient-to-br from-brand-pink/20 via-white to-brand-sage/20">
      <div class="max-w-4xl mx-auto px-4 text-center">
        <div class="bg-white rounded-3xl p-8 sm:p-12 shadow-sm">
          <div class="w-16 h-16 bg-gradient-to-br from-brand-pink to-brand-sage rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <span class="text-white text-2xl">✨</span>
          </div>
          
          <h2 class="text-2xl sm:text-3xl lg:text-4xl font-heading font-medium text-gray-900 mb-6">
            Ready to make someone smile?
          </h2>
          
          <p class="text-lg text-gray-700 mb-8 leading-relaxed">
            Browse my templates or drop me a line if you need something custom. I'd love to help bring your vision to life.
          </p>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <NuxtLink
              to="/listings"
              class="bg-gray-900 text-white px-8 py-4 rounded-2xl font-medium hover:bg-gray-800 transition-colors inline-flex items-center justify-center"
            >
              Browse Templates
              <Icon name="heroicons:arrow-right" class="ml-2 w-5 h-5" />
            </NuxtLink>
            
            <NuxtLink 
              to="/contact" 
              class="border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-2xl font-medium hover:bg-gray-900 hover:text-white transition-colors inline-flex items-center justify-center"
            >
              Get in Touch
              <Icon name="heroicons:chat-bubble-left-right" class="ml-2 w-5 h-5" />
            </NuxtLink>
          </div>

          <!-- Personal Note -->
          <div class="mt-8 pt-6 border-t border-gray-100">
            <div class="flex items-center justify-center space-x-3 text-gray-600">
              <div class="w-8 h-8 bg-brand-pink rounded-full flex items-center justify-center">
                <span class="text-white text-sm">👩‍💻</span>
              </div>
              <span class="text-sm">Personally designed and supported by a real human, <span class="font-script italic text-brand-brown">kasumi</span>.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// SEO
useSeoMeta({
  title: 'About | Miracute - Hi, I\'m Behind Every Template',
  description: 'Meet the person behind Miracute templates. My story of going from web developer to handcrafting templates with genuine care—no AI, just human creativity.',
  keywords: 'about miracute, template designer, handcrafted templates, human creativity, personal story, canva free templates, no ai design',
  ogTitle: 'About Miracute - The Human Behind Every Template',
  ogDescription: 'From web developer to template designer. The story of choosing human care over algorithmic shortcuts.',
  ogImage: '/images/og-about-personal.jpg'
})
</script>