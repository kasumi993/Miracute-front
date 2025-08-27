export default defineEventHandler(async (event) => {
  const orderItemId = getRouterParam(event, 'orderItemId')
  const user = await requireUserSession(event)
  
  if (!orderItemId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Order item ID is required'
    })
  }

  try {
    const supabase = await serverSupabaseServiceRole(event)
    
    // Verify the user owns this order item and it's paid
    const { data: orderItem, error } = await supabase
      .from('order_items')
      .select(`
        *,
        order:orders!inner(
          id,
          user_id,
          status,
          payment_status
        ),
        product:products!inner(
          id,
          name,
          download_url,
          file_size
        )
      `)
      .eq('id', orderItemId)
      .eq('order.user_id', user.id)
      .eq('order.payment_status', 'paid')
      .single()

    if (error || !orderItem) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Download not found or not accessible'
      })
    }

    // Log the download
    await supabase.from('download_logs').insert({
      user_id: user.id,
      product_id: orderItem.product.id,
      order_item_id: orderItem.id,
      ip_address: getClientIP(event),
      user_agent: getHeader(event, 'user-agent')
    })

    // Generate secure download URL or return file info
    // For now, return the download URL - in production you'd use signed URLs
    return {
      success: true,
      data: {
        downloadUrl: orderItem.product.download_url,
        fileName: `${orderItem.product.name}.zip`,
        fileSize: orderItem.product.file_size,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }
    }
    
  } catch (error) {
    console.error('Download error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process download'
    })
  }
})