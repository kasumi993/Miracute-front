import Stripe from 'stripe'
import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '@/types/database'
// Importer les utilitaires centraux
import { 
    getOrderWithItems, 
    handleOrderProcessing, 
    createOrderFromSession 
} from '../../utils/paymentProcessing' 

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2023-10-16'
  })

  const supabase = serverSupabaseServiceRole<Database>(event)

  try {
    const body = await readBody(event)
    const { session_id } = body

    if (!session_id) {
      throw createError({ statusCode: 400, statusMessage: 'Session ID is required' })
    }

    // 1. Récupérer la session Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['payment_intent', 'line_items']
    })

    const paymentIntent = session.payment_intent as Stripe.PaymentIntent

    if (session.payment_status !== 'paid' || paymentIntent.status !== 'succeeded') {
      return { success: false, error: 'Payment not completed' }
    }

    let order = await getOrderWithItems(supabase, paymentIntent.id)
    let updated = false
    let created = false
    
    // 2. Tenter de trouver ou de créer la commande
    if (!order) {
      console.log('Order not found by payment_intent_id. Searching for pending order...')
      
      // La logique de recherche de commande pending est simplifiée/supprimée car le webhook
      // devrait idealement créer la commande si elle n'existe pas déjà (meilleure pratique).
      // Si la commande doit exister *avant* le webhook, le `createOrderFromSession` du webhook est le meilleur fallback.
      
      // 3. Créer la commande comme fallback (si le webhook n'a pas encore eu lieu)
      order = await createOrderFromSession(session, paymentIntent, supabase)
      created = true
    }
    
    if (!order) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to find or create order.' })
    }

    // 4. Traitement centralisé
    await handleOrderProcessing(order, supabase)

    return {
      success: true,
      order_id: order.id,
      updated,
      created,
      message: 'Order processed successfully'
    }

  } catch (error: any) {
    console.error('Payment success processing error:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({ statusCode: 500, statusMessage: 'Failed to process payment success' })
  }
})