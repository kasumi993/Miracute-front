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
                <NuxtLink to="/templates?category=wedding-templates" class="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm lg:text-base">
                  Wedding Templates
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/templates?category=business-templates" class="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm lg:text-base">
                  Business Templates
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/templates?category=therapist-templates" class="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm lg:text-base">
                  Therapist Templates
                </NuxtLink>
              </li>
              <li>
                <NuxtLink to="/templates?category=portfolio-templates" class="text-gray-300 hover:text-white transition-colors text-xs sm:text-sm lg:text-base">
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
        <!-- Instagram -->
        <!-- <a href="#" class="text-gray-400 hover:text-white transition-colors">
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          <span class="sr-only">Instagram</span>
        </a> -->

        <!-- Pinterest -->
        <!-- <a href="#" class="text-gray-400 hover:text-white transition-colors">
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.741-1.378l-.742 2.832c-.269 1.041-.994 2.34-1.479 3.129C9.734 23.334 10.856 24 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
          </svg>
          <span class="sr-only">Pinterest</span>
        </a> -->

        <!-- Twitter/X -->
        <!-- <a href="#" class="text-gray-400 hover:text-white transition-colors">
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          <span class="sr-only">Twitter</span>
        </a> -->

        <!-- Facebook -->
        <!-- <a href="#" class="text-gray-400 hover:text-white transition-colors">
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span class="sr-only">Facebook</span>
        </a> -->
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