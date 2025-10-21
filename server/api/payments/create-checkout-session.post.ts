import Stripe from 'stripe'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '@/types/database'
import { createApiError, handleSupabaseError } from '../../utils/api/apiResponse'
// Importation de la fonction utilitaire centralisée
import { generateOrderNumber } from '../../utils/paymentProcessing' 

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createApiError('Method not allowed', 405)
  }

  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2023-10-16'
  })

  // Utiliser le client standard (non service role) car l'utilisateur authentifié est vérifié
  const supabase = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)

  try {
    const body = await readBody(event)
    const {
      items,
      customer_info,
      billing_address,
      create_account = false,
      email_updates = false,
      success_url,
      cancel_url
    } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw createApiError('Invalid items provided', 400)
    }

    // 1. Validation et récupération des produits
    const productIds = items.map(item => item.product_id)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, slug, price, short_description, description, preview_images, category_id') // Sélectionner uniquement les colonnes nécessaires
      .in('id', productIds)
      .eq('is_active', true)

    if (productsError) {
      handleSupabaseError(productsError, 'Fetch active products for checkout')
    }
    if (!products || products.length === 0) {
      throw createApiError('No active products found for the items provided.', 404)
    }

    // 2. Création des Line Items Stripe et calcul du total
    const lineItems = products.map(product => {
      const item = items.find((i: any) => i.product_id === product.id)
      const quantity = item?.quantity || 1

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.short_description || product.description?.substring(0, 300),
            images: product.preview_images?.slice(0, 1) || [],
            metadata: { product_id: product.id }
          },
          unit_amount: Math.round(parseFloat(product.price as string) * 100) // Assurez-vous que 'price' est traité comme string ou number
        },
        quantity
      }
    })

    const totalAmount = products.reduce((sum, product) => {
      const item = items.find((i: any) => i.product_id === product.id)
      const quantity = item?.quantity || 1
      return sum + (parseFloat(product.price as string) * quantity)
    }, 0)

    // 3. Gestion de l'e-mail client et de l'utilisateur effectif
    const customerEmail = user?.email || customer_info?.email

    if (!customerEmail) {
      throw createApiError('Customer email is required', 400)
    }

    // Logique d'inscription pour les utilisateurs invités (conservée et nettoyée)
    let newlyCreatedUserId = null
    const customerName = customer_info?.name || `${customer_info?.firstName || ''} ${customer_info?.lastName || ''}`.trim()
    
    if (create_account && !user && customer_info?.email) {
      try {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: customer_info.email,
          email_confirm: true,
          user_metadata: { firstName: customer_info.firstName || '', lastName: customer_info.lastName || '' }
        })

        if (authData?.user && !authError) {
          newlyCreatedUserId = authData.user.id
          await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: customer_info.email,
              first_name: customer_info.firstName || '',
              last_name: customer_info.lastName || '',
              email_notifications: email_updates,
            })
        }
      } catch (error) {
        console.error('Failed to create account during checkout (ignored):', error)
      }
    }

    // 4. Création ou récupération du client Stripe
    let stripeCustomerId: string | undefined
    const effectiveUserId = user?.id || newlyCreatedUserId

    if (effectiveUserId) {
      const { data: userData } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', effectiveUserId)
        .single()

      if (userData?.stripe_customer_id) {
        stripeCustomerId = userData.stripe_customer_id
      } else {
        const customer = await stripe.customers.create({
          email: customerEmail,
          name: customerName,
          metadata: { user_id: effectiveUserId }
        })
        stripeCustomerId = customer.id
        await supabase
          .from('users')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', effectiveUserId)
      }
    }

    // 5. Création de la Session de Paiement Stripe
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      customer_email: stripeCustomerId ? undefined : customerEmail,
      line_items: lineItems,
      mode: 'payment',
      success_url: success_url || `${getHeader(event, 'origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${getHeader(event, 'origin')}/cart`,
      payment_method_types: undefined, // Laisser Stripe décider des méthodes disponibles
      metadata: {
        user_id: effectiveUserId || '',
        customer_email: customerEmail,
        items: JSON.stringify(items),
        create_account: create_account.toString(),
      },
      customer_creation: stripeCustomerId ? undefined : 'always',
      setup_future_usage: stripeCustomerId ? 'on_session' : undefined
    })

    // 6. Création de la commande "en attente" (Pending Order)
    const orderData = {
      user_id: effectiveUserId || null,
      subtotal: totalAmount.toString(),
      total_amount: totalAmount.toString(),
      customer_email: customerEmail,
      customer_name: customerName || null,
      status: 'pending' as const,
      payment_status: 'pending' as const,
      stripe_payment_intent_id: session.payment_intent as string,
      order_number: generateOrderNumber(), // Utilisation de la fonction centralisée
      notes: `Stripe Checkout Session: ${session.id}${create_account && newlyCreatedUserId ? ' - Account created during checkout' : ''}`
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError || !order) {
      // Ne pas jeter d'erreur ici, le webhook/success gérera la création de la commande si celle-ci échoue.
      console.warn('Failed to create pending order:', orderError?.message)
    } else {
      // Création des articles de commande
      const orderItems = products.map(product => {
        const item = items.find((i: any) => i.product_id === product.id)
        const quantity = item?.quantity || 1
        const unitPrice = parseFloat(product.price as string)

        return {
          order_id: order.id,
          product_id: product.id,
          product_name: product.name,
          product_slug: product.slug,
          unit_price: unitPrice.toString(),
          quantity,
          total_price: (unitPrice * quantity).toString()
        }
      })

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Failed to create order items:', itemsError)
      }
    }

    return {
      success: true,
      data: {
        id: session.id,
        url: session.url,
        customer_email: customerEmail
      }
    }

  } catch (error: any) {
    console.error('Stripe checkout error:', error)
    
    // 7. Gestion des erreurs centralisée
    if (error.type === 'StripeCardError') {
      throw createApiError(error.message, 400)
    }

    if (error.statusCode) {
      throw error
    }

    // Utilisation de la gestion d'erreur par défaut pour les erreurs inconnues
    throw createApiError('Failed to create checkout session', 500)
  }
})