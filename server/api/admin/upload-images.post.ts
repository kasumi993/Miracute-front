import { validateAdminAccess } from '../../utils/adminAuth'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event)
  
  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No files provided'
    })
  }

  const { supabase } = await validateAdminAccess(event)
  const uploadedUrls: string[] = []

  try {
    for (const file of formData) {
      if (!file.filename || !file.data) continue
      
      // Generate unique filename
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substr(2, 9)
      const fileExtension = file.filename.split('.').pop()
      const fileName = `product-image-${timestamp}-${randomId}.${fileExtension}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('Product-images')
        .upload(fileName, file.data, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Storage upload error:', error)
        throw error
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('Product-images')
        .getPublicUrl(fileName)

      uploadedUrls.push(publicUrl)
    }

    return {
      success: true,
      urls: uploadedUrls,
      message: `${uploadedUrls.length} image(s) uploaded successfully`
    }

  } catch (error: any) {
    console.error('Error uploading images:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload images',
      data: error
    })
  }
})