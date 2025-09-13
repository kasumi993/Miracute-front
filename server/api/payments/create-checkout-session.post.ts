import Stripe from 'stripe'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    })
  }

  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey, {
    apiVersion: '2023-10-16'
  })

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
      user_id = null,
      success_url,
      cancel_url
    } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid items provided'
      })
    }

    // Validate and fetch products from database
    const productIds = items.map(item => item.product_id)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('is_active', true)

    if (productsError || !products) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch products'
      })
    }

    // Create line items for Stripe
    const lineItems = products.map(product => {
      const item = items.find(i => i.product_id === product.id)
      const quantity = item?.quantity || 1

      return {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            description: product.short_description || product.description?.substring(0, 300),
            images: product.preview_images?.slice(0, 1) || [],
            metadata: {
              product_id: product.id,
              slug: product.slug,
              category: product.category_id || ''
            }
          },
          unit_amount: Math.round(parseFloat(product.price) * 100) // Convert to cents
        },
        quantity
      }
    })

    // Calculate total amount for order creation
    const totalAmount = products.reduce((sum, product) => {
      const item = items.find(i => i.product_id === product.id)
      const quantity = item?.quantity || 1
      return sum + (parseFloat(product.price) * quantity)
    }, 0)

    // Customer email - use authenticated user email or provided email
    const customerEmail = user?.email || customer_info?.email

    if (!customerEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Customer email is required'
      })
    }

    // Handle optional account creation for guest users
    let newlyCreatedUserId = null
    if (create_account && !user && customer_info?.email) {
      try {
        // Create account in Supabase Auth (they'll set password later)
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: customer_info.email,
          email_confirm: true,
          user_metadata: {
            firstName: customer_info.firstName || '',
            lastName: customer_info.lastName || '',
            created_during_checkout: true,
            email_updates
          }
        })

        if (authData?.user && !authError) {
          newlyCreatedUserId = authData.user.id

          // Create user profile
          await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: customer_info.email,
              first_name: customer_info.firstName || '',
              last_name: customer_info.lastName || '',
              email_notifications: email_updates,
              created_at: new Date().toISOString()
            })
        }
      } catch (error) {
        console.error('Failed to create account during checkout:', error)
        // Don't fail checkout if account creation fails
      }
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId: string | undefined
    const effectiveUserId = user?.id || newlyCreatedUserId

    if (effectiveUserId) {
      // Check if user already has a Stripe customer ID
      const { data: userData } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', effectiveUserId)
        .single()

      if (userData?.stripe_customer_id) {
        stripeCustomerId = userData.stripe_customer_id
      } else {
        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: customerEmail,
          name: customer_info?.name || `${customer_info?.firstName || ''} ${customer_info?.lastName || ''}`.trim(),
          metadata: {
            user_id: effectiveUserId
          }
        })

        stripeCustomerId = customer.id

        // Save Stripe customer ID to user record
        await supabase
          .from('users')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', effectiveUserId)
      }
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      customer_email: stripeCustomerId ? undefined : customerEmail,
      line_items: lineItems,
      mode: 'payment',
      success_url: success_url || `${getHeader(event, 'origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${getHeader(event, 'origin')}/cart`,
      automatic_tax: {
        enabled: false // Enable if you want to calculate taxes
      },
      payment_method_types: ['card'],
      metadata: {
        user_id: effectiveUserId || '',
        customer_email: customerEmail,
        items: JSON.stringify(items),
        create_account: create_account.toString(),
        billing_address: JSON.stringify(billing_address)
      },
      // Enable customer creation for guest users
      customer_creation: stripeCustomerId ? undefined : 'always'
      // Collect shipping address if needed for tax calculation
      // shipping_address_collection: {
      //   allowed_countries: ['US', 'CA']
      // }
    })

    // Generate order number
    const generateOrderNumber = (): string => {
      const timestamp = Date.now().toString()
      const random = Math.random().toString(36).substring(2, 6).toUpperCase()
      return `MIR${timestamp.slice(-6)}${random}`
    }

    // Create pending order in database
    const orderData = {
      user_id: effectiveUserId || null,
      subtotal: totalAmount.toString(),
      total_amount: totalAmount.toString(),
      customer_email: customerEmail,
      customer_name: customer_info?.name || `${customer_info?.firstName || ''} ${customer_info?.lastName || ''}`.trim() || null,
      status: 'pending' as const,
      payment_status: 'pending' as const,
      stripe_payment_intent_id: session.payment_intent as string,
      order_number: generateOrderNumber(),
      notes: `Stripe Checkout Session: ${session.id}${create_account && newlyCreatedUserId ? ' - Account created during checkout' : ''}`
    }

    console.log('Creating pending order with data:', { ...orderData, notes: '...' })

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError || !order) {
      console.error('Failed to create order:', orderError)
      // Continue - we can handle this in the payment success endpoint
    } else {
      console.log('Successfully created pending order:', order.id)
    }

    // Create order items if order was created successfully
    if (order) {
      const orderItems = products.map(product => {
        const item = items.find(i => i.product_id === product.id)
        const quantity = item?.quantity || 1
        const unitPrice = parseFloat(product.price)

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

      console.log('Creating order items:', orderItems.length, 'items')

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Failed to create order items:', itemsError)
      } else {
        console.log('Successfully created order items')
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

    // Handle Stripe-specific errors
    if (error.type === 'StripeCardError') {
      throw createError({
        statusCode: 400,
        statusMessage: error.message
      })
    }

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create checkout session'
    })
  }
})
