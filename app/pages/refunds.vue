<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Breadcrumb -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-3">
          <nav class="flex items-center space-x-2 text-sm">
            <NuxtLink to="/" class="text-gray-500 hover:text-brand-brown transition-colors">Home</NuxtLink>
            <Icon name="heroicons:chevron-right" class="w-4 h-4 text-gray-400" />
            <span class="text-gray-900 font-medium">Refund Policy</span>
          </nav>
        </div>
      </div>
    </div>

    <!-- Header -->
    <div class="bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-3">Refund Policy</h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          We evaluate each refund request individually and provide 30 days of comprehensive support
        </p>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Key Points -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div class="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Icon name="heroicons:scale" class="w-5 h-5 mr-2 text-brand-brown" />
            Case-by-Case Review
          </h2>
          <p class="text-gray-600 text-sm leading-relaxed">
            We don't offer automatic refunds. Instead, we carefully review each request and work with you to resolve issues.
          </p>
        </div>

        <div class="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Icon name="heroicons:shield-check" class="w-5 h-5 mr-2 text-brand-brown" />
            30-Day Support Guarantee
          </h2>
          <p class="text-gray-600 text-sm leading-relaxed">
            Your purchase includes 30 days of full support, technical help, and customization assistance.
          </p>
        </div>
      </div>

      <!-- Process Overview -->
      <div class="mb-12 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Our Process</h2>
        
        <div class="space-y-6">
          <!-- Step 1 -->
          <div class="flex items-start space-x-4">
            <div class="w-8 h-8 bg-brand-brown text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
              1
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-1">Submit Request</h3>
              <p class="text-gray-600 text-sm">Email us your refund request with order details</p>
            </div>
          </div>
          
          <!-- Step 2 -->
          <div class="flex items-start space-x-4">
            <div class="w-8 h-8 bg-brand-brown text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
              2
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-1">Review</h3>
              <p class="text-gray-600 text-sm">We evaluate your specific case individually</p>
            </div>
          </div>
          
          <!-- Step 3 -->
          <div class="flex items-start space-x-4">
            <div class="w-8 h-8 bg-brand-brown text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
              3
            </div>
            <div>
              <h3 class="font-semibold text-gray-900 mb-1">Response</h3>
              <p class="text-gray-600 text-sm">Decision communicated within a few hours</p>
            </div>
          </div>
        </div>
      </div>

      <!-- What We Consider -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        <div class="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 mr-2 text-brand-brown" />
            We May Consider Refunds For
          </h3>
          <ul class="space-y-3 text-gray-600 text-sm">
            <li class="flex items-start">
              <span class="w-1.5 h-1.5 bg-brand-brown rounded-full mr-3 mt-2 flex-shrink-0"></span>
              Template doesn't match preview/description
            </li>
            <li class="flex items-start">
              <span class="w-1.5 h-1.5 bg-brand-brown rounded-full mr-3 mt-2 flex-shrink-0"></span>
              Files are corrupted or incomplete
            </li>
            <li class="flex items-start">
              <span class="w-1.5 h-1.5 bg-brand-brown rounded-full mr-3 mt-2 flex-shrink-0"></span>
              Technical issues we can't resolve through support
            </li>
            <li class="flex items-start">
              <span class="w-1.5 h-1.5 bg-brand-brown rounded-full mr-3 mt-2 flex-shrink-0"></span>
              Accidental duplicate purchase
            </li>
          </ul>
        </div>

        <div class="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
          <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Icon name="heroicons:light-bulb" class="w-5 h-5 mr-2 text-brand-brown" />
            Try Our Support First
          </h3>
          <ul class="space-y-3 text-gray-600 text-sm">
            <li class="flex items-start">
              <span class="w-1.5 h-1.5 bg-brand-brown rounded-full mr-3 mt-2 flex-shrink-0"></span>
              Contact support for technical help
            </li>
            <li class="flex items-start">
              <span class="w-1.5 h-1.5 bg-brand-brown rounded-full mr-3 mt-2 flex-shrink-0"></span>
              Request customization assistance
            </li>
            <li class="flex items-start">
              <span class="w-1.5 h-1.5 bg-brand-brown rounded-full mr-3 mt-2 flex-shrink-0"></span>
              Use your 30-day support guarantee
            </li>
            <li class="flex items-start">
              <span class="w-1.5 h-1.5 bg-brand-brown rounded-full mr-3 mt-2 flex-shrink-0"></span>
              Review setup documentation
            </li>
          </ul>
        </div>
      </div>

      <!-- Contact Section -->
      <div class="bg-white border border-gray-200 p-8 rounded-xl shadow-sm text-center">
        <h2 class="text-xl font-bold text-gray-900 mb-3">Need to Submit a Refund Request?</h2>
        <p class="text-gray-600 mb-6 max-w-2xl mx-auto text-sm">
          Before requesting a refund, we encourage you to contact our support team. We're here to help you succeed with your template.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <a 
            href="mailto:support@miracute.com?subject=Support Request" 
            class="bg-brand-brown text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-brown/90 transition-colors text-sm"
          >
            Get Support First
          </a>
          <a 
            href="mailto:support@miracute.com?subject=Refund Request&body=Order number:%0APurchase date:%0AEmail used:%0AReason for refund:%0A%0A(Please provide detailed information about your issue)" 
            class="bg-white border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:border-brand-brown hover:text-brand-brown transition-colors text-sm"
          >
            Submit Refund Request
          </a>
        </div>

        <p class="text-gray-500 text-xs mt-4">
          Response time: a few hours
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

// SEO
useSeoMeta({
  title: 'Refund Policy | Miracute',
  description: 'Learn about Miracute\'s 30-day money-back guarantee and refund policy. Simple process, fair terms, and quick processing times.',
  keywords: 'refund policy, money back guarantee, refunds, returns, policy, terms',
})
</script>