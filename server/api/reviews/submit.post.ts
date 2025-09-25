import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '@/types/database'
import { sendBrevoNewReviewNotification } from '~/server/services/email/reviewService'

export default defineEventHandler(async (event) => {
  console.log('Review submit API called')

  const supabase = serverSupabaseServiceRole<Database>(event)
  const body = await readBody(event)

  console.log('Review API: Request body =', body)

  // Validate required fields
  if (!body.product_id || !body.user_id || !body.rating) {
    console.log('Review API: Missing required fields', {
      product_id: body.product_id,
      user_id: body.user_id,
      rating: body.rating
    })
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
    console.log('Review API: Starting database operations...')

    // Ensure user exists in the users table
    console.log('Review API: Checking if user exists in users table...')
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', body.user_id)
      .single()

    if (!existingUser) {
      console.log('Review API: User not found in users table, fetching from auth and creating profile...')

      // Get user data from auth.users
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(body.user_id)

      if (authError || !authUser.user) {
        console.log('Review API: Failed to get user from auth:', authError)
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid user. Please sign in again.'
        })
      }

      // Check if user email is verified
      if (!authUser.user.email_confirmed_at) {
        console.log('Review API: User email not verified')
        throw createError({
          statusCode: 400,
          statusMessage: 'Please verify your email address before submitting a review.'
        })
      }

      // Create user profile
      console.log('Review API: Creating user profile for:', authUser.user.email)

      // Extract name from metadata
      const metaData = authUser.user.user_metadata || {}
      let firstName = metaData.first_name || null
      let lastName = metaData.last_name || null

      // If we only have full_name, try to split it
      if (!firstName && !lastName && metaData.full_name) {
        const nameParts = metaData.full_name.split(' ')
        firstName = nameParts[0] || null
        lastName = nameParts.slice(1).join(' ') || null
      }

      const { error: createUserError } = await supabase
        .from('users')
        .insert({
          id: authUser.user.id,
          email: authUser.user.email!,
          first_name: firstName,
          last_name: lastName,
          avatar_url: metaData.avatar_url || null,
          role: 'customer',
          country: null
        })

      if (createUserError) {
        console.log('Review API: Failed to create user profile:', createUserError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to create user profile'
        })
      }

      console.log('Review API: User profile created successfully')
    }

    // Check if user has already reviewed this product
    console.log('Review API: Checking for existing review...')
    const { data: existingReview, error: existingReviewError } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('product_id', body.product_id)
      .eq('user_id', body.user_id)
      .single()

    if (existingReviewError && existingReviewError.code !== 'PGRST116') {
      console.log('Review API: Error checking existing review:', existingReviewError)
    }

    console.log('Review API: Existing review check result:', { existingReview, error: existingReviewError })

    if (existingReview) {
      throw createError({
        statusCode: 409,
        statusMessage: 'You have already reviewed this product'
      })
    }

    // Check user role and purchase authorization
    console.log('Review API: Checking user authorization...')
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', body.user_id)
      .single()

    const isAdmin = userProfile?.role === 'admin'
    console.log('Review API: User role:', userProfile?.role, 'isAdmin:', isAdmin)

    // Check if user has purchased this product (for non-admin users)
    let isVerifiedPurchase = false
    if (!isAdmin) {
      console.log('Review API: Checking purchase history for regular user...')
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

      isVerifiedPurchase = purchaseData && purchaseData.length > 0
      console.log('Review API: Purchase verification result:', { purchaseData: purchaseData?.length, isVerifiedPurchase })

      if (!isVerifiedPurchase) {
        console.log('Review API: User has not purchased this product, denying review submission')
        throw createError({
          statusCode: 403,
          statusMessage: 'You can only review templates you have purchased'
        })
      }
    } else {
      console.log('Review API: Admin user can review all templates')
      isVerifiedPurchase = true // Admin reviews are always considered verified
    }

    // Create the review with 6-hour edit window
    const now = new Date()
    const editDeadline = new Date(now.getTime() + (6 * 60 * 60 * 1000)) // 6 hours from now

    console.log('Review API: Creating review with data:', {
      product_id: body.product_id,
      user_id: body.user_id,
      rating: body.rating,
      title: body.title?.trim() || null,
      comment: body.comment?.trim() || null,
      is_verified_purchase: isVerifiedPurchase,
      is_approved: true,
      is_anonymous: false,
      is_editable: true,
      edit_deadline: editDeadline.toISOString()
    })

    const { data: review, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: body.product_id,
        user_id: body.user_id,
        rating: body.rating,
        title: body.title?.trim() || null,
        comment: body.comment?.trim() || null,
        is_verified_purchase: isVerifiedPurchase,
        is_approved: true, // Auto-approve reviews (can be changed to false for moderation)
        is_anonymous: false,
        is_editable: true,
        edit_deadline: editDeadline.toISOString()
      })
      .select()
      .single()

    console.log('Review API: Insert result:', { review, error })

    if (error) {
      console.log('Review API: Insert failed with error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to submit review',
        data: error
      })
    }

    // Send admin notification email about new review
    try {
      console.log('Review API: Sending admin notification email...')

      // Get product name and user info for the email
      const { data: productData } = await supabase
        .from('products')
        .select('name')
        .eq('id', body.product_id)
        .single()

      const { data: userData } = await supabase
        .from('users')
        .select('first_name, last_name, email')
        .eq('id', body.user_id)
        .single()

      await sendBrevoNewReviewNotification({
        productId: body.product_id,
        productName: productData?.name,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        userName: userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : undefined,
        userEmail: userData?.email,
        isVerifiedPurchase: review.is_verified_purchase
      })

      console.log('Review API: Admin notification email sent successfully')
    } catch (emailError) {
      console.error('Review API: Failed to send admin notification email:', emailError)
      // Don't fail the entire request if email fails
    }

    return {
      success: true,
      message: 'Review submitted successfully',
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        is_verified_purchase: review.is_verified_purchase,
        created_at: review.created_at
      }
    }

  } catch (error: any) {
    console.error('Error submitting review:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to submit review'
    })
  }
})
