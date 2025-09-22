import { defineStore } from 'pinia'
import type { CartItem } from '~/stores/product/cart'
import { PaymentService, type CheckoutSessionData, type PaymentIntentData } from '~/services'

export type PaymentMethod = 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_transfer'

export type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'review' | 'processing' | 'complete' | 'error'

export interface ShippingAddress {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

export interface BillingAddress extends ShippingAddress {
  sameAsShipping: boolean
}

export interface ShippingMethod {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
  carrier: string
}

export interface PaymentMethodInfo {
  type: PaymentMethod
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  email?: string // For PayPal
}

export interface OrderSummary {
  items: CartItem[]
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  currency: string
}

export interface ProcessedOrder {
  id: string
  orderNumber: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  currency: string
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  createdAt: string
  estimatedDelivery?: string
}

interface CheckoutState {
  // Current step in checkout process
  currentStep: CheckoutStep
  completedSteps: CheckoutStep[]

  // Customer information
  customerEmail: string
  isGuest: boolean

  // Addresses
  shippingAddress: ShippingAddress | null
  billingAddress: BillingAddress | null

  // Shipping
  selectedShippingMethod: ShippingMethod | null
  availableShippingMethods: ShippingMethod[]

  // Payment
  selectedPaymentMethod: PaymentMethod | null
  paymentMethodInfo: PaymentMethodInfo | null

  // Stripe/Payment provider data
  clientSecret: string | null
  paymentIntentId: string | null
  checkoutSessionId: string | null

  // Order data
  orderSummary: OrderSummary | null
  processedOrder: ProcessedOrder | null

  // Promo codes and discounts
  promoCode: string
  appliedDiscount: {
    code: string
    amount: number
    type: 'percentage' | 'fixed'
  } | null

  // Loading states
  loading: {
    shippingMethods: boolean
    paymentSetup: boolean
    orderProcessing: boolean
    promoCode: boolean
  }

  // Error states
  errors: {
    shipping: string | null
    payment: string | null
    order: string | null
    promo: string | null
  }

