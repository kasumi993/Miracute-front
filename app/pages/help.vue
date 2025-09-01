<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Help & Support</h1>
        <p class="text-gray-600">
          Find answers to common questions about Miracute templates
        </p>
      </div>

      <!-- FAQ Section -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-6 border-b border-gray-100">
          <h2 class="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
        </div>
        
        <div class="p-6 space-y-0 divide-y divide-gray-100">
          <!-- FAQ Item 1 -->
          <div class="py-4">
            <button 
              class="flex items-center justify-between w-full text-left"
              @click="toggleFaq('downloads')"
            >
              <h3 class="text-base font-medium text-gray-900 pr-4">How do I download my templates after purchase?</h3>
              <Icon 
                name="heroicons:chevron-down" 
                class="w-4 h-4 text-gray-500 transform transition-transform flex-shrink-0" 
                :class="{ 'rotate-180': openFaq === 'downloads' }"
              />
            </button>
            <div v-if="openFaq === 'downloads'" class="mt-3 text-sm text-gray-600 leading-relaxed">
              <p>After completing your purchase, you'll receive an email with download links. You can also access downloads from your account dashboard or the order confirmation page. Downloads are unlimited.</p>
            </div>
          </div>

          <!-- FAQ Item 2 -->
          <div class="py-4">
            <button 
              class="flex items-center justify-between w-full text-left"
              @click="toggleFaq('formats')"
            >
              <h3 class="text-base font-medium text-gray-900 pr-4">What file formats are included?</h3>
              <Icon 
                name="heroicons:chevron-down" 
                class="w-4 h-4 text-gray-500 transform transition-transform flex-shrink-0" 
                :class="{ 'rotate-180': openFaq === 'formats' }"
              />
            </button>
            <div v-if="openFaq === 'formats'" class="mt-3 text-sm text-gray-600 leading-relaxed">
              <p>Each template includes HTML/CSS/JS files, Figma design files, documentation, and all required assets (images, fonts, etc.).</p>
            </div>
          </div>

          <!-- FAQ Item 3 -->
          <div class="py-4">
            <button 
              class="flex items-center justify-between w-full text-left"
              @click="toggleFaq('customization')"
            >
              <h3 class="text-base font-medium text-gray-900 pr-4">Can I customize the templates?</h3>
              <Icon 
                name="heroicons:chevron-down" 
                class="w-4 h-4 text-gray-500 transform transition-transform flex-shrink-0" 
                :class="{ 'rotate-180': openFaq === 'customization' }"
              />
            </button>
            <div v-if="openFaq === 'customization'" class="mt-3 text-sm text-gray-600 leading-relaxed">
              <p>Yes! All templates are fully customizable. Change colors, fonts, layouts, add or remove sections, and modify content to match your brand.</p>
            </div>
          </div>

          <!-- FAQ Item 4 -->
          <div class="py-4">
            <button 
              class="flex items-center justify-between w-full text-left"
              @click="toggleFaq('support')"
            >
              <h3 class="text-base font-medium text-gray-900 pr-4">Do you provide setup support?</h3>
              <Icon 
                name="heroicons:chevron-down" 
                class="w-4 h-4 text-gray-500 transform transition-transform flex-shrink-0" 
                :class="{ 'rotate-180': openFaq === 'support' }"
              />
            </button>
            <div v-if="openFaq === 'support'" class="mt-3 text-sm text-gray-600 leading-relaxed">
              <p>Yes! We provide 30 days of full support including setup documentation, email support, and help with customization requests.</p>
            </div>
          </div>

          <!-- FAQ Item 5 -->
          <div class="py-4">
            <button 
              class="flex items-center justify-between w-full text-left"
              @click="toggleFaq('license')"
            >
              <h3 class="text-base font-medium text-gray-900 pr-4">What's included in the license?</h3>
              <Icon 
                name="heroicons:chevron-down" 
                class="w-4 h-4 text-gray-500 transform transition-transform flex-shrink-0" 
                :class="{ 'rotate-180': openFaq === 'license' }"
              />
            </button>
            <div v-if="openFaq === 'license'" class="mt-3 text-sm text-gray-600 leading-relaxed">
              <p>Commercial license included - use for personal and commercial projects, create unlimited websites, modify without restrictions. No attribution required.</p>
            </div>
          </div>

          <!-- FAQ Item 6 -->
          <div class="py-4">
            <button 
              class="flex items-center justify-between w-full text-left"
              @click="toggleFaq('refunds')"
            >
              <h3 class="text-base font-medium text-gray-900 pr-4">What's your refund policy?</h3>
              <Icon 
                name="heroicons:chevron-down" 
                class="w-4 h-4 text-gray-500 transform transition-transform flex-shrink-0" 
                :class="{ 'rotate-180': openFaq === 'refunds' }"
              />
            </button>
            <div v-if="openFaq === 'refunds'" class="mt-3 text-sm text-gray-600 leading-relaxed">
              <p>We evaluate refund requests case-by-case. Our 30-day guarantee covers full support and change requests. 
                <NuxtLink to="/refunds" class="text-brand-brown hover:text-brand-brown/80 font-medium">
                  Learn more →
                </NuxtLink>
              </p>
            </div>
          </div>

          <!-- FAQ Item 7 -->
          <div class="py-4">
            <button 
              class="flex items-center justify-between w-full text-left"
              @click="toggleFaq('payment')"
            >
              <h3 class="text-base font-medium text-gray-900 pr-4">What payment methods do you accept?</h3>
              <Icon 
                name="heroicons:chevron-down" 
                class="w-4 h-4 text-gray-500 transform transition-transform flex-shrink-0" 
                :class="{ 'rotate-180': openFaq === 'payment' }"
              />
            </button>
            <div v-if="openFaq === 'payment'" class="mt-3 text-sm text-gray-600 leading-relaxed">
              <p>We accept all major credit cards, PayPal, Apple Pay, and Google Pay through our secure Stripe payment processor.</p>
            </div>
          </div>

          <!-- FAQ Item 8 -->
          <div class="py-4">
            <button 
              class="flex items-center justify-between w-full text-left"
              @click="toggleFaq('updates')"
            >
              <h3 class="text-base font-medium text-gray-900 pr-4">Do I get updates to templates?</h3>
              <Icon 
                name="heroicons:chevron-down" 
                class="w-4 h-4 text-gray-500 transform transition-transform flex-shrink-0" 
                :class="{ 'rotate-180': openFaq === 'updates' }"
              />
            </button>
            <div v-if="openFaq === 'updates'" class="mt-3 text-sm text-gray-600 leading-relaxed">
              <p>Templates are provided as-is at the time of purchase. Major updates or new versions are released as separate products.</p>
            </div>
          </div>

          <!-- FAQ Item 9 -->
          <div class="py-4">
            <button 
              class="flex items-center justify-between w-full text-left"
              @click="toggleFaq('hosting')"
            >
              <h3 class="text-base font-medium text-gray-900 pr-4">Do you provide web hosting?</h3>
              <Icon 
                name="heroicons:chevron-down" 
                class="w-4 h-4 text-gray-500 transform transition-transform flex-shrink-0" 
                :class="{ 'rotate-180': openFaq === 'hosting' }"
              />
            </button>
            <div v-if="openFaq === 'hosting'" class="mt-3 text-sm text-gray-600 leading-relaxed">
              <p>No, we only provide templates. You'll need your own web hosting service. We can recommend hosting providers during support.</p>
            </div>
          </div>

          <!-- FAQ Item 10 -->
          <div class="py-4">
            <button 
              class="flex items-center justify-between w-full text-left"
              @click="toggleFaq('requirements')"
            >
              <h3 class="text-base font-medium text-gray-900 pr-4">What technical skills do I need?</h3>
              <Icon 
                name="heroicons:chevron-down" 
                class="w-4 h-4 text-gray-500 transform transition-transform flex-shrink-0" 
                :class="{ 'rotate-180': openFaq === 'requirements' }"
              />
            </button>
            <div v-if="openFaq === 'requirements'" class="mt-3 text-sm text-gray-600 leading-relaxed">
              <p>Basic HTML/CSS knowledge is helpful for customization. Templates include detailed documentation, and our support team can help with setup.</p>
            </div>
          </div>

          <!-- FAQ Item 11 -->
          <div class="py-4">
            <button 
              class="flex items-center justify-between w-full text-left"
              @click="toggleFaq('multiple')"
            >
              <h3 class="text-base font-medium text-gray-900 pr-4">Can I use templates for multiple websites?</h3>
              <Icon 
                name="heroicons:chevron-down" 
                class="w-4 h-4 text-gray-500 transform transition-transform flex-shrink-0" 
                :class="{ 'rotate-180': openFaq === 'multiple' }"
              />
            </button>
            <div v-if="openFaq === 'multiple'" class="mt-3 text-sm text-gray-600 leading-relaxed">
              <p>Yes! Your license allows unlimited use for personal and commercial projects. Create as many websites as you want.</p>
            </div>
          </div>

          <!-- FAQ Item 12 -->
          <div class="py-4 border-b-0">
            <button 
              class="flex items-center justify-between w-full text-left"
              @click="toggleFaq('contact')"
            >
              <h3 class="text-base font-medium text-gray-900 pr-4">How can I contact support?</h3>
              <Icon 
                name="heroicons:chevron-down" 
                class="w-4 h-4 text-gray-500 transform transition-transform flex-shrink-0" 
                :class="{ 'rotate-180': openFaq === 'contact' }"
              />
            </button>
            <div v-if="openFaq === 'contact'" class="mt-3 text-sm text-gray-600 leading-relaxed">
              <p>Email us at <a href="mailto:support@miracute.com" class="text-brand-brown hover:text-brand-brown/80 font-medium">support@miracute.com</a> with your questions. We typically respond within 24 hours.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Simple Contact -->
      <div class="mt-8 text-center">
        <p class="text-gray-600 text-sm">
          Still have questions? <a href="mailto:support@miracute.com" class="text-brand-brown hover:text-brand-brown/80 font-medium">Contact support</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

// FAQ state
const openFaq = ref<string | null>(null)

const toggleFaq = (faqId: string) => {
  openFaq.value = openFaq.value === faqId ? null : faqId
}

// SEO
useSeoMeta({
  title: 'Help & Support | Miracute',
  description: 'Find answers to common questions about Miracute templates. Get help with downloads, customization, and more from our support team.',
  keywords: 'help, support, FAQ, templates, download, customization, setup',
})
</script>