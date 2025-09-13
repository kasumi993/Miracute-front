import type { ApiResponse } from '~/types/database'

export function createApiResponse<T>(data: T, success: boolean = true): ApiResponse<T> {
  return {
    success,
    data
  }
}

export function createApiError(message: string, statusCode: number = 500, data?: any): never {
  throw createError({
    statusCode,
    statusMessage: message,
    data
  })
}

export function handleSupabaseError(error: any, context: string): never {
  console.error(`${context} error:`, error)

  if (error.code === 'PGRST116') {
    throw createError({
      statusCode: 404,
      statusMessage: 'Resource not found'
    })
  }

  if (error.statusCode) {
    throw error
  }

  throw createError({
    statusCode: 500,
    statusMessage: `Failed to ${context.toLowerCase()}`,
    data: error
  })
}
