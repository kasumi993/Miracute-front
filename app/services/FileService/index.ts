import type { ApiResponse } from '@/types'
import { BaseApiService } from '../BaseApiService'

const baseService = new BaseApiService()

export interface FileUploadOptions {
  endpoint: string
  onProgress?: (progress: number) => void
  maxFileSize?: number
  allowedTypes?: string[]
}

export interface UploadResult {
  url: string
  path: string
  size: number
  filename: string
}

/**
 * Validate files before upload
 */
const validateFiles = (files: File[], options: FileUploadOptions): void => {
  for (const file of files) {
    // Check file size
    if (options.maxFileSize && file.size > options.maxFileSize) {
      throw new Error(`File "${file.name}" is too large. Maximum size is ${formatFileSize(options.maxFileSize)}`)
    }

    // Check file type
    if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
      throw new Error(`File "${file.name}" has unsupported format. Allowed types: ${options.allowedTypes.join(', ')}`)
    }
  }
}

/**
 * Format file size for display
 */
const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`
}

/**
 * Upload with progress tracking using $fetch
 */
const uploadWithProgress = async (
  formData: FormData,
  options: FileUploadOptions
): Promise<{ uploads: UploadResult[]; urls: string[]; totalSize: number }> => {
  try {
    // Simulate progress for now since $fetch doesn't support onUploadProgress
    if (options.onProgress) {
      options.onProgress(0)
      // Update progress during upload
      const progressInterval = setInterval(() => {
        const currentProgress = Math.min(90, Math.random() * 50 + 40)
        options.onProgress!(currentProgress)
      }, 200)

      try {
        const response = await $fetch<any>(`/api${options.endpoint}`, {
          method: 'POST',
          body: formData
        })

        clearInterval(progressInterval)
        options.onProgress(100)

        if (response.success) {
          return response.data
        } else {
          throw new Error(response.message || 'Upload failed')
        }
      } catch (error) {
        clearInterval(progressInterval)
        throw error
      }
    } else {
      const response = await $fetch<any>(`/api${options.endpoint}`, {
        method: 'POST',
        body: formData
      })

      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || 'Upload failed')
      }
    }
  } catch (error: any) {
    throw new Error(error.message || 'Upload failed')
  }
}

/**
 * Upload multiple files using FormData
 */
export const uploadFiles = async (
  files: File[] | FileList,
  options: FileUploadOptions
): Promise<ApiResponse<{ uploads: UploadResult[]; urls: string[]; totalSize: number }>> => {
  try {
    // Validate files
    const fileArray = Array.from(files)
    validateFiles(fileArray, options)

    // Create FormData
    const formData = new FormData()
    fileArray.forEach((file, index) => {
      formData.append(`file-${index}`, file)
    })

    // Upload with progress tracking
    const response = await uploadWithProgress(formData, options)

    return {
      success: true,
      data: response,
      error: null
    }
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error.message || 'Failed to upload files'
    }
  }
}

/**
 * Upload product media (images and videos)
 */
const uploadProductMedia = async (
  files: File[] | FileList,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<{ uploads: UploadResult[]; urls: string[]; totalSize: number }>> => {
  return uploadFiles(files, {
    endpoint: '/files/upload?type=product-media',
    onProgress,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
      'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'
    ]
  })
}

/**
 * Upload images specifically (for backward compatibility)
 */
const uploadImages = async (
  files: File[] | FileList,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<{ uploads: UploadResult[]; urls: string[]; totalSize: number }>> => {
  return uploadProductMedia(files, onProgress)
}

/**
 * Upload product files (digital downloads)
 */
const uploadProductFiles = async (
  files: File[] | FileList,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<{ uploads: UploadResult[]; urls: string[]; totalSize: number }>> => {
  return uploadFiles(files, {
    endpoint: '/files/upload?type=product-files',
    onProgress,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: [
      'application/zip',
      'application/pdf',
      'application/x-photoshop',
      'application/postscript',
      'application/octet-stream'
    ]
  })
}

/**
 * Upload blog images
 */
const uploadBlogImages = async (
  files: File[] | FileList,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<{ uploads: UploadResult[]; urls: string[]; totalSize: number }>> => {
  return uploadFiles(files, {
    endpoint: '/files/upload?type=blog-images',
    onProgress,
    maxFileSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  })
}

/**
 * Delete uploaded image/file
 */
const deleteImage = async (imageId: string): Promise<ApiResponse<{ message: string }>> => {
  try {
    const response = await $fetch<any>(`/api/files/${imageId}`, {
      method: 'DELETE'
    })

    if (response.success) {
      return {
        success: true,
        data: response.data,
        error: null
      }
    } else {
      throw new Error(response.message || 'Failed to delete image')
    }
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error.message || 'Failed to delete image'
    }
  }
}

/**
 * Cleanup unused images
 */
const cleanupImages = async (): Promise<ApiResponse<any>> => {
  return baseService.post<any>('/files/cleanup-images')
}

/**
 * Generate signed download URL for digital products
 */
const getDownloadUrl = async (productId: string, fileName: string): Promise<ApiResponse<{ downloadUrl: string; expiresAt: string }>> => {
  return baseService.post('/downloads/generate', { productId, fileName })
}

export const FileService = {
  uploadProductMedia,
  uploadImages,
  uploadProductFiles,
  uploadBlogImages,
  deleteImage,
  getDownloadUrl,
  cleanupImages,
}