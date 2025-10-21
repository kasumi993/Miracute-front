import Stripe from 'stripe'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '@/types/database'
import { createApiError, handleSupabaseError } from '../../utils/api/apiResponse'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2023-10-16'
  })

  const supabase = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)

  try {
    const body = await readBody(event)
    const { items, customer_email, payment_method_id, save_card = false } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw createApiError('Invalid items provided', 400)
    }
    if (!customer_email) {
      throw createApiError('Customer email is required', 400)
    }

    // 1. Calcul du montant total (similaire à create-checkout-session)
    const productIds = items.map((item: any) => item.product_id)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('price')
      .in('id', productIds)
      .eq('is_active', true)

    if (productsError) {
      handleSupabaseError(productsError, 'Fetch products for payment intent')
    }
    if (!products || products.length === 0) {
      throw createApiError('No active products found.', 404)
    }

    const totalAmountCents = products.reduce((sum, product) => {
      const item = items.find((i: any) => i.product_id === product.id)
      const quantity = item?.quantity || 1
      return sum + Math.round(parseFloat(product.price as string) * 100) * quantity
    }, 0)

    // 2. Récupération ou création du client Stripe (si l'utilisateur est connu)
    let stripeCustomerId: string | undefined

    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single()

      stripeCustomerId = userData?.stripe_customer_id || (await stripe.customers.create({ email: user.email! })).id
      
      // Mettre à jour si ID non présent
      if (!userData?.stripe_customer_id) {
          await supabase.from('users').update({ stripe_customer_id: stripeCustomerId }).eq('id', user.id)
      }
    } else {
        // Pour les utilisateurs non connectés, on utilise uniquement l'e-mail ou on crée un client temporaire
        stripeCustomerId = (await stripe.customers.create({ email: customer_email })).id
    }
    
    // 3. Création du Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountCents,
      currency: 'usd',
      customer: stripeCustomerId,
      description: `Order for ${customer_email}`,
      setup_future_usage: save_card ? 'off_session' : undefined,
      metadata: {
        user_id: user?.id || 'guest',
        customer_email: customer_email,
        items: JSON.stringify(items)
      }
    })

    return {
      success: true,
      data: {
        client_secret: paymentIntent.client_secret,
        id: paymentIntent.id
      }
    }

  } catch (error: any) {
    console.error('Payment Intent creation error:', error)
    if (error.statusCode) {
      throw error
    }
    throw createApiError('Failed to create payment intent', 500)
  }
})