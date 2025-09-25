/**
 * File Upload Types
 * Types for file uploads and media management
 */

export interface FileUploadResponse {
  url: string
  filename: string
  originalName: string
  fileSize: number
  mimeType: string
}

export interface FileUploadError {
  code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'UPLOAD_FAILED'
  message: string
  filename: string
}
