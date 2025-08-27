<template>
  <footer class="bg-gray-900 text-white">
    <!-- Main Footer Content -->
    <div class="container-custom py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- Brand Section -->
        <div class="lg:col-span-2">
          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center space-x-3 mb-6 hover:opacity-80 transition-opacity">
            <NuxtImg 
              src="/logo.png"
              alt="Miracute Logo" 
              width="180"
            />
          </NuxtLink>
          
          <!-- Tagline -->
          <p class="text-brand-brown text-lg mb-4">Make Someone Smile, Every Day</p>
          
          <!-- Description -->
          <p class="text-gray-300 leading-relaxed mb-6 max-w-md">
            Beautiful, professional website templates for creative professionals and businesses. 
            Easy to customize, mobile-responsive, and ready to launch.
          </p>
          
          <!-- Newsletter Signup -->
          <div class="max-w-md">
            <h3 class="font-heading font-medium text-lg mb-3">Stay Updated</h3>
            <p class="text-gray-400 text-sm mb-4">Get notified about new templates and design tips.</p>
            
            <form @submit.prevent="subscribeNewsletter" class="flex">
              <input
                v-model="email"
                type="email"
                placeholder="Enter your email"
                required
                class="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-sage focus:border-transparent"
              >
              <button
                type="submit"
                :disabled="isSubscribing"
                class="px-6 py-3 bg-white text-gray-900 font-medium rounded-r-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="!isSubscribing">Subscribe</span>
                <Icon v-else name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
              </button>
            </form>
            
            <p v-if="subscriptionMessage" 
               :class="subscriptionSuccess ? 'text-green-400' : 'text-red-400'"
               class="text-sm mt-2">
              {{ subscriptionMessage }}
            </p>
          </div>
        </div>
        
        <!-- Quick Links -->
        <div>
          <h3 class="font-heading font-medium text-lg mb-4">Templates</h3>
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/categories/wedding-templates" class="text-gray-300 hover:text-white transition-colors">
                Wedding Templates
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/categories/business-templates" class="text-gray-300 hover:text-white transition-colors">
                Business Templates
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/categories/therapist-templates" class="text-gray-300 hover:text-white transition-colors">
                Therapist Templates
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/categories/portfolio-templates" class="text-gray-300 hover:text-white transition-colors">
                Portfolio Templates
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/templates" class="text-white font-medium hover:text-gray-300 transition-colors">
                View All Templates →
              </NuxtLink>
            </li>
          </ul>
        </div>
        
        <!-- Support -->
        <div>
          <h3 class="font-heading font-medium text-lg mb-4">Support</h3>
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/help" class="text-gray-300 hover:text-white transition-colors">
                Help Center
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/contact" class="text-gray-300 hover:text-white transition-colors">
                Contact Us
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/faq" class="text-gray-300 hover:text-white transition-colors">
                FAQ
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/blog" class="text-gray-300 hover:text-white transition-colors">
                Blog
              </NuxtLink>
            </li>
            <li>
              <a href="mailto:support@miracute.com" class="text-gray-300 hover:text-white transition-colors">
                support@miracute.com
              </a>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Social Links -->
      <div class="flex justify-center space-x-6 mt-12 pt-8 border-t border-gray-800">
        <a href="#" class="text-gray-400 hover:text-white transition-colors">
          <Icon name="heroicons:heart" class="w-6 h-6" />
          <span class="sr-only">Pinterest</span>
        </a>
        <a href="#" class="text-gray-400 hover:text-white transition-colors">
          <Icon name="heroicons:chat-bubble-left-ellipsis" class="w-6 h-6" />
          <span class="sr-only">Instagram</span>
        </a>
        <a href="#" class="text-gray-400 hover:text-white transition-colors">
          <Icon name="heroicons:globe-alt" class="w-6 h-6" />
          <span class="sr-only">Twitter</span>
        </a>
        <a href="#" class="text-gray-400 hover:text-white transition-colors">
          <Icon name="heroicons:envelope" class="w-6 h-6" />
          <span class="sr-only">Facebook</span>
        </a>
      </div>
    </div>
    
    <!-- Bottom Bar -->
    <div class="border-t border-gray-800 bg-gray-950">
      <div class="container-custom py-6">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <!-- Copyright -->
          <div class="text-gray-400 text-sm">
            © {{ currentYear }} Miracute. All rights reserved.
          </div>
          
          <!-- Legal Links -->
          <div class="flex space-x-6 text-sm">
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
      <div class="container-custom py-4">
        <div class="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-8 text-xs text-gray-500">
          <div class="flex items-center space-x-2">
            <Icon name="heroicons:shield-check" class="w-4 h-4 text-green-500" />
            <span>Secure Checkout</span>
          </div>
          <div class="flex items-center space-x-2">
            <Icon name="heroicons:arrow-down-tray" class="w-4 h-4 text-blue-500" />
            <span>Instant Download</span>
          </div>
          <div class="flex items-center space-x-2">
            <Icon name="heroicons:heart" class="w-4 h-4 text-red-500" />
            <span>Customer Support</span>
          </div>
          <div class="flex items-center space-x-2">
            <Icon name="heroicons:arrow-path" class="w-4 h-4 text-yellow-500" />
            <span>30-Day Guarantee</span>
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