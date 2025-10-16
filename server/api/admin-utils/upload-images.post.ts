import { requireAdminAuthentication } from '../../utils/auth'
import { createFileManager, FileConfigs } from '../../utils/fileManager'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)

  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No files provided'
    })
  }

  const { supabase } = await requireAdminAuthentication(event)
  const fileManager = createFileManager(supabase)
  const uploadResults: Array<{ url: string; path: string; size: number }> = []

  try {
    for (const file of formData) {
      if (!file.filename || !file.data) {continue}

      // Upload using the file manager with validation
      const result = await fileManager.uploadFile(file, FileConfigs.PRODUCT_IMAGES)
      uploadResults.push(result)
    }

    return {
      success: true,
      data: {
        uploads: uploadResults,
        urls: uploadResults.map(r => r.url), // For backward compatibility
        totalSize: uploadResults.reduce((sum, r) => sum + r.size, 0)
      },
      message: `${uploadResults.length} image(s) uploaded successfully`
    }

  } catch (error: any) {
    console.error('Error uploading images:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to upload images'
    })
  }
})
