import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)
  
  try {
    // Get all files from Product-images bucket
    const { data: files, error: listError } = await supabase.storage
      .from('Product-images')
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'asc' }
      })

    if (listError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to list storage files',
        data: listError
      })
    }

    if (!files || files.length === 0) {
      return {
        success: true,
        message: 'No files found in storage',
        deletedCount: 0
      }
    }

    // Get all products and their preview_images
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('preview_images')

    if (productsError) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch products',
        data: productsError
      })
    }

    // Extract all used image URLs from products
    const usedImageUrls = new Set<string>()
    products?.forEach(product => {
      if (product.preview_images && Array.isArray(product.preview_images)) {
        product.preview_images.forEach(url => {
          if (typeof url === 'string') {
            usedImageUrls.add(url)
          }
        })
      }
    })

    console.log('Used image URLs:', Array.from(usedImageUrls))
    console.log('Total files in storage:', files.length)

    // Find orphaned files (not used by any product)
    const orphanedFiles: string[] = []
    const allStorageUrls: string[] = []

    files.forEach(file => {
      if (!file.name || !file.created_at) return
      
      // Get the public URL for this file
      const { data: { publicUrl } } = supabase.storage
        .from('Product-images')
        .getPublicUrl(file.name)
      
      allStorageUrls.push(publicUrl)
      
      console.log(`File: ${file.name}`)
      console.log(`  Public URL: ${publicUrl}`)
      console.log(`  Is used: ${usedImageUrls.has(publicUrl)}`)
      
      if (!usedImageUrls.has(publicUrl)) {
        console.log(`  -> MARKED FOR DELETION`)
        orphanedFiles.push(file.name)
      }
    })

    console.log('All storage URLs:', allStorageUrls)
    console.log('Orphaned files to delete:', orphanedFiles)

    // Delete orphaned files
    let deletedCount = 0
    if (orphanedFiles.length > 0) {
      const { data: deletedFiles, error: deleteError } = await supabase.storage
        .from('Product-images')
        .remove(orphanedFiles)

      if (deleteError) {
        console.error('Error deleting files:', deleteError)
        throw createError({
          statusCode: 500,
          statusMessage: 'Failed to delete orphaned files',
          data: deleteError
        })
      }

      deletedCount = deletedFiles?.length || 0
    }

    return {
      success: true,
      message: `Cleanup completed. ${deletedCount} orphaned files deleted.`,
      deletedCount,
      totalFiles: files.length,
      orphanedFiles: orphanedFiles.length,
      usedImages: usedImageUrls.size
    }

  } catch (error: any) {
    console.error('Error during image cleanup:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Image cleanup failed',
      data: error
    })
  }
})