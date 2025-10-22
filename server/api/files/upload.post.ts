import { requireAdminAuthentication } from '../../utils/security/auth'
import { createFileManager, FileConfigs } from '../../utils/files/fileManager'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No files provided'
    })
  }

  // Get upload type from query parameters
  const query = getQuery(event)
  const uploadType = query.type as string

  if (!uploadType) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Upload type is required (type=product-media|product-files|blog-images)'
    })
  }

  // Map upload types to configurations
  const configMap = {
    'product-media': FileConfigs.PRODUCT_MEDIA,
    'product-files': FileConfigs.PRODUCT_FILES,
    'blog-images': FileConfigs.BLOG_IMAGES
  }

  const fileConfig = configMap[uploadType as keyof typeof configMap]
  if (!fileConfig) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid upload type. Supported types: ${Object.keys(configMap).join(', ')}`
    })
  }

  const { supabase } = await requireAdminAuthentication(event)
  const fileManager = createFileManager(supabase)
  const uploadResults: Array<{ url: string; path: string; size: number; filename: string }> = []

  try {
    for (const file of formData) {
      if (!file.filename || !file.data) {continue}

      // Upload using the file manager with validation
      const result = await fileManager.uploadFile(file, fileConfig)
      uploadResults.push({
        ...result,
        filename: file.filename
      })
    }

    return {
      success: true,
      data: {
        uploads: uploadResults,
        urls: uploadResults.map(r => r.url), // For backward compatibility
        totalSize: uploadResults.reduce((sum, r) => sum + r.size, 0),
        uploadType
      },
      message: `${uploadResults.length} file(s) uploaded successfully to ${uploadType}`
    }

  } catch (error: any) {
    console.error('Error uploading files:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to upload files'
    })
  }
})