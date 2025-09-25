<template>
  <div class="min-h-screen bg-neutral-50">
    <!-- Hero Section -->
    <section class="bg-white border-b border-gray-200">
      <div class="container-custom py-16">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl sm:text-5xl font-heading font-medium text-gray-900 mb-6">
            Let's Chat About Your Project
          </h1>
          <p class="text-xl text-gray-600 mb-4">
            Hi! I'm the designer behind every Miracute template. I'd love to help you find the perfect design for your special day or business.
          </p>
          <div class="flex items-center justify-center space-x-2 text-brand-brown">
            <Icon name="heroicons:clock" class="w-5 h-5" />
            <span class="font-medium">Usually respond within a few hours</span>
          </div>
        </div>
      </div>
    </section>

    <div class="container-custom py-16">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <!-- Contact Form -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h2 class="text-2xl font-heading font-medium text-gray-900 mb-6">Send me a Message</h2>
          
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
                <option value="wedding-help">Wedding Template Help</option>
                <option value="template-question">Template Questions</option>
                <option value="customization">Need Customization Help</option>
                <option value="canva-help">Canva Support</option>
                <option value="custom-design">Custom Design Request</option>
                <option value="billing">Order Questions</option>
                <option value="feedback">Feedback & Suggestions</option>
                <option value="other">Just Want to Say Hi</option>
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
                placeholder="Tell me about your project or how I can help you..."
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
                I consent to having my information stored so the designer can respond to my inquiry. *
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
                <Icon name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
                <span>Sending...</span>
              </span>
            </button>
          </form>

          <!-- Success Message -->
          <div v-if="showSuccess" class="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div class="flex items-center space-x-2">
              <Icon name="heroicons:check-circle" class="w-5 h-5 text-green-600" />
              <p class="text-sm text-green-800">
                Thank you for your message! I'll get back to you personally within a few hours.
              </p>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="space-y-8">
          <!-- Quick Contact -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-heading font-medium text-gray-900 mb-4">Quick Contact</h2>
            
            <div class="space-y-4">
              <!-- Email Contact -->
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-brand-sage/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="heroicons:envelope" class="w-5 h-5 text-brand-brown" />
                </div>
                <div>
                  <p class="font-medium text-gray-900">hello@miracute.com</p>
                  <p class="text-xs text-gray-500">Usually respond within 2-4 hours</p>
                </div>
              </div>

              <!-- Personal Note -->
              <div class="bg-brand-pink/10 rounded-lg p-4">
                <p class="text-sm text-gray-700">
                  <Icon name="heroicons:heart" class="w-4 h-4 inline text-brand-brown mr-1" />
                  I personally read and respond to every message. Whether you need Canva help or design advice—I'm here for you!
                </p>
              </div>
            </div>
          </div>

          <!-- FAQ Section -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 class="text-2xl font-heading font-medium text-gray-900 mb-6">Common Questions I Get</h2>
            
            <div class="space-y-3">
              <div v-for="(faq, index) in faqs" :key="index" class="border border-gray-200 rounded-lg">
                <button 
                  @click="toggleFaq(index)"
                  class="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <span class="font-medium text-gray-900 text-sm">{{ faq.question }}</span>
                  <Icon 
                    name="heroicons:chevron-down" 
                    class="w-4 h-4 text-gray-500 transition-transform duration-200"
                    :class="{ 'rotate-180': openFaq === index }"
                  />
                </button>
                <div 
                  v-show="openFaq === index"
                  class="px-4 pb-4 text-sm text-gray-600 leading-relaxed"
                >
                  {{ faq.answer }}
                </div>
              </div>
            </div>

            <div class="mt-6 pt-6 border-t border-gray-200">
              <p class="text-sm text-gray-600 mb-2">Still have questions?</p>
              <button class="text-brand-brown hover:text-brand-brown/80 font-medium" onclick="document.getElementById('message').focus()">
                Ask me directly ↑
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ContactService } from '@/services'

// SEO
useSeoMeta({
  title: 'Contact the Designer | Miracute - Personal Template Support',
  description: 'Get personal help from the designer behind Miracute templates. Questions about Canva, customization, or wedding templates? I\'m here to help personally.',
  keywords: 'contact designer, canva help, wedding template support, personal designer, template customization help',
  ogTitle: 'Contact the Designer | Miracute',
  ogDescription: 'Get personal help from the designer behind Miracute templates. Real responses, not bots.',
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

// FAQ state
const openFaq = ref(null)
const faqs = ref([
  {
    question: "Do I need Canva Pro to use your templates?",
    answer: "Nope! All my templates are designed to work perfectly with Canva's free version. You can customize everything without any paid subscription."
  },
  {
    question: "Can you help me customize a template?",
    answer: "Absolutely! I love helping customers personalize their templates. Just message me with what you need, and I'll walk you through it or even help make the changes."
  },
  {
    question: "When will you add more template categories?",
    answer: "I'm working on wellness/therapy templates this month and life coach designs next month. I prefer to take time and craft each collection thoughtfully rather than rush."
  },
  {
    question: "Do you create custom designs?",
    answer: "Yes! If you need something completely unique, I offer custom design services. Reach out and let's chat about your vision and timeline."
  },
  {
    question: "What if I'm not happy with my purchase?",
    answer: "I want you to love your templates! If something isn't working for you, message me within 30 days and I'll help fix it or offer a refund."
  }
])

// Methods
const toggleFaq = (index) => {
  openFaq.value = openFaq.value === index ? null : index
}

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
    // Send form data to API
    const response = await ContactService.submitContactForm({
      name: form.name,
      email: form.email,
      subject: form.subject,
      message: form.message,
      phone: form.orderNumber, // Using orderNumber field as additional info
      source: 'contact_form'
    })

    if (response.success) {
      // Reset form
      Object.keys(form).forEach(key => {
        if (typeof form[key] === 'boolean') {
          form[key] = false
        } else {
          form[key] = ''
        }
      })

      showSuccess.value = true
      useToast().success('Message sent successfully! We\'ll get back to you soon.')

      // Hide success message after 10 seconds
      setTimeout(() => {
        showSuccess.value = false
      }, 10000)
    } else {
      throw new Error(response.message || 'Failed to send message')
    }

  } catch (error) {
    console.error('Contact form submission failed:', error)
    const errorMessage = error.data?.message || error.message || 'Failed to send message. Please try again.'
    useToast().error(errorMessage)
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