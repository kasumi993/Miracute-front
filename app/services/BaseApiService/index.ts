import type { ApiResponse } from '@/types'
import type { RequestConfig, RequestOptions } from '@/types/api/requests'
import { useUserStore } from '~/stores/auth/user'

export class BaseApiService {
  private readonly baseUrl: string
  private readonly defaultTimeout: number

  constructor(options: RequestOptions = {}) {
    this.baseUrl = options.baseUrl || '/api'
    this.defaultTimeout = options.defaultTimeout || 30000
  }

  async request<T = unknown>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const {
        method = 'GET',
        body,
        query,
        headers = {},
        timeout = this.defaultTimeout,
        skipAuth = false
      } = config

      const url = this.buildUrl(endpoint, query)
      const requestHeaders = await this.prepareHeaders(headers, skipAuth)

      const response = await $fetch<ApiResponse<T>>(url, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: requestHeaders,
        timeout,
        credentials: 'include'
      })

      if (!this.isValidApiResponse(response)) {
        throw new Error('Invalid API response format')
      }

      return response
    } catch (error) {
      return this.handleError<T>(error)
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


  private buildUrl(endpoint: string, query?: Record<string, unknown>): string {
    const url = `${this.baseUrl}${endpoint}`

    if (!query || Object.keys(query).length === 0) {
      return url
    }

    const params = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value))
      }
    })

    const queryString = params.toString()
    return queryString ? `${url}?${queryString}` : url
  }

  private async prepareHeaders(
    customHeaders: Record<string, string>,
    skipAuth: boolean
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    }

    if (!skipAuth && import.meta.client) {
      try {
        // Get access token from store
        const userStore = useUserStore()
        const token = await userStore.getAccessToken()

        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        } else {
          console.warn('No active session token available for API request')
        }
      } catch (error) {
        console.warn('Failed to get session token for API request:', error)
      }
    }

    return headers
  }


  private handleError<T>(error: unknown): ApiResponse<T> {
    const message = error instanceof Error ? error.message : 'Request failed'
    console.error('API Error:', message)

    return {
      success: false,
      data: null as T,
      error: message
    }
  }

  private isValidApiResponse(response: unknown): response is ApiResponse<unknown> {
    return (
      typeof response === 'object' &&
      response !== null &&
      'success' in response
    )
  }



}

// Default singleton instance
export const apiService = new BaseApiService()
