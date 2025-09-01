<template>
  <div class="bg-white rounded-2xl shadow-lg border border-gray-200 sticky top-8">
    <div class="p-6 border-b border-gray-100">
      <h3 class="text-xl font-semibold text-gray-900">Order Summary</h3>
    </div>
    
    <div class="p-6 space-y-6">
      <!-- Cart Items -->
      <div class="space-y-4">
        <h4 class="font-medium text-gray-900">Templates ({{ cartItems.length }})</h4>
        <div class="space-y-3">
          <div v-for="item in cartItems" :key="item.id" class="flex items-center space-x-3">
            <!-- Product Image -->
            <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                v-if="item.image" 
                :src="item.image" 
                :alt="item.name"
                class="w-full h-full object-cover"
              >
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <Icon name="heroicons:photo" class="w-6 h-6" />
              </div>
            </div>
            
            <!-- Product Info -->
            <div class="flex-1 min-w-0">
              <h5 class="text-sm font-medium text-gray-900 line-clamp-2">{{ item.name }}</h5>
              <p class="text-xs text-gray-500" v-if="item.category">{{ item.category }}</p>
            </div>
            
            <!-- Price -->
            <div class="text-sm font-semibold text-gray-900">
              ${{ parseFloat(item.price).toFixed(2) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Order Totals -->
      <div class="space-y-3 pt-4 border-t border-gray-100">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Subtotal</span>
          <span class="text-gray-900 font-medium">${{ subtotal.toFixed(2) }}</span>
        </div>
        
        
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Instant Download</span>
          <span class="text-green-600 font-medium">Free</span>
        </div>
        
        <div class="border-t pt-3">
          <div class="flex justify-between text-lg font-bold">
            <span class="text-gray-900">Total</span>
            <span class="text-brand-brown">${{ total.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Complete Order Button -->
      <Button 
        :variant="'primary'"
        :size="'lg'"
        :block="true"
        :disabled="!canComplete || isProcessing"
        :loading="isProcessing"
        @click="handleCompleteOrder"
        class="bg-gradient-to-r from-brand-brown to-brand-brown/90 hover:from-brand-brown/90 hover:to-brand-brown"
      >
        <template v-if="!isProcessing">
          <Icon name="heroicons:lock-closed" class="w-5 h-5 mr-2" />
          Complete Order - ${{ total.toFixed(2) }}
        </template>
        <template v-else>
          Processing Order...
        </template>
      </Button>

      <!-- Support Policy -->
      <div class="bg-gradient-to-br from-brand-sage/10 to-brand-pink/10 rounded-xl p-4">
        <h4 class="font-medium text-gray-900 mb-2 flex items-center">
          <Icon name="heroicons:heart" class="w-4 h-4 text-red-500 mr-2" />
          Our Promise
        </h4>
        <div class="space-y-2 text-xs text-gray-600">
          <p>✓ <strong>Instant Download:</strong> Get your templates immediately after purchase</p>
          <p>✓ <strong>Full Support:</strong> We're here to help with setup and customization</p>
          <p>✓ <strong>Quality Guarantee:</strong> Premium designs crafted by professionals</p>
        </div>
      </div>

      <!-- Trust Badges -->
      <div class="pt-4 border-t border-gray-100">
        <div class="grid grid-cols-3 gap-4 text-center text-xs text-gray-500">
          <div class="flex flex-col items-center space-y-1">
            <Icon name="heroicons:shield-check" class="w-6 h-6 text-green-500" />
            <span>SSL Secured</span>
          </div>
          <div class="flex flex-col items-center space-y-1">
            <Icon name="heroicons:arrow-down-tray" class="w-6 h-6 text-blue-500" />
            <span>Instant Access</span>
          </div>
          <div class="flex flex-col items-center space-y-1">
            <Icon name="heroicons:chat-bubble-left-right" class="w-6 h-6 text-purple-500" />
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from '~/components/UI/Button.vue'

interface Props {
  canComplete?: boolean
  isProcessing?: boolean
}

interface Emits {
  (e: 'complete-order'): void
}

const props = withDefaults(defineProps<Props>(), {
  canComplete: false,
  isProcessing: false
})

const emit = defineEmits<Emits>()

// Get cart data
const cartCounter = useCartCounter()
const cartItems = cartCounter.cartItems
const cartTotal = cartCounter.cartTotal

// Computed values
const subtotal = computed(() => cartTotal.value)
const total = computed(() => subtotal.value)

const handleCompleteOrder = () => {
  emit('complete-order')
}
</script>