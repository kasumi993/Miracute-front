import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database, ApiResponse } from '@/types/database'
import { createApiResponse, createApiError, handleSupabaseError } from '../../utils/api/apiResponse'
import { ServerEmailService } from '../../utils/email/ServerEmailService'

export default defineEventHandler(async (event): Promise<ApiResponse<{ review: any }>> => {
  try {
    // 1. Authentication
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createApiError('Authentication required', 401)
    }

    const supabase = serverSupabaseServiceRole<Database>(event)
    const body = await readBody(event)

    // 2. Validate required fields
    if (!body.product_id || !body.rating) {
      throw createApiError('Product ID and rating are required', 400)
    }

    if (body.rating < 1 || body.rating > 5) {
      throw createApiError('Rating must be between 1 and 5', 400)
    }

    // 3. Check for existing review
    const { data: existingReview, error: existingError } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('product_id', body.product_id)
      .eq('user_id', user.id)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      handleSupabaseError(existingError, 'Check existing review')
    }

    if (existingReview) {
      throw createApiError('You have already reviewed this product', 409)
    }

    // 4. Check purchase authorization
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      handleSupabaseError(profileError, 'Get user profile')
    }

    const isAdmin = userProfile?.role === 'admin'
    let isVerifiedPurchase = false

    if (!isAdmin) {
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('order_items')
        .select(`
          id,
          order:orders!inner (
            user_id,
            payment_status
          )
        `)
        .eq('product_id', body.product_id)
        .eq('order.user_id', user.id)
        .eq('order.payment_status', 'paid')

      if (purchaseError) {
        handleSupabaseError(purchaseError, 'Check purchase history')
      }

      isVerifiedPurchase = !!(purchaseData && purchaseData.length > 0)

      if (!isVerifiedPurchase) {
        throw createApiError('You can only review templates you have purchased', 403)
      }
    } else {
      isVerifiedPurchase = true
    }

    // 5. Create review
    const editDeadline = new Date(Date.now() + (6 * 60 * 60 * 1000)) // 6 hours

    const { data: review, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id: body.product_id,
        user_id: user.id,
        rating: body.rating,
        title: body.title?.trim() || null,
        comment: body.comment?.trim() || null,
        is_verified_purchase: isVerifiedPurchase,
        is_approved: true,
        is_anonymous: false,
        is_editable: true,
        edit_deadline: editDeadline.toISOString()
      })
      .select()
      .single()

    if (error) {
      handleSupabaseError(error, 'Create review')
    }

    // 6. Send notification email
    try {
      const { data: productData } = await supabase
        .from('products')
        .select('name')
        .eq('id', body.product_id)
        .single()

      const { data: userData } = await supabase
        .from('users')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single()

      const emailService = new ServerEmailService()
      await emailService.sendAdminReviewNotification({
        productId: body.product_id,
        productName: productData?.name || 'Unknown Product',
        rating: review.rating,
        isVerified: review.is_verified_purchase,
        title: review.title,
        comment: review.comment,
        customerName: userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : 'Anonymous',
        customerEmail: userData?.email,
        reviewId: review.id
      })
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError)
    }

    return createApiResponse({
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        is_verified_purchase: review.is_verified_purchase,
        created_at: review.created_at
      }
    })

  } catch (error: any) {
    if (error.statusCode) {
      throw error // Re-throw H3 errors (created by createApiError)
    }
    handleSupabaseError(error, 'Submit review operation')
  }
})