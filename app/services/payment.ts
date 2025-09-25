// Centralized Payment Facade wrapping Stripe methods (card, Apple/Google Pay, PayPal via Stripe)
import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js'

interface InitResult {
  stripe: Stripe
  elements: StripeElements
}

async function init(publicKey: string): Promise<InitResult> {
  const stripe = await loadStripe(publicKey)
  if (!stripe) {
    throw new Error('Failed to initialize Stripe')
  }
  const elements = stripe.elements()
  return { stripe, elements }
}

export const PaymentService = {
  async createCheckoutSession(payload: Record<string, unknown>) {
    return await $fetch('/api/payments/create-checkout-session', { method: 'POST', body: payload })
  },

  async confirmCardPayment(clientSecret: string, stripePublicKey: string) {
    const { stripe } = await init(stripePublicKey)
    const result = await stripe.confirmCardPayment(clientSecret)
    if (result.error) { throw result.error }
    return result.paymentIntent
  },

  async confirmAppleGooglePay(clientSecret: string, stripePublicKey: string) {
    const { stripe } = await init(stripePublicKey)
    const result = await stripe.confirmPayment({ clientSecret, confirmParams: {} })
    if (result.error) { throw result.error }
    return result.paymentIntent
  },

  // PayPal via Stripe (if enabled in account and Payment Element)
  async confirmWalletPayment(clientSecret: string, stripePublicKey: string) {
    const { stripe } = await init(stripePublicKey)
    const result = await stripe.confirmPayment({ clientSecret, confirmParams: {} })
    if (result.error) { throw result.error }
    return result.paymentIntent
  }
}


