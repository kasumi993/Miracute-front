import type { Database } from '@/types/database'
import type { SupabaseClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

import {
  sendBrevoOrderConfirmation,
  sendBrevoAdminOrderNotification,
  sendBrevoReviewRequestEmail,
} from './email'

// --- Fonctions Auxiliaires de base ---

// Générer le numéro de commande
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `MIR${timestamp.slice(-6)}${random}`
}

// Fonction pour récupérer une commande complète avec ses articles
export async function getOrderWithItems(
  supabase: SupabaseClient<Database>,
  paymentIntentId: string
) {
  const { data: order, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      order_items (
        *,
        product:products (
          id,
          name,
          slug,
          download_files,
          file_size,
          file_formats
        )
      )
    `
    )
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single()

  if (error) {
    console.error('Error fetching order with items:', error)
    return null
  }
  return order
}

// Générer les liens de téléchargement
export async function generateDownloadLinks(
  orderId: string,
  supabase: SupabaseClient<Database>
) {
  try {
    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select(
        `
        *,
        product:products(download_files)
      `
      )
      .eq('order_id', orderId)

    if (error || !orderItems) {
      throw error
    }

    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30) // 30 days

    const updates = orderItems
      .filter((item) => item.product?.download_files?.length)
      .map((item) => ({
        id: item.id,
        download_url: item.product.download_files[0], // Utilise le premier fichier
        download_expires_at: expiryDate.toISOString(),
        max_downloads: 5,
      }))

    // Mettre à jour en parallèle (batch update)
    if (updates.length > 0) {
      for (const update of updates) {
        await supabase
          .from('order_items')
          .update({
            download_url: update.download_url,
            download_expires_at: update.download_expires_at,
            max_downloads: update.max_downloads,
          })
          .eq('id', update.id)
      }
    }

    console.log(`Generated download links for ${updates.length} items`)
  } catch (error) {
    console.error('Error generating download links:', error)
    throw error // Laisser l'erreur remonter
  }
}

// Envoyer les e-mails
export async function sendOrderEmails(order: any) {
  try {
    console.log('Sending order emails for order:', order.id)

    // Confirmation client (à ne pas jeter si elle échoue)
    await sendBrevoOrderConfirmation(order).catch((e) =>
      console.error('Failed to send customer confirmation email:', e)
    )

    // Notification admin (à ne pas jeter si elle échoue)
    await sendBrevoAdminOrderNotification(order).catch((e) =>
      console.error('Failed to send admin notification email:', e)
    )

    // Planifier l'email de demande de revue
    setTimeout(async () => {
        await sendBrevoReviewRequestEmail(order).catch((e) =>
            console.error('Failed to send review request email:', e)
        );
    }, 3 * 24 * 60 * 60 * 1000) // 3 jours

  } catch (error) {
    console.error('Error in sendOrderEmails wrapper:', error)
    // Ne rien jeter - la commande a été traitée
  }
}

// --- Logique de Création de Commande ---

/**
 * Crée une nouvelle commande et ses articles à partir des métadonnées de la session Stripe.
 * Retourne la commande complète.
 */
export async function createOrderFromSession(
  session: Stripe.Checkout.Session,
  paymentIntent: Stripe.PaymentIntent,
  supabase: SupabaseClient<Database>
) {
  console.log('=== CREATING ORDER FROM SESSION ===')
  const metadata = session.metadata || {}
  const items = JSON.parse(metadata.items || '[]')
  const customerEmail = metadata.customer_email || session.customer_email || paymentIntent.receipt_email

  if (!items.length || !customerEmail) {
    console.error('Missing items or customer email for order creation.')
    return null
  }

  const productIds = items.map((item: any) => item.product_id)
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, name, slug, price, download_files')
    .in('id', productIds)

  if (productsError || !products?.length) {
    console.error('No products found for order creation:', productsError?.message)
    return null
  }

  // Calcul du total
  const orderItemsData = products.map((product: any) => {
    const item = items.find((i: any) => i.product_id === product.id)
    const quantity = item?.quantity || 1
    const unitPrice = parseFloat(product.price)

    return {
      product_id: product.id,
      product_name: product.name,
      product_slug: product.slug,
      unit_price: unitPrice.toString(),
      quantity,
      total_price: (unitPrice * quantity).toString(),
    }
  })

  const totalAmount = orderItemsData.reduce((sum, item) => sum + parseFloat(item.total_price), 0)

  // Créer la commande
  const orderData = {
    user_id: metadata.user_id || null,
    subtotal: totalAmount.toString(),
    total_amount: totalAmount.toString(),
    customer_email: customerEmail,
    customer_name: session.customer_details?.name || metadata.customer_name,
    status: 'completed' as const, // Marquer directement comme 'completed' ici
    payment_status: 'paid' as const, // Marquer directement comme 'paid' ici
    stripe_payment_intent_id: paymentIntent.id,
    payment_method: paymentIntent.payment_method_types[0] || undefined,
    order_number: generateOrderNumber(),
  }

  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single()

  if (orderError || !newOrder) {
    console.error('Order creation failed:', orderError)
    throw orderError
  }

  // Insérer les articles de commande
  const itemsToInsert = orderItemsData.map((item) => ({
    ...item,
    order_id: newOrder.id,
  }))
  await supabase.from('order_items').insert(itemsToInsert)

  // Récupérer la commande complète pour le traitement post-création
  const completeOrder = await getOrderWithItems(supabase, paymentIntent.id)

  return completeOrder
}

// --- Fonction de Traitement Centrale ---

/**
 * Fonction unifiée pour traiter une commande réussie (mise à jour du statut, liens de téléchargement, emails).
 * @param order La commande (incluant les order_items et les produits).
 * @param supabase Le client Supabase.
 * @returns La commande traitée.
 */
export async function handleOrderProcessing(
  order: any, // Le type doit être OrderWithItems
  supabase: SupabaseClient<Database>
) {
  console.log('Processing successful order:', order.id)

  // 1. Mise à jour de la commande (juste au cas où, si non fait par le webhook)
  await supabase
    .from('orders')
    .update({
      status: 'completed',
      payment_status: 'paid',
      updated_at: new Date().toISOString(),
      // Ajouter une colonne de traitement si nécessaire pour éviter la double exécution
    })
    .eq('id', order.id)
    .select()
    .single()

  // 2. Générer les liens de téléchargement
  await generateDownloadLinks(order.id, supabase)

  // 3. Vider le panier de l'utilisateur
  if (order.user_id) {
    await supabase.from('cart_items').delete().eq('user_id', order.user_id)
  }

  // 4. Envoyer les emails
  await sendOrderEmails(order)

  console.log('Order processing completed successfully for order:', order.id)
  return order
}