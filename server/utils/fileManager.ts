// Enhanced file management utility for secure uploads and downloads
import type { SupabaseClient } from '@supabase/supabase-js'

interface UploadOptions {
  bucket: string
  allowedTypes: string[]
  maxSize: number // in bytes
  folder?: string
}

interface DownloadOptions {
  expiresIn: number // in seconds
  transform?: {
    width?: number
    height?: number
    quality?: number
  }
}

export class FileManager {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  /**
   * Upload file to Supabase Storage with validation
   */
  async uploadFile(
    file: { filename?: string; data: Buffer; type?: string },
    options: UploadOptions
  ): Promise<{ url: string; path: string; size: number }> {
    // Validate file
    if (!file.filename || !file.data) {
      throw new Error('Invalid file data')
    }

    // Check file size
    if (file.data.length > options.maxSize) {
      throw new Error(`File size exceeds limit of ${options.maxSize / (1024 * 1024)}MB`)
    }

    // Check file type
    const fileExtension = file.filename.split('.').pop()?.toLowerCase()
    if (!fileExtension || !options.allowedTypes.includes(fileExtension)) {
      throw new Error(`File type not allowed. Allowed types: ${options.allowedTypes.join(', ')}`)
    }

    // Generate secure filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substr(2, 9)
    const fileName = `${timestamp}-${randomId}.${fileExtension}`
    const filePath = options.folder ? `${options.folder}/${fileName}` : fileName

    // Upload to Supabase Storage
    const { error } = await this.supabase.storage
      .from(options.bucket)
      .upload(filePath, file.data, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = this.supabase.storage
      .from(options.bucket)
      .getPublicUrl(filePath)

    return {
      url: publicUrl,
      path: filePath,
      size: file.data.length
    }
  }

  /**
   * Generate signed URL for secure downloads
   */
  async getSignedDownloadUrl(
    bucket: string,
    path: string,
    options: DownloadOptions
  ): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, options.expiresIn, {
        transform: options.transform
      })

    if (error) {
      throw new Error(`Failed to create signed URL: ${error.message}`)
    }

    return data.signedUrl
  }

  /**
   * Delete file from storage
   */
  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`)
    }
  }

  /**
   * List files in a bucket/folder
   */
  async listFiles(bucket: string, folder?: string) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .list(folder, {
        limit: 100,
        offset: 0
      })

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`)
    }

    return data
  }
}

// Predefined configurations for different file types
export const FileConfigs = {
  PRODUCT_IMAGES: {
    bucket: 'product-images',
    allowedTypes: ['jpg', 'jpeg', 'png', 'webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
    folder: 'products'
  },
  PRODUCT_FILES: {
    bucket: 'product-files',
    allowedTypes: ['zip', 'pdf', 'psd', 'ai', 'fig', 'sketch'],
    maxSize: 100 * 1024 * 1024, // 100MB
    folder: 'downloads'
  },
  USER_AVATARS: {
    bucket: 'user-avatars',
    allowedTypes: ['jpg', 'jpeg', 'png', 'webp'],
    maxSize: 2 * 1024 * 1024, // 2MB
    folder: 'avatars'
  }
} as const

// Helper function to create file manager instance
export const createFileManager = (supabase: SupabaseClient) => {
  return new FileManager(supabase)
}