  // Checkout options
  saveShippingAddress: boolean
  savePaymentMethod: boolean
  subscribeToNewsletter: boolean
}

export const useCheckoutStore = defineStore('checkout', {
  state: (): CheckoutState => ({
    currentStep: 'cart',
    completedSteps: [],

    customerEmail: '',
    isGuest: true,

    shippingAddress: null,
    billingAddress: null,

    selectedShippingMethod: null,
    availableShippingMethods: [],

    selectedPaymentMethod: null,
    paymentMethodInfo: null,

    clientSecret: null,
    paymentIntentId: null,
    checkoutSessionId: null,

    orderSummary: null,
    processedOrder: null,

    promoCode: '',
    appliedDiscount: null,

    loading: {
      shippingMethods: false,
      paymentSetup: false,
      orderProcessing: false,
      promoCode: false
    },

    errors: {
      shipping: null,
      payment: null,
      order: null,
      promo: null
    },

    saveShippingAddress: false,
    savePaymentMethod: false,
    subscribeToNewsletter: false
  }),

  getters: {
    // Step management
    canProceedToNextStep: (state) => {
      switch (state.currentStep) {
        case 'cart':
          return state.orderSummary?.items?.length > 0
        case 'shipping':
          return !!state.shippingAddress && !!state.selectedShippingMethod
        case 'payment':
          return !!state.selectedPaymentMethod && !!state.paymentMethodInfo
        case 'review':
          return true
        default:
          return false
      }
    },

    isStepCompleted: (state) => (step: CheckoutStep) =>
      state.completedSteps.includes(step),

    // Address validation
    isShippingAddressValid: (state) => {
      const addr = state.shippingAddress
      return !!(addr?.firstName && addr?.lastName && addr?.address1 &&
                addr?.city && addr?.state && addr?.postalCode && addr?.country)
    },

    isBillingAddressValid: (state) => {
      if (state.billingAddress?.sameAsShipping) {
        return state.isShippingAddressValid
      }
      const addr = state.billingAddress
      return !!(addr?.firstName && addr?.lastName && addr?.address1 &&
                addr?.city && addr?.state && addr?.postalCode && addr?.country)
    },

    // Order calculations
    orderTotal: (state) => state.orderSummary?.total || 0,

    orderSubtotal: (state) => state.orderSummary?.subtotal || 0,

    orderTax: (state) => state.orderSummary?.tax || 0,

    orderShipping: (state) => state.orderSummary?.shipping || 0,

    orderDiscount: (state) => state.orderSummary?.discount || 0,

    // Loading states
    isLoading: (state) => Object.values(state.loading).some(loading => loading),

    hasErrors: (state) => Object.values(state.errors).some(error => !!error),

    // Payment method validation
    isPaymentMethodValid: (state) => {
      if (!state.selectedPaymentMethod) return false

      switch (state.selectedPaymentMethod) {
        case 'card':
          return !!state.clientSecret
        case 'paypal':
          return !!state.paymentMethodInfo?.email
        default:
          return !!state.paymentMethodInfo
      }
    }
  },

  actions: {
    // Step management
    setCurrentStep(step: CheckoutStep) {
      this.currentStep = step
    },

    goToNextStep() {
      const steps: CheckoutStep[] = ['cart', 'shipping', 'payment', 'review', 'processing', 'complete']
      const currentIndex = steps.indexOf(this.currentStep)

      if (currentIndex < steps.length - 1 && this.canProceedToNextStep) {
        const nextStep = steps[currentIndex + 1]
        this.markStepCompleted(this.currentStep)
        this.setCurrentStep(nextStep)
      }
    },

    goToPreviousStep() {
      const steps: CheckoutStep[] = ['cart', 'shipping', 'payment', 'review']
      const currentIndex = steps.indexOf(this.currentStep)

      if (currentIndex > 0) {
        this.setCurrentStep(steps[currentIndex - 1])
      }
    },

    goToStep(step: CheckoutStep) {
      this.setCurrentStep(step)
    },

    markStepCompleted(step: CheckoutStep) {
      if (!this.completedSteps.includes(step)) {
        this.completedSteps.push(step)
      }
    },

    // Loading management
    setLoading(type: keyof CheckoutState['loading'], loading: boolean) {
      this.loading[type] = loading
    },

    setError(type: keyof CheckoutState['errors'], error: string | null) {
      this.errors[type] = error
    },

    clearErrors() {
      Object.keys(this.errors).forEach(key => {
        this.errors[key as keyof CheckoutState['errors']] = null
      })
    },

    // Customer information
    setCustomerEmail(email: string) {
      this.customerEmail = email
    },

    setGuestCheckout(isGuest: boolean) {
      this.isGuest = isGuest
    },

    // Address management
    setShippingAddress(address: ShippingAddress) {
      this.shippingAddress = address
      this.clearErrors()
    },

    setBillingAddress(address: BillingAddress) {
      this.billingAddress = address
      this.clearErrors()
    },

    copyShippingToBilling() {
      if (this.shippingAddress) {
        this.billingAddress = {
          ...this.shippingAddress,
          sameAsShipping: true
        }
      }
    },

    // Shipping methods
    async fetchShippingMethods() {
      if (!this.shippingAddress) {
        this.setError('shipping', 'Shipping address is required')
        return
      }

      this.setLoading('shippingMethods', true)
      this.setError('shipping', null)

      try {
        const response = await PaymentService.getShippingMethods({
          address: this.shippingAddress,
          items: this.orderSummary?.items || []
        })

        if (response.success && response.data) {
          this.availableShippingMethods = response.data

          // Auto-select first method if none selected
          if (!this.selectedShippingMethod && response.data.length > 0) {
            this.setShippingMethod(response.data[0])
          }
        } else {
          throw new Error(response.error || 'Failed to fetch shipping methods')
        }
      } catch (error: any) {
        console.error('Error fetching shipping methods:', error)
        this.setError('shipping', error.message || 'Failed to fetch shipping methods')
      } finally {
        this.setLoading('shippingMethods', false)
      }
    },

    setShippingMethod(method: ShippingMethod) {
      this.selectedShippingMethod = method
      this.updateOrderSummary()
    },

    // Payment methods
    setPaymentMethod(method: PaymentMethod) {
      this.selectedPaymentMethod = method
      this.paymentMethodInfo = null
      this.clientSecret = null
      this.clearErrors()
    },

    async setupPaymentMethod() {
      if (!this.selectedPaymentMethod || !this.orderSummary) {
        this.setError('payment', 'Payment method and order summary are required')
        return
      }

      this.setLoading('paymentSetup', true)
      this.setError('payment', null)

      try {
        switch (this.selectedPaymentMethod) {
          case 'card':
            await this.setupCardPayment()
            break
          case 'paypal':
            await this.setupPayPalPayment()
            break
          default:
            throw new Error(`Unsupported payment method: ${this.selectedPaymentMethod}`)
        }
      } catch (error: any) {
        console.error('Error setting up payment method:', error)
        this.setError('payment', error.message || 'Failed to setup payment method')
      } finally {
        this.setLoading('paymentSetup', false)
      }
    },

    async setupCardPayment() {
      const paymentData: PaymentIntentData = {
        amount: this.orderTotal,
        currency: this.orderSummary?.currency || 'usd',
        customer_email: this.customerEmail,
        shipping_address: this.shippingAddress!,
        billing_address: this.billingAddress!
      }

      const response = await PaymentService.createPaymentIntent(paymentData)

      if (response.success && response.data) {
        this.clientSecret = response.data.client_secret
        this.paymentIntentId = response.data.payment_intent_id
      } else {
        throw new Error(response.error || 'Failed to setup card payment')
      }
    },

    async setupPayPalPayment() {
      const checkoutData: CheckoutSessionData = {
        items: this.orderSummary!.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price
        })),
        customer_email: this.customerEmail,
        success_url: `${window.location.origin}/checkout/success`,
        cancel_url: `${window.location.origin}/checkout/cancel`
      }

      const response = await PaymentService.createCheckoutSession(checkoutData)

      if (response.success && response.data) {
        this.checkoutSessionId = response.data.session_id
        this.paymentMethodInfo = {
          type: 'paypal',
          email: this.customerEmail
        }
      } else {
        throw new Error(response.error || 'Failed to setup PayPal payment')
      }
    },

