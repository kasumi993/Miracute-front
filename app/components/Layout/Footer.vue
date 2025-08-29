<template>
  <footer class="bg-gray-900 text-white">
    <!-- Main Footer Content -->
    <div class="container-custom py-12 sm:py-16">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 sm:gap-8">
        <!-- Brand Section -->
        <div class="lg:col-span-2">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center space-x-3 mb-4 sm:mb-6 hover:opacity-80 transition-opacity">
            <NuxtImg 
              src="/logo.png"
              alt="Miracute Logo" 
              width="180"
              class="max-w-[140px] sm:max-w-[180px]"
            />
          </NuxtLink>
          
          <!-- Tagline -->
          <p class="text-brand-brown text-base sm:text-lg mb-3 sm:mb-4">Make Someone Smile, Every Day</p>
          
          <!-- Description -->
          <p class="text-gray-300 leading-relaxed mb-6 sm:mb-8 max-w-md text-sm sm:text-base">
            Where creativity meets accessibility. Professional website templates crafted with passion, not algorithms. 
            Complete bundles, genuine support, Canva Free compatible.
          </p>
          
          <!-- Newsletter Signup -->
          <div class="w-full sm:max-w-md">
            <h3 class="font-heading font-medium text-base sm:text-lg mb-2 sm:mb-3">Join Our Creative Journey</h3>
            <p class="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">Get notified about new templates and design tips.</p>
            
            <form @submit.prevent="subscribeNewsletter" class="flex flex-col sm:flex-row gap-2 sm:gap-0 w-full">
              <input
                v-model="email"
                type="email"
                placeholder="Enter your email"
                required
                class="flex-1 w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border border-gray-700 rounded-lg sm:rounded-l-lg sm:rounded-r-none text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-sage focus:border-transparent text-sm sm:text-base"
              >
              <button
                type="submit"
                :disabled="isSubscribing"
                class="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-white text-gray-900 font-medium rounded-lg sm:rounded-r-lg sm:rounded-l-none hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <span v-if="!isSubscribing">Subscribe</span>
                <Icon v-else name="heroicons:arrow-path" class="w-4 sm:w-5 h-4 sm:h-5 animate-spin" />
              </button>
            </form>
            
            <p v-if="subscriptionMessage" 
               :class="subscriptionSuccess ? 'text-green-400' : 'text-red-400'"
               class="text-xs sm:text-sm mt-2">
              {{ subscriptionMessage }}
            </p>
          </div>
        </div>
        
        <!-- Templates and Support - Side by side on mobile -->
        <div class="lg:col-span-2 grid grid-cols-2 lg:grid-cols-2 gap-8 sm:gap-8">
          <!-- Quick Links -->
          <div>
            <h3 class="font-heading font-medium text-base sm:text-lg mb-3 sm:mb-4">Templates</h3>
            <ul class="space-y-2 sm:space-y-3">
              <li>
                <NuxtLink to="/categories/wedding-templates" class="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm lg:text-base">
                  Wedding Templates
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/categories/business-templates" class="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm lg:text-base">
                  Business Templates
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/categories/therapist-templates" class="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm lg:text-base">
                  Therapist Templates
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/categories/portfolio-templates" class="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm lg:text-base">
                  Portfolio Templates
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/templates" class="text-white font-medium hover:text-gray-300 transition-colors text-xs sm:text-sm lg:text-base">
                  View All Templates →
                </NuxtLink>
              </li>
            </ul>
          </div>
          
          <!-- Support -->
          <div>
            <h3 class="font-heading font-medium text-base sm:text-lg mb-3 sm:mb-4">Support</h3>
            <ul class="space-y-2 sm:space-y-3">
              <li>
                <NuxtLink to="/help" class="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm lg:text-base">
                  Help Center
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/contact" class="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm lg:text-base">
                  Contact Us
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/faq" class="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm lg:text-base">
                  FAQ
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/blog" class="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm lg:text-base">
                  Blog
                </NuxtLink>
              </li>
              <li>
                <a href="mailto:support@miracute.com" class="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm lg:text-base break-all">
                  support@miracute.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Social Links -->
      <div class="flex justify-center space-x-4 sm:space-x-6 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-800">
        <a href="#" class="text-gray-400 hover:text-white transition-colors">
          <Icon name="heroicons:heart" class="w-5 h-5 sm:w-6 sm:h-6" />
          <span class="sr-only">Pinterest</span>
        </a>
        <a href="#" class="text-gray-400 hover:text-white transition-colors">
          <Icon name="heroicons:chat-bubble-left-ellipsis" class="w-5 h-5 sm:w-6 sm:h-6" />
          <span class="sr-only">Instagram</span>
        </a>
        <a href="#" class="text-gray-400 hover:text-white transition-colors">
          <Icon name="heroicons:globe-alt" class="w-5 h-5 sm:w-6 sm:h-6" />
          <span class="sr-only">Twitter</span>
        </a>
        <a href="#" class="text-gray-400 hover:text-white transition-colors">
          <Icon name="heroicons:envelope" class="w-5 h-5 sm:w-6 sm:h-6" />
          <span class="sr-only">Facebook</span>
        </a>
      </div>
    </div>
    
    <!-- Bottom Bar -->
    <div class="border-t border-gray-800 bg-gray-950">
      <div class="container-custom py-4 sm:py-6">
        <div class="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <!-- Copyright -->
          <div class="text-gray-400 text-xs sm:text-sm">
            © {{ currentYear }} Miracute. All rights reserved.
          </div>
          
          <!-- Legal Links -->
          <div class="flex flex-wrap justify-center sm:justify-end gap-x-4 gap-y-2 text-xs sm:text-sm">
            <NuxtLink to="/privacy" class="text-gray-400 hover:text-white transition-colors">
              Privacy Policy
            </NuxtLink>
            <NuxtLink to="/terms" class="text-gray-400 hover:text-white transition-colors">
              Terms of Service
            </NuxtLink>
            <NuxtLink to="/refunds" class="text-gray-400 hover:text-white transition-colors">
              Refund Policy
            </NuxtLink>
            <NuxtLink to="/licenses" class="text-gray-400 hover:text-white transition-colors">
              Licenses
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Trust Badges -->
    <div class="bg-gray-950 border-t border-gray-800">
      <div class="container-custom py-3 sm:py-4">
        <div class="grid grid-cols-2 sm:flex sm:justify-center gap-3 sm:gap-6 lg:gap-8 text-xs text-gray-500">
          <div class="flex items-center space-x-2 justify-center">
            <Icon name="heroicons:shield-check" class="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
            <span class="text-xs">Secure Checkout</span>
          </div>
          <div class="flex items-center space-x-2 justify-center">
            <Icon name="heroicons:arrow-down-tray" class="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
            <span class="text-xs">Instant Download</span>
          </div>
          <div class="flex items-center space-x-2 justify-center">
            <Icon name="heroicons:heart" class="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
            <span class="text-xs">Customer Support</span>
          </div>
          <div class="flex items-center space-x-2 justify-center">
            <Icon name="heroicons:arrow-path" class="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
            <span class="text-xs">30-Day Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Newsletter subscription
const email = ref('')
const isSubscribing = ref(false)
const subscriptionMessage = ref('')
const subscriptionSuccess = ref(false)

const currentYear = new Date().getFullYear()

const subscribeNewsletter = async () => {
  if (!email.value || isSubscribing.value) return
  
  isSubscribing.value = true
  subscriptionMessage.value = ''
  
  try {
    // This would connect to your email service (Mailchimp, ConvertKit, etc.)
    // For now, we'll simulate the API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate success
    subscriptionSuccess.value = true
    subscriptionMessage.value = 'Thank you for subscribing! Check your email to confirm.'
    email.value = ''
    
    // You would implement actual newsletter subscription here:
    // const { data } = await $fetch('/api/newsletter/subscribe', {
    //   method: 'POST',
    //   body: { email: email.value }
    // })
    
  } catch (error) {
    subscriptionSuccess.value = false
    subscriptionMessage.value = 'Something went wrong. Please try again.'
  } finally {
    isSubscribing.value = false
    
    // Clear message after 5 seconds
    setTimeout(() => {
      subscriptionMessage.value = ''
    }, 5000)
  }
}
</script>