import { createFileManager } from '../../utils/fileManager'

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
    const fileManager = createFileManager(supabase)

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
          download_files,
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

    // Check download limits (max 5 downloads per order item)
    const { data: downloadLogs, error: logError } = await supabase
      .from('download_logs')
      .select('id')
      .eq('order_item_id', orderItemId)

    if (logError) {
      console.error('Error checking download logs:', logError)
    }

    const downloadCount = downloadLogs?.length || 0
    if (downloadCount >= 5) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Download limit exceeded (5 downloads maximum)'
      })
    }

    // Get the file path from product download_files
    const downloadFiles = orderItem.product.download_files
    if (!downloadFiles || downloadFiles.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No download files available'
      })
    }

    // Generate signed URL for secure download (expires in 1 hour)
    const filePath = downloadFiles[0] // Use first file
    const signedUrl = await fileManager.getSignedDownloadUrl(
      'product-files',
      filePath,
      { expiresIn: 3600 } // 1 hour
    )

    // Log the download attempt
    await supabase.from('download_logs').insert({
      user_id: user.id,
      order_item_id: orderItem.id,
      ip_address: getClientIP(event),
      user_agent: getHeader(event, 'user-agent'),
      downloaded_at: new Date().toISOString()
    })

    // Update download count
    await supabase
      .from('order_items')
      .update({
        download_count: downloadCount + 1,
        download_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      })
      .eq('id', orderItemId)

    return {
      success: true,
      data: {
        downloadUrl: signedUrl,
        fileName: `${orderItem.product.name}.zip`,
        fileSize: orderItem.product.file_size,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        downloadsRemaining: 5 - (downloadCount + 1)
      }
    }

  } catch (error) {
    console.error('Download error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process download'
    })
  }
})