    setPaymentMethodInfo(info: PaymentMethodInfo) {
      this.paymentMethodInfo = info
    },

    // Promo codes
    async applyPromoCode(code: string) {
      if (!code.trim()) return

      this.setLoading('promoCode', true)
      this.setError('promo', null)

      try {
        const response = await PaymentService.validatePromoCode({
          code: code.trim(),
          subtotal: this.orderSubtotal
        })

        if (response.success && response.data) {
          this.appliedDiscount = {
            code: code.trim(),
            amount: response.data.discount_amount,
            type: response.data.discount_type
          }
          this.promoCode = code.trim()
          this.updateOrderSummary()
        } else {
          throw new Error(response.error || 'Invalid promo code')
        }
      } catch (error: any) {
        console.error('Error applying promo code:', error)
        this.setError('promo', error.message || 'Failed to apply promo code')
      } finally {
        this.setLoading('promoCode', false)
      }
    },

    removePromoCode() {
      this.appliedDiscount = null
      this.promoCode = ''
      this.updateOrderSummary()
      this.setError('promo', null)
    },

    // Order management
    setOrderSummary(summary: OrderSummary) {
      this.orderSummary = summary
    },

    updateOrderSummary() {
      if (!this.orderSummary) return

      let updatedSummary = { ...this.orderSummary }

      // Update shipping cost
      if (this.selectedShippingMethod) {
        updatedSummary.shipping = this.selectedShippingMethod.price
      }

      // Apply discount
      if (this.appliedDiscount) {
        if (this.appliedDiscount.type === 'percentage') {
          updatedSummary.discount = updatedSummary.subtotal * (this.appliedDiscount.amount / 100)
        } else {
          updatedSummary.discount = this.appliedDiscount.amount
        }
      } else {
        updatedSummary.discount = 0
      }

      // Recalculate total
      updatedSummary.total = updatedSummary.subtotal + updatedSummary.tax +
                           updatedSummary.shipping - updatedSummary.discount

      this.orderSummary = updatedSummary
    },

    // Order processing
    async processOrder() {
      if (!this.canProceedToNextStep) {
        this.setError('order', 'Please complete all required fields')
        return false
      }

      this.setLoading('orderProcessing', true)
      this.setError('order', null)
      this.setCurrentStep('processing')

      try {
        const orderData = {
          customer_email: this.customerEmail,
          is_guest: this.isGuest,
          shipping_address: this.shippingAddress!,
          billing_address: this.billingAddress!,
          shipping_method: this.selectedShippingMethod!,
          payment_method: this.selectedPaymentMethod!,
          payment_intent_id: this.paymentIntentId,
          checkout_session_id: this.checkoutSessionId,
          promo_code: this.promoCode || undefined,
          order_summary: this.orderSummary!,
          preferences: {
            save_shipping_address: this.saveShippingAddress,
            save_payment_method: this.savePaymentMethod,
            subscribe_newsletter: this.subscribeToNewsletter
          }
        }

        const response = await PaymentService.processOrder(orderData)

        if (response.success && response.data) {
          this.processedOrder = response.data
          this.setCurrentStep('complete')
          return true
        } else {
          throw new Error(response.error || 'Failed to process order')
        }
      } catch (error: any) {
        console.error('Error processing order:', error)
        this.setError('order', error.message || 'Failed to process order')
        this.setCurrentStep('error')
        return false
      } finally {
        this.setLoading('orderProcessing', false)
      }
    },

    // Preferences
    setSaveShippingAddress(save: boolean) {
      this.saveShippingAddress = save
    },

    setSavePaymentMethod(save: boolean) {
      this.savePaymentMethod = save
    },

    setSubscribeToNewsletter(subscribe: boolean) {
      this.subscribeToNewsletter = subscribe
    },

    // Reset checkout
    resetCheckout() {
      this.currentStep = 'cart'
      this.completedSteps = []
      this.customerEmail = ''
      this.isGuest = true
      this.shippingAddress = null
      this.billingAddress = null
      this.selectedShippingMethod = null
      this.availableShippingMethods = []
      this.selectedPaymentMethod = null
      this.paymentMethodInfo = null
      this.clientSecret = null
      this.paymentIntentId = null
      this.checkoutSessionId = null
      this.orderSummary = null
      this.processedOrder = null
      this.promoCode = ''
      this.appliedDiscount = null
      this.clearErrors()
      this.saveShippingAddress = false
      this.savePaymentMethod = false
      this.subscribeToNewsletter = false
    },

    // Initialize checkout with cart data
    initializeCheckout(cartSummary: OrderSummary) {
      this.resetCheckout()
      this.setOrderSummary(cartSummary)
      this.setCurrentStep('shipping')
    }
  },

})