<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Hero Section -->
    <section class="bg-white border-b border-gray-200">
      <div class="container-custom py-16">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl sm:text-5xl font-heading font-medium text-gray-900 mb-6">
            Get in Touch
          </h1>
          <p class="text-xl text-gray-600">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
      </div>
    </section>

    <div class="container-custom py-16">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <!-- Contact Form -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 class="text-2xl font-heading font-medium text-gray-900 mb-6">Send us a Message</h2>
          
          <form @submit.prevent="submitForm" class="space-y-6">
            <!-- Name -->
            <div>
              <label for="name" class="form-label">Full Name *</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                :class="[
                  'form-input',
                  errors.name ? 'border-red-500' : 'focus:ring-brand-sage'
                ]"
                placeholder="Your full name"
              >
              <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="form-label">Email Address *</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                :class="[
                  'form-input',
                  errors.email ? 'border-red-500' : 'focus:ring-brand-sage'
                ]"
                placeholder="your.email@example.com"
              >
              <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
            </div>

            <!-- Subject -->
            <div>
              <label for="subject" class="form-label">Subject *</label>
              <select
                id="subject"
                v-model="form.subject"
                required
                :class="[
                  'form-input',
                  errors.subject ? 'border-red-500' : 'focus:ring-brand-sage'
                ]"
              >
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="support">Technical Support</option>
                <option value="billing">Billing Question</option>
                <option value="template-request">Template Request</option>
                <option value="partnership">Partnership Opportunity</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
              </select>
              <p v-if="errors.subject" class="mt-1 text-sm text-red-600">{{ errors.subject }}</p>
            </div>

            <!-- Order Number (optional) -->
            <div>
              <label for="orderNumber" class="form-label">Order Number (if applicable)</label>
              <input
                id="orderNumber"
                v-model="form.orderNumber"
                type="text"
                class="form-input focus:ring-brand-sage"
                placeholder="MRC-20241225-0001"
              >
            </div>

            <!-- Message -->
            <div>
              <label for="message" class="form-label">Message *</label>
              <textarea
                id="message"
                v-model="form.message"
                rows="6"
                required
                :class="[
                  'form-input',
                  errors.message ? 'border-red-500' : 'focus:ring-brand-sage'
                ]"
                placeholder="Tell us how we can help you..."
              ></textarea>
              <p v-if="errors.message" class="mt-1 text-sm text-red-600">{{ errors.message }}</p>
            </div>

            <!-- Privacy Consent -->
            <div class="flex items-start space-x-2">
              <input
                id="consent"
                v-model="form.consent"
                type="checkbox"
                required
                class="h-4 w-4 text-brand-sage focus:ring-brand-sage border-gray-300 rounded mt-0.5"
              >
              <label for="consent" class="text-sm text-gray-700">
                I consent to having this website store my submitted information so they can respond to my inquiry. *
              </label>
            </div>
            <p v-if="errors.consent" class="text-sm text-red-600">{{ errors.consent }}</p>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isSubmitting"
              class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!isSubmitting">Send Message</span>
              <span v-else class="flex items-center justify-center space-x-2">
                <NuxtIcon name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
                <span>Sending...</span>
              </span>
            </button>
          </form>

          <!-- Success Message -->
          <div v-if="showSuccess" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center space-x-2">
              <NuxtIcon name="heroicons:check-circle" class="w-5 h-5 text-green-600" />
              <p class="text-sm text-green-800">
                Thank you for your message! We'll get back to you within 24 hours.
              </p>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="space-y-8">
          <!-- Contact Details -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 class="text-2xl font-heading font-medium text-gray-900 mb-6">Contact Information</h2>
            
            <div class="space-y-6">
              <div class="flex items-start space-x-4">
                <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <NuxtIcon name="heroicons:envelope" class="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 class="font-medium text-gray-900 mb-1">Email</h3>
                  <p class="text-gray-600">support@miracute.com</p>
                  <p class="text-sm text-gray-500">We typically respond within 24 hours</p>
                </div>
              </div>

              <div class="flex items-start space-x-4">
                <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <NuxtIcon name="heroicons:chat-bubble-left-ellipsis" class="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 class="font-medium text-gray-900 mb-1">Live Chat</h3>
                  <p class="text-gray-600">Available on our website</p>
                  <p class="text-sm text-gray-500">Monday - Friday, 9 AM - 6 PM EST</p>
                </div>
              </div>

              <div class="flex items-start space-x-4">
                <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <NuxtIcon name="heroicons:map-pin" class="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 class="font-medium text-gray-900 mb-1">Address</h3>
                  <p class="text-gray-600">
                    123 Design Street<br>
                    Creative District<br>
                    New York, NY 10001
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- FAQ Section -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 class="text-2xl font-heading font-medium text-gray-900 mb-6">Frequently Asked Questions</h2>
            
            <div class="space-y-6">
              <div>
                <h3 class="font-medium text-gray-900 mb-2">How long does it take to receive my download?</h3>
                <p class="text-sm text-gray-600">Downloads are available immediately after successful payment. You'll also receive an email with your download links.</p>
              </div>

              <div>
                <h3 class="font-medium text-gray-900 mb-2">Can I customize the templates?</h3>
                <p class="text-sm text-gray-600">Yes! All our templates are fully customizable. You can change colors, fonts, text, and images to match your brand.</p>
              </div>

              <div>
                <h3 class="font-medium text-gray-900 mb-2">Do you offer refunds?</h3>
                <p class="text-sm text-gray-600">We offer a 30-day money-back guarantee if you're not satisfied with your purchase. Contact us for assistance.</p>
              </div>

              <div>
                <h3 class="font-medium text-gray-900 mb-2">Can I use templates for client work?</h3>
                <p class="text-sm text-gray-600">Yes, our standard license allows you to use templates for client projects. Check our license terms for full details.</p>
              </div>
            </div>

            <div class="mt-6 pt-6 border-t border-gray-200">
              <NuxtLink to="/help" class="text-brand-brown hover:text-brand-brown/80 font-medium">
                View all FAQs →
              </NuxtLink>
            </div>
          </div>

          <!-- Response Time -->
          <div class="bg-gradient-to-r from-brand-pink to-brand-sage rounded-2xl p-6 text-center">
            <h3 class="text-lg font-heading font-medium text-gray-900 mb-2">Quick Response Guarantee</h3>
            <p class="text-gray-700">We respond to all inquiries within 24 hours, often much sooner!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// SEO
