import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import { createFileManager, FileConfigs } from '../../utils/files/fileManager'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  try {
    // Verify user authentication
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    const { productId, fileName } = await readBody(event)
    if (!productId || !fileName) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Product ID and filename are required'
      })
    }

    const supabase = serverSupabaseServiceRole<Database>(event)

    // Verify user owns this product
    const { data: purchase, error: purchaseError } = await supabase
      .from('order_items')
      .select(`
        id,
        download_files,
        orders!inner(user_id, status)
      `)
      .eq('product_id', productId)
      .eq('orders.user_id', user.id)
      .eq('orders.status', 'completed')
      .single()

    if (purchaseError || !purchase) {
      throw createError({
        statusCode: 403,
        statusMessage: 'You do not own this product'
      })
    }

    // Verify the filename exists in the download files
    const downloadFiles = purchase.download_files as any[] || []
    const requestedFile = downloadFiles.find(file => file.filename === fileName)

    if (!requestedFile) {
      throw createError({
        statusCode: 404,
        statusMessage: 'File not found'
      })
    }

    // Create file manager and generate signed URL
    const fileManager = createFileManager(supabase)

    try {
      const signedUrl = await fileManager.getSignedDownloadUrl(
        FileConfigs.PRODUCT_FILES.bucket,
        requestedFile.file_path,
        {
          expiresIn: 3600, // 1 hour
        }
      )

      const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString()

      return {
        success: true,
        data: {
          downloadUrl: signedUrl,
          expiresAt,
          filename: fileName,
          fileSize: requestedFile.file_size
        }
      }

    } catch (fileError: any) {
      console.error('File manager error:', fileError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to generate download link'
      })
    }

  } catch (error: any) {
    console.error('Download generation error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to generate download link'
    })
  }
})