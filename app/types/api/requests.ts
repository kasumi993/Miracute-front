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