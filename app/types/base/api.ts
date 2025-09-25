/**
 * Base API Response Types
 * Core types for all API responses and error handling
 */

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T | null
  error?: string | null
  message?: string
  meta?: ApiMeta
}

export interface ApiMeta {
  page?: number
  limit?: number
  total?: number
  totalPages?: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

export interface SearchResponse<T> {
  items: T[]
  meta: ApiMeta
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  statusCode: number
}

export interface ErrorContext {
  requestId?: string
  endpoint?: string
  timestamp?: string
  [key: string]: unknown
}

export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly details?: Record<string, unknown>

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}
