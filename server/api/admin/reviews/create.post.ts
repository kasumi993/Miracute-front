import { requireAdminAuthentication } from '../../../utils/auth'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  const { supabase } = await requireAdminAuthentication(event)
  const body = await readBody(event)

  // Validate required fields
  if (!body.product_id || !body.user_id || !body.rating) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Product ID, user ID, and rating are required'
    })
  }

  // Validate rating range
  if (body.rating < 1 || body.rating > 5) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Rating must be between 1 and 5'
    })
  }

  try {
    // Check if user exists
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('id', body.user_id)
      .single()

    if (!user) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User not found'
      })
    }

    // Check if product exists
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('id', body.product_id)
      .single()

    if (!product) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product not found'
      })
    }

    // Check if user has already reviewed this product (allow admin to override)
    const { data: existingReview } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('product_id', body.product_id)
      .eq('user_id', body.user_id)
      .single()

    if (existingReview && !body.force_override) {
      throw createError({
        statusCode: 409,
        statusMessage: 'User has already reviewed this product'
      })
    }

    // Check if user has purchased this product (for verified purchase flag)
    const { data: purchaseData } = await supabase
      .from('order_items')
      .select(`
        id,
        order:orders!inner (
          user_id,
          payment_status
        )
      `)
      .eq('product_id', body.product_id)
      .eq('order.user_id', body.user_id)
      .eq('order.payment_status', 'paid')

    const isVerifiedPurchase = purchaseData && purchaseData.length > 0

    // Create the review
    const { data: review, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: body.product_id,
        user_id: body.user_id,
        rating: body.rating,
        title: body.title?.trim() || null,
        comment: body.comment?.trim() || null,
        is_verified_purchase: body.is_verified_purchase ?? isVerifiedPurchase,
        is_approved: body.is_approved ?? true
      })
      .select(`
        id,
        rating,
        title,
        comment,
        is_verified_purchase,
        is_approved,
        created_at,
        updated_at,
        product:products (
          id,
          name,
          slug
        ),
        user:users (
          id,
          full_name,
          email
        )
      `)
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create review',
        data: error
      })
    }

    return {
      success: true,
      message: 'Review created successfully',
      review
    }

  } catch (error: any) {
    console.error('Error creating review:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create review'
    })
  }
})
