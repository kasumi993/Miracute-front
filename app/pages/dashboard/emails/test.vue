<template>
  <!-- Admin Loading State -->
  <AdminLoader v-if="isCheckingAccess" />

  <!-- Admin Content -->
  <div v-else-if="hasAdminAccess">
    <!-- Header -->
    <div class="mb-4 sm:mb-6 lg:mb-8">
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl lg:text-3xl font-heading font-medium text-gray-900">Email Testing</h1>
        <p class="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Test email templates with sample data and preview functionality</p>
      </div>
    </div>

    <!-- Quick Test Section -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Quick Test</h2>
      <div class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-2">
            <label for="test-email" class="block text-sm font-medium text-gray-700">Test Email Address</label>
            <input
              id="test-email"
              v-model="testForm.email"
              type="email"
              class="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-brown focus:ring-brand-brown sm:text-sm"
              placeholder="your-email@example.com"
              required
            />
          </div>

          <div class="space-y-2">
            <label for="email-type" class="block text-sm font-medium text-gray-700">Email Type</label>
            <select id="email-type" v-model="testForm.type" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-brown focus:ring-brand-brown sm:text-sm">
              <option value="order-confirmation">Order Confirmation</option>
              <option value="review-request">Review Request</option>
              <option value="admin-review-notification">Admin Review Notification</option>
              <option value="welcome">Welcome Email</option>
              <option value="password-reset">Password Reset</option>
              <option value="test">Test Email</option>
            </select>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700">&nbsp;</label>
            <button
              @click="sendTestEmail"
              :disabled="!testForm.email || sending"
              class="w-full bg-brand-brown text-white px-4 py-2 rounded-md hover:bg-brand-brown/90 focus:outline-none focus:ring-2 focus:ring-brand-brown focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ sending ? 'Sending...' : '📧 Send Test Email' }}
            </button>
          </div>
        </div>

        <div v-if="testForm.type" class="bg-gray-50 rounded-lg p-4 border-l-4 border-brand-brown">
          <h4 class="font-medium text-gray-900 mb-2">{{ getEmailTypeInfo(testForm.type).title }}</h4>
          <p class="text-gray-600 mb-3">{{ getEmailTypeInfo(testForm.type).description }}</p>
          <div class="text-sm">
            <strong class="text-gray-700">Sample data used:</strong>
            <pre class="mt-2 bg-white p-3 rounded border overflow-x-auto text-xs">{{ JSON.stringify(getSampleData(testForm.type), null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Test Results -->
    <div v-if="testResults.length > 0" class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Test Results</h2>
      <div class="space-y-4 mb-6">
        <div
          v-for="result in testResults"
          :key="result.id"
          class="border rounded-lg p-4"
          :class="result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'"
        >
          <div class="flex justify-between items-start mb-3">
            <div class="font-medium text-gray-900">{{ getEmailTypeInfo(result.type).title }}</div>
            <div class="text-sm text-gray-500">{{ formatTime(result.timestamp) }}</div>
          </div>

          <div class="space-y-2 text-sm">
            <div>
              <span class="font-medium text-gray-700">Recipient:</span> {{ result.recipient }}
            </div>

            <div v-if="result.success">
              <span class="font-medium text-gray-700">Status:</span>
              <span class="text-green-600 font-medium">✅ Sent Successfully</span>
            </div>

            <div v-if="result.success && result.messageId">
              <span class="font-medium text-gray-700">Message ID:</span> {{ result.messageId }}
            </div>

            <div v-if="result.success && result.message">
              <span class="font-medium text-gray-700">Message:</span> {{ result.message }}
            </div>

            <div v-if="!result.success">
              <span class="font-medium text-gray-700">Status:</span>
              <span class="text-red-600 font-medium">❌ Failed</span>
            </div>

            <div v-if="!result.success" class="text-red-600">
              <span class="font-medium text-gray-700">Error:</span> {{ result.error }}
            </div>
          </div>
        </div>
      </div>

      <div class="text-center">
        <button @click="clearResults" class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors">
          🗑️ Clear Results
        </button>
      </div>
    </div>

    <!-- Email Templates Preview -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Email Templates</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="template in emailTypes"
          :key="template.type"
          class="border border-gray-200 rounded-lg p-4 hover:border-brand-brown hover:shadow-md transition-all cursor-pointer"
          @click="previewTemplate(template.type)"
        >
          <div class="text-3xl text-center mb-3">{{ template.icon }}</div>
          <h3 class="font-medium text-gray-900 text-center mb-2">{{ template.title }}</h3>
          <p class="text-sm text-gray-600 text-center mb-4">{{ template.description }}</p>
          <div class="flex gap-2 justify-center">
            <button class="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors">
              👁️ Preview
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="previewingTemplate" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click="closePreview">
      <div class="bg-white rounded-lg shadow-xl max-w-5xl w-full h-5/6 mx-4 flex flex-col" @click.stop>
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Preview: {{ getEmailTypeInfo(previewingTemplate).title }}</h3>
          <button @click="closePreview" class="text-gray-400 hover:text-gray-600">
            <Icon name="heroicons:x-mark" class="w-6 h-6" />
          </button>
        </div>

        <div class="flex-1 p-6 flex flex-col">
          <div class="mb-4">
            <button
              @click="sendTestEmailFromPreview"
              :disabled="!testForm.email || sending"
              class="bg-brand-brown text-white px-4 py-2 rounded-md hover:bg-brand-brown/90 focus:outline-none focus:ring-2 focus:ring-brand-brown focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ sending ? 'Sending...' : `📧 Send to ${testForm.email || 'email'}` }}
            </button>
          </div>

          <div class="flex-1 border border-gray-300 rounded-lg overflow-hidden">
            <iframe
              :srcdoc="templatePreview"
              class="w-full h-full border-0"
              sandbox="allow-same-origin"
            ></iframe>
          </div>
        </div>

        <div class="p-6 border-t border-gray-200 text-right">
          <button @click="closePreview" class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="fixed inset-0 z-40 flex items-center justify-center bg-white bg-opacity-80">
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <div class="flex items-center space-x-3">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-brown"></div>
          <span class="text-gray-600">Loading preview...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Admin Guard
const { isCheckingAccess, hasAdminAccess } = useAdminGuard()

// Toast notifications
const { success, error } = useToast()

// Middleware and SEO
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

useSeoMeta({
  title: 'Email Testing | Dashboard',
  description: 'Test email templates with sample data and preview functionality',
  robots: 'noindex, nofollow'
})

// State
const testForm = ref({
  email: '',
  type: 'order-confirmation'
})

const testResults = ref([])
const sending = ref(false)
const loading = ref(false)
const previewingTemplate = ref(null)
const templatePreview = ref('')

// Email type definitions
const emailTypes = ref([
  {
    type: 'order-confirmation',
    title: 'Order Confirmation',
    description: 'Sent immediately after successful order placement',
    icon: '📋'
  },
  {
    type: 'review-request',
    title: 'Review Request',
    description: 'Sent to customers to request product reviews',
    icon: '⭐'
  },
  {
    type: 'admin-review-notification',
    title: 'Admin Review Notification',
    description: 'Sent to admins when new reviews are submitted',
    icon: '🔔'
  },
  {
    type: 'welcome',
    title: 'Welcome Email',
    description: 'Sent to new users when they register',
    icon: '👋'
  },
  {
    type: 'password-reset',
    title: 'Password Reset',
    description: 'Sent when users request password reset',
    icon: '🔐'
  },
  {
    type: 'test',
    title: 'Test Email',
    description: 'Simple test email to verify system functionality',
    icon: '🧪'
  }
])

// Available templates from server
const availableTemplates = ref([])
const loadingTemplates = ref(false)

// Methods
const getEmailTypeInfo = (type) => {
  return emailTypes.value.find(t => t.type === type) || { title: type, description: '', icon: '📧' }
}

// Load available templates on mount
const loadTemplates = async () => {
  loadingTemplates.value = true
  try {
    const response = await $fetch('/api/email/templates')
    if (response.success) {
      availableTemplates.value = response.data

      // Add any templates not in our predefined list
      response.data.forEach(template => {
        if (!emailTypes.value.find(t => t.type === template.name)) {
          emailTypes.value.push({
            type: template.name,
            title: template.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: `Custom template: ${template.name}`,
            icon: '📧'
          })
        }
      })
    }
  } catch (error) {
    console.error('Failed to load templates:', error)
  } finally {
    loadingTemplates.value = false
  }
}

// Load templates when component mounts
onMounted(() => {
  loadTemplates()
})

const getSampleData = (type) => {
  const baseData = {
    'order-confirmation': {
      orderId: 'TEST-001',
      customerName: 'John Doe',
      customerEmail: testForm.value.email || 'test@example.com',
      orderDate: new Date().toISOString(),
      totalAmount: '$99.99',
      items: [{ productName: 'Sample Website Template', quantity: 1, unitPrice: '$99.99' }]
    },
    'review-request': {
      orderId: 'TEST-001',
      customerName: 'John Doe',
      customerEmail: testForm.value.email || 'test@example.com',
      items: [{ productId: 'test-product', productName: 'Sample Website Template' }]
    },
    'admin-review-notification': {
      productName: 'Sample Website Template',
      rating: 5,
      title: 'Great template!',
      comment: 'This is a test review.',
      customerName: 'John Doe',
      isVerified: true
    }
  }

  return baseData[type] || {}
}

const sendTestEmail = async () => {
  if (!testForm.value.email) return

  sending.value = true
  try {
    const response = await $fetch('/api/email/test', {
      method: 'POST',
      body: {
        type: testForm.value.type,
        email: testForm.value.email
      }
    })

    // Add to results
    testResults.value.unshift({
      id: Date.now(),
      type: testForm.value.type,
      recipient: testForm.value.email,
      success: response.success,
      message: response.message,
      messageId: response.data?.messageId,
      timestamp: new Date(),
      error: null
    })

    // Show success notification
    success(`✅ Test email sent successfully to ${testForm.value.email}`, { duration: 5000 })
  } catch (error) {
    console.error('Test email failed:', error)

    // Add error to results
    testResults.value.unshift({
      id: Date.now(),
      type: testForm.value.type,
      recipient: testForm.value.email,
      success: false,
      message: null,
      messageId: null,
      timestamp: new Date(),
      error: error.data?.message || error.message || 'Unknown error'
    })

    // Show error notification
    error(`❌ Failed to send test email: ${error.data?.message || error.message || 'Unknown error'}`, { duration: 7000 })
  } finally {
    sending.value = false
  }
}

const sendTestEmailFromPreview = async () => {
  testForm.value.type = previewingTemplate.value
  await sendTestEmail()
  closePreview()
}

const previewTemplate = async (type) => {
  previewingTemplate.value = type
  loading.value = true

  try {
    // Get real template preview from API
    const response = await $fetch('/api/email/preview', {
      method: 'POST',
      body: {
        templateName: type,
        data: {
          recipientEmail: testForm.value.email || 'preview@example.com',
          recipientName: 'Preview User'
        }
      }
    })

    if (response.success) {
      templatePreview.value = response.data.html
    } else {
      throw new Error(response.error || 'Failed to load preview')
    }
  } catch (error) {
    console.error('Preview failed:', error)

    // Fallback to simple preview
    templatePreview.value = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .preview-notice { background: #f0f8ff; border: 1px solid #0066cc; padding: 10px; margin-bottom: 20px; border-radius: 4px; }
            .error-notice { background: #ffe6e6; border: 1px solid #cc0000; padding: 10px; margin-bottom: 20px; border-radius: 4px; color: #cc0000; }
          </style>
        </head>
        <body>
          <div class="error-notice">
            <strong>Preview Error:</strong> ${error.message}<br>
            Template: ${getEmailTypeInfo(type).title}
          </div>
          <p><strong>Sample data would be:</strong></p>
          <pre>${JSON.stringify(getSampleData(type), null, 2)}</pre>
        </body>
      </html>
    `
  } finally {
    loading.value = false
  }
}

const closePreview = () => {
  previewingTemplate.value = null
  templatePreview.value = ''
}

const clearResults = () => {
  testResults.value = []
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString()
}
</script>

