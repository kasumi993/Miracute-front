import type { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js'

interface CheckoutSession {
  id: string
  url: string
  customer_email: string
}

interface PaymentIntent {
  id: string
  client_secret: string
  amount: number
  currency: string
  status: string
}

export const usePayments = () => {
  const config = useRuntimeConfig()

  // State
  const stripe = ref<Stripe | null>(null)
  const elements = ref<StripeElements | null>(null)
  const cardElement = ref<StripeCardElement | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Initialize Stripe
  const initializeStripe = async () => {
    if (process.server) return

    try {
      const { loadStripe } = await import('@stripe/stripe-js')
      stripe.value = await loadStripe(config.public.stripePublishableKey)
      
      if (!stripe.value) {
        throw new Error('Failed to initialize Stripe')
      }

      return stripe.value
    } catch (err: any) {
      error.value = err.message || 'Failed to initialize payment system'
      throw err
    }
  }

  // Create Elements instance
  const createElements = async () => {
    if (!stripe.value) {
      await initializeStripe()
    }

    if (stripe.value) {
      elements.value = stripe.value.elements({
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#B8C4C2', // Brand sage color
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444',
            borderRadius: '8px'
          }
        }
      })
    }

    return elements.value
  }

  // Create card element
  const createCardElement = async (container: HTMLElement) => {
    if (!elements.value) {
      await createElements()
    }

    if (elements.value) {
      cardElement.value = elements.value.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#1f2937',
            '::placeholder': {
              color: '#6b7280'
            }
          },
          invalid: {
            color: '#ef4444'
          }
        }
      })

      cardElement.value.mount(container)
      
      // Listen for changes
      cardElement.value.on('change', (event) => {
        if (event.error) {
          error.value = event.error.message
        } else {
          error.value = null
        }
      })
    }

    return cardElement.value
  }

  // Create checkout session (for hosted checkout)
  const createCheckoutSession = async (items: any[], customerEmail?: string): Promise<CheckoutSession> => {
    isLoading.value = true
    error.value = null

    try {
      const { data } = await $fetch<{ data: CheckoutSession }>('/api/payments/create-checkout-session', {
        method: 'POST',
        body: {
          items,
          customer_email: customerEmail,
          success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/cart`
        }
      })

      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to create checkout session'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Create payment intent (for custom checkout)
  const createPaymentIntent = async (amount: number, currency: string = 'usd'): Promise<PaymentIntent> => {
    isLoading.value = true
    error.value = null

    try {
      const { data } = await $fetch<{ data: PaymentIntent }>('/api/payments/create-intent', {
        method: 'POST',
        body: {
          amount,
          currency
        }
      })

      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to create payment intent'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Confirm payment with card element
  const confirmPayment = async (clientSecret: string, customerInfo: any) => {
    if (!stripe.value || !cardElement.value) {
      throw new Error('Stripe not initialized')
    }

    isLoading.value = true
    error.value = null

    try {
      const { error: stripeError, paymentIntent } = await stripe.value.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement.value,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            address: customerInfo.address
          }
        }
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      return paymentIntent
    } catch (err: any) {
      error.value = err.message || 'Payment failed'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Redirect to Stripe Checkout
  const redirectToCheckout = async (sessionId: string) => {
    if (!stripe.value) {
      await initializeStripe()
    }

    if (stripe.value) {
      const { error: stripeError } = await stripe.value.redirectToCheckout({
        sessionId
      })

      if (stripeError) {
        error.value = stripeError.message || 'Failed to redirect to checkout'
        throw new Error(stripeError.message)
      }
    }
  }

  // Process cart checkout (simple hosted checkout flow)
  const processCartCheckout = async (cartItems: any[], customerEmail?: string) => {
    try {
      // Create checkout session
      const session = await createCheckoutSession(cartItems, customerEmail)
      
      // Redirect to Stripe Checkout
      await redirectToCheckout(session.id)
      
    } catch (err) {
      console.error('Checkout failed:', err)
      throw err
    }
  }

  // Retrieve checkout session
  const retrieveCheckoutSession = async (sessionId: string) => {
    try {
      const { data } = await $fetch(`/api/payments/checkout-session/${sessionId}`)
      return data
    } catch (err: any) {
      error.value = err.message || 'Failed to retrieve checkout session'
      throw err
    }
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100) // Stripe amounts are in cents
  }

  // Get payment method display name
  const getPaymentMethodName = (type: string) => {
    switch (type) {
      case 'card':
        return 'Credit Card'
      case 'apple_pay':
        return 'Apple Pay'
      case 'google_pay':
        return 'Google Pay'
      case 'paypal':
        return 'PayPal'
      default:
        return 'Payment Method'
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  // Cleanup
  const cleanup = () => {
    if (cardElement.value) {
      cardElement.value.unmount()
      cardElement.value = null
    }
    elements.value = null
  }

  return {
    // State
    stripe: readonly(stripe),
    elements: readonly(elements),
    cardElement: readonly(cardElement),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Methods
    initializeStripe,
    createElements,
    createCardElement,
    createCheckoutSession,
    createPaymentIntent,
    confirmPayment,
    redirectToCheckout,
    processCartCheckout,
    retrieveCheckoutSession,
    formatCurrency,
    getPaymentMethodName,
    clearError,
    cleanup
  }
}