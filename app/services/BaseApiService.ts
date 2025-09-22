import type { ApiResponse } from '~/types/database'

export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: any
  query?: Record<string, any>
  headers?: Record<string, string>
}

export class BaseApiService {

  /**
   * Base URL for API calls
   */
  protected baseUrl = '/api'

  /**
   * Make an API request with proper error handling
   */
  protected async request<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const { method = 'GET', body, query, headers } = config

      // Build URL with query parameters
      let url = `${this.baseUrl}${endpoint}`
      if (query && Object.keys(query).length > 0) {
        const params = new URLSearchParams()
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value))
          }
        })
        url += `?${params.toString()}`
      }

      // Make the request
      const response = await $fetch<ApiResponse<T>>(url, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      })

      return response
    } catch (error: any) {
      console.error(`API request failed for ${endpoint}:`, error)

      // Return structured error response
      return {
        success: false,
        error: error.message || 'Request failed',
        data: null as any
      }
    }
  }

  /**
   * GET request helper
   */
  async get<T = any>(
    endpoint: string,
    query?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', query })
  }

  /**
   * POST request helper
   */
  async post<T = any>(
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body })
  }

  /**
   * PUT request helper
   */
  async put<T = any>(
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body })
  }

  /**
   * PATCH request helper
   */
  async patch<T = any>(
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PATCH', body })
  }

  /**
   * DELETE request helper
   */
  async delete<T = any>(
    endpoint: string
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  /**
   * Handle common error scenarios
   */
  protected handleError(error: any, context: string): never {
    console.error(`${context} failed:`, error)

    if (error.statusCode === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    if (error.statusCode === 403) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied'
      })
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Internal server error'
    })
  }
}