useSeoMeta({
  title: 'Contact Us | Miracute - We\'re Here to Help',
  description: 'Get in touch with the Miracute team. We\'re here to help with any questions about our website templates, billing, or technical support.',
  keywords: 'contact miracute, customer support, template help, billing questions, technical support',
  ogTitle: 'Contact Us | Miracute',
  ogDescription: 'Get in touch with our team. We\'re here to help with any questions about our website templates.',
  ogImage: '/images/og-contact.jpg'
})

// Form state
const form = reactive({
  name: '',
  email: '',
  subject: '',
  orderNumber: '',
  message: '',
  consent: false
})

const errors = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
  consent: ''
})

const isSubmitting = ref(false)
const showSuccess = ref(false)

// Methods
const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  let isValid = true

  // Name validation
  if (!form.name.trim()) {
    errors.name = 'Name is required'
    isValid = false
  }

  // Email validation
  if (!form.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  // Subject validation
  if (!form.subject) {
    errors.subject = 'Please select a subject'
    isValid = false
  }

  // Message validation
  if (!form.message.trim()) {
    errors.message = 'Message is required'
    isValid = false
  } else if (form.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters long'
    isValid = false
  }

  // Consent validation
  if (!form.consent) {
    errors.consent = 'You must consent to storing your information'
    isValid = false
  }

  return isValid
}

const submitForm = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Here you would send the form data to your backend
    // const response = await $fetch('/api/contact', {
    //   method: 'POST',
    //   body: form
    // })

    // Reset form
    Object.keys(form).forEach(key => {
      if (typeof form[key] === 'boolean') {
        form[key] = false
      } else {
        form[key] = ''
      }
    })

    showSuccess.value = true

    // Hide success message after 10 seconds
    setTimeout(() => {
      showSuccess.value = false
    }, 10000)

  } catch (error) {
    console.error('Contact form submission failed:', error)
    useToast().error('Failed to send message. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

// Auto-focus first field
onMounted(() => {
  const nameInput = document.getElementById('name')
  if (nameInput) {
    nameInput.focus()
  }
})
</script>