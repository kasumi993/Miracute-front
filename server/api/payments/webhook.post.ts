import Stripe from 'stripe'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '@/types/database'
import { 
  handleOrderProcessing, 
  createOrderFromSession, 
  getOrderWithItems 
} from '../../utils/paymentProcessing' // Utilisation des utilitaires centraux

// Note: sendBrevoOrderConfirmation, sendBrevoAdminOrderNotification, sendBrevoReviewRequestEmail 
// ne sont plus directement nécessaires ici, ils sont dans paymentProcessing.ts

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2023-10-16'
  })

  const supabase = serverSupabaseServiceRole<Database>(event)

  // ... (Code de vérification du webhook inchangé) ...
  // (Laisser le code de vérification de signature tel quel)

  try {
    const body = await readRawBody(event)
    const signature = getHeader(event, 'stripe-signature')

    if (!signature || !body) {
      throw createError({ statusCode: 400, statusMessage: 'Missing signature or body' })
    }

    let stripeEvent: Stripe.Event
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        body,
        signature,
        config.stripeWebhookSecret
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      throw createError({ statusCode: 400, statusMessage: 'Invalid signature' })
    }

    console.log(`Processing webhook event: ${stripeEvent.type}`)

    // 1. Gestion des événements
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeEvent.data.object as Stripe.Checkout.Session)
        break

      case 'payment_intent.succeeded':
        // Ce handler est optionnel si checkout.session.completed gère tout
        await handlePaymentSucceeded(stripeEvent.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object as Stripe.PaymentIntent)
        break

      case 'customer.created':
        await handleCustomerCreated(stripeEvent.data.object as Stripe.Customer)
        break

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`)
    }

    return { success: true, received: true }

  } catch (error: any) {
    console.error('Webhook error:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({ statusCode: 500, statusMessage: 'Webhook processing failed' })
  }

  // --- Nouveaux Gestionnaires d'événements simplifiés ---

  async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    console.log('Processing checkout completion for session:', session.id)

    const paymentIntentId = session.payment_intent as string
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    try {
      let order = await getOrderWithItems(supabase, paymentIntentId)
      
      // 2. Si la commande n'existe pas (le cas le plus courant pour les webhooks), la créer
      if (!order) {
        console.log('Order not found by payment_intent_id. Creating from session...')
        order = await createOrderFromSession(session, paymentIntent, supabase)
      } else {
        console.log('Order found by payment_intent_id. Updating status...')
      }

      if (order) {
        // 3. Traitement centralisé
        await handleOrderProcessing(order, supabase)
      }

      // La suppression du panier est dans handleOrderProcessing
      
      console.log('Checkout completion processed successfully')

    } catch (error) {
      console.error('Error processing checkout completion:', error)
      throw error
    }
  }

  async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    // Utile pour les paiements non initiés par un checkout (ex: abonnements)
    // Pour un checkout simple, handleCheckoutCompleted est généralement suffisant
    console.log('Payment succeeded for:', paymentIntent.id)

    try {
      await supabase
        .from('orders')
        .update({ payment_status: 'paid', updated_at: new Date().toISOString() })
        .eq('stripe_payment_intent_id', paymentIntent.id)

    } catch (error) {
      console.error('Error updating payment status:', error)
      throw error
    }
  }

  // (Les autres fonctions handlePaymentFailed et handleCustomerCreated restent inchangées 
  // car elles sont spécifiques et ne se dupliquent pas avec la logique principale.)
  // ...

  async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    // Votre code existant est conservé
    console.log('Payment failed for:', paymentIntent.id)
    try {
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('stripe_payment_intent_id', paymentIntent.id)
    } catch (error) {
      console.error('Error updating failed payment:', error)
      throw error
    }
  }
  
  async function handleCustomerCreated(customer: Stripe.Customer) {
    // Votre code existant est conservé
    console.log('Customer created:', customer.id)
    if (customer.metadata?.user_id) {
      try {
        await supabase
          .from('users')
          .update({ stripe_customer_id: customer.id })
          .eq('id', customer.metadata.user_id)
      } catch (error) {
        console.error('Error linking Stripe customer to user:', error)
      }
    }
  }
})