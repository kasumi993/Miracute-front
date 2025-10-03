/**
 * Professional BaseApiService - Replaces the amateur implementation
 * Provides consistent API communication with proper error handling, types, and logging
 */

import type {
  ApiResponse
} from '@/types'
import {
  AppError,
  ErrorLogger,
  createErrorResponse,
  ERROR_CODES
} from '~/utils/errors'

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  query?: Record<string, unknown>
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  skipAuth?: boolean
}

export interface RequestOptions {
  baseUrl?: string
  defaultTimeout?: number
  defaultRetries?: number
  enableLogging?: boolean
}

export class BaseApiService {
  private readonly baseUrl: string
  private readonly defaultTimeout: number
  private readonly defaultRetries: number
  private readonly enableLogging: boolean

  constructor(options: RequestOptions = {}) {
    this.baseUrl = options.baseUrl || '/api'
    this.defaultTimeout = options.defaultTimeout || 30000
    this.defaultRetries = options.defaultRetries || 3
    this.enableLogging = options.enableLogging ?? (process.env.NODE_ENV === 'development')
  }

  /**
   * Generic request method with comprehensive error handling
   */
  async request<T = unknown>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now()
    const requestId = this.generateRequestId()

    try {
      const {
        method = 'GET',
        body,
        query,
        headers = {},
        timeout = this.defaultTimeout,
        retries = this.defaultRetries,
        skipAuth = false
      } = config

      // Build URL with query parameters
      const url = this.buildUrl(endpoint, query)

      // Prepare headers
      const requestHeaders = await this.prepareHeaders(headers, skipAuth)

      // Make request with retries
      const response = await this.makeRequestWithRetries<T>(
        url,
        {
          method,
          body: body ? JSON.stringify(body) : undefined,
          headers: requestHeaders,
          signal: AbortSignal.timeout(timeout)
        },
        retries,
        requestId
      )

      return response

    } catch (error) {
      const duration = Date.now() - startTime
      const context: ErrorContext = {
        requestId,
        endpoint,
        timestamp: new Date().toISOString()
      }

      return this.handleError<T>(error, context, duration)
    }
  }

  /**
   * GET request helper
   */
  async get<T = unknown>(
    endpoint: string,
    query?: Record<string, unknown>,
    config?: Omit<RequestConfig, 'method' | 'query'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET', query })
  }

  /**
   * POST request helper
   */
  async post<T = unknown>(
    endpoint: string,
    body?: unknown,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body })
  }

  /**
   * PUT request helper
   */
  async put<T = unknown>(
    endpoint: string,
    body?: unknown,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body })
  }

  /**
   * PATCH request helper
   */
  async patch<T = unknown>(
    endpoint: string,
    body?: unknown,
    config?: Omit<RequestConfig, 'method' | 'body'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body })
  }

  /**
   * DELETE request helper
   */
  async delete<T = unknown>(
    endpoint: string,
    config?: Omit<RequestConfig, 'method'>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }

  /**
   * Upload files with proper handling
   */
  async uploadFiles(
    endpoint: string,
    files: File[],
    additionalData?: Record<string, unknown>
  ): Promise<ApiResponse<{ urls: string[]; filenames: string[] }>> {
    try {
      const formData = new FormData()

      files.forEach((file, index) => {
        formData.append(`file_${index}`, file)
      })

      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, String(value))
        })
      }

      // Don't set Content-Type header for FormData
      const headers = await this.prepareHeaders({}, false)
      delete headers['Content-Type']

      const response = await $fetch<ApiResponse<{ urls: string[]; filenames: string[] }>>(
        `${this.baseUrl}${endpoint}`,
        {
          method: 'POST',
          body: formData,
          headers
        }
      )

      return response

    } catch (error) {
      return this.handleError<{ urls: string[]; filenames: string[] }>(
        error,
        { endpoint, additionalData }
      )
    }
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, query?: Record<string, unknown>): string {
    let url = `${this.baseUrl}${endpoint}`

    if (query && Object.keys(query).length > 0) {
      const params = new URLSearchParams()

      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, String(v)))
          } else {
            params.append(key, String(value))
          }
        }
      })

      const queryString = params.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    return url
  }

  /**
   * Prepare request headers with authentication
   */
  private async prepareHeaders(
    customHeaders: Record<string, string>,
    skipAuth: boolean
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': this.generateRequestId(),
      ...customHeaders
    }

    // Add authentication header if not skipped and on client-side
    if (!skipAuth && import.meta.client) {
      try {
        // Use the typed Supabase client composable instead of accessing unknown injected property
        const supabase = useSupabaseClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }
      } catch (error) {
        if (this.enableLogging) {
          console.warn('BaseApiService: Failed to get auth session:', error)
        }
      }
    }

    return headers
  }

  /**
   * Make request with retry logic
   */
  private async makeRequestWithRetries<T>(
    url: string,
    init: RequestInit,
    maxRetries: number,
    requestId: string
  ): Promise<ApiResponse<T>> {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await $fetch<ApiResponse<T>>(url, init)

        // Validate response structure
        if (!this.isValidApiResponse(response)) {
          throw new AppError(
            'Invalid API response format',
            ERROR_CODES.SERVER_INTERNAL_ERROR,
            500,
            { response, url, requestId }
          )
        }

        return response

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // Don't retry certain types of errors
        if (this.shouldNotRetry(lastError) || attempt === maxRetries) {
          break
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
        await this.sleep(delay)

        if (this.enableLogging) {
          console.warn(
            `BaseApiService: Retry attempt ${attempt}/${maxRetries} for ${url} after ${delay}ms delay`
          )
        }
      }
    }

    throw lastError || new Error('Request failed after retries')
  }

  /**
   * Handle and transform errors
   */
  private handleError<T>(
    error: unknown,
    context?: ErrorContext,
    duration?: number
  ): ApiResponse<T> {
    let appError: AppError

    if (error instanceof AppError) {
      appError = error
    } else if (error instanceof Error) {
      // Handle specific fetch errors
      if (error.name === 'AbortError') {
        appError = new AppError(
          'Request timed out',
          ERROR_CODES.SERVER_TIMEOUT,
          408,
          context
        )
      } else if (error.message.includes('fetch')) {
        appError = new AppError(
          'Network error occurred',
          ERROR_CODES.SERVER_SERVICE_UNAVAILABLE,
          503,
          { originalError: error.message, ...context }
        )
      } else {
        appError = new AppError(
          error.message,
          ERROR_CODES.SERVER_INTERNAL_ERROR,
          500,
          { originalError: error.message, ...context }
        )
      }
    } else {
      appError = new AppError(
        'An unexpected error occurred',
        ERROR_CODES.SERVER_INTERNAL_ERROR,
        500,
        { originalError: String(error), ...context }
      )
    }

    // Log error
    ErrorLogger.log(appError, {
      ...context,
      userAgent: process.client ? navigator.userAgent : undefined
    })

    return createErrorResponse<T>(appError)
  }

  /**
   * Check if response has valid API response structure
   */
  private isValidApiResponse(response: unknown): response is ApiResponse<unknown> {
    return (
      typeof response === 'object' &&
      response !== null &&
      'success' in response &&
      typeof (response as Record<string, unknown>).success === 'boolean'
    )
  }

  /**
   * Determine if an error should not be retried
   */
  private shouldNotRetry(error: Error): boolean {
    // Don't retry authentication errors
    if (error.message.includes('401') || error.message.includes('403')) {
      return true
    }

    // Don't retry client errors (4xx)
    if (error.message.includes('400') || error.message.includes('422')) {
      return true
    }

    // Don't retry AbortError (timeout)
    if (error.name === 'AbortError') {
      return true
    }

    return false
  }

  /**
   * Generate unique request ID for tracing
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Default singleton instance
export const apiService = new BaseApiService({
  enableLogging: process.env.NODE_ENV === 'development'
})
