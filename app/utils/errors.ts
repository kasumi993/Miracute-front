/**
 * Centralized Error Handling System
 * Replaces scattered error handling with consistent, typed error management
 */

import type { ApiResponse, ApiError } from '~/types/api'

// Error Codes
export const ERROR_CODES = {
  // Authentication Errors
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  AUTH_INVALID_TOKEN: 'AUTH_INVALID_TOKEN',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',

  // Validation Errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_DUPLICATE_VALUE: 'VALIDATION_DUPLICATE_VALUE',

  // Resource Errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  RESOURCE_GONE: 'RESOURCE_GONE',

  // Business Logic Errors
  BUSINESS_INSUFFICIENT_STOCK: 'BUSINESS_INSUFFICIENT_STOCK',
  BUSINESS_INVALID_OPERATION: 'BUSINESS_INVALID_OPERATION',
  BUSINESS_RATE_LIMITED: 'BUSINESS_RATE_LIMITED',

  // Payment Errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_DECLINED: 'PAYMENT_DECLINED',
  PAYMENT_INSUFFICIENT_FUNDS: 'PAYMENT_INSUFFICIENT_FUNDS',
  PAYMENT_INVALID_METHOD: 'PAYMENT_INVALID_METHOD',

  // Server Errors
  SERVER_INTERNAL_ERROR: 'SERVER_INTERNAL_ERROR',
  SERVER_SERVICE_UNAVAILABLE: 'SERVER_SERVICE_UNAVAILABLE',
  SERVER_TIMEOUT: 'SERVER_TIMEOUT',
  SERVER_MAINTENANCE: 'SERVER_MAINTENANCE',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

// Custom Error Classes
export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly details?: Record<string, unknown>
  public readonly isOperational: boolean

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number = 500,
    details?: Record<string, unknown>,
    isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.isOperational = isOperational

    Error.captureStackTrace(this, AppError)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string, value?: unknown) {
    super(
      message,
      ERROR_CODES.VALIDATION_FAILED,
      400,
      { field, value }
    )
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, ERROR_CODES.AUTH_REQUIRED, 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS, 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`

    super(message, ERROR_CODES.RESOURCE_NOT_FOUND, 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string, conflictingValue?: string) {
    super(
      message,
      ERROR_CODES.RESOURCE_CONFLICT,
      409,
      { conflictingValue }
    )
    this.name = 'ConflictError'
  }
}

export class BusinessLogicError extends AppError {
  constructor(message: string, operation?: string) {
    super(
      message,
      ERROR_CODES.BUSINESS_INVALID_OPERATION,
      422,
      { operation }
    )
    this.name = 'BusinessLogicError'
  }
}

export class PaymentError extends AppError {
  constructor(
    message: string,
    paymentCode: ErrorCode = ERROR_CODES.PAYMENT_FAILED,
    details?: Record<string, unknown>
  ) {
    super(message, paymentCode, 402, details)
    this.name = 'PaymentError'
  }
}

// Error Response Helpers
export function createErrorResponse<T = null>(
  error: AppError | Error,
  defaultMessage: string = 'An unexpected error occurred'
): ApiResponse<T> {
  if (error instanceof AppError) {
    return {
      success: false,
      data: null,
      error: error.message,
      meta: {
        code: error.code,
        statusCode: error.statusCode,
        details: error.details
      }
    }
  }

  // Handle unknown errors
  return {
    success: false,
    data: null,
    error: process.env.NODE_ENV === 'production' ? defaultMessage : error.message,
    meta: {
      code: ERROR_CODES.SERVER_INTERNAL_ERROR,
      statusCode: 500
    }
  }
}

export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    error: null,
    message
  }
}

// Error Logging Utilities
export interface ErrorContext {
  userId?: string
  requestId?: string
  endpoint?: string
  userAgent?: string
  ip?: string
  timestamp?: string
  additionalData?: Record<string, unknown>
}

export class ErrorLogger {
  static log(error: Error | AppError, context?: ErrorContext): void {
    const logData = {
      message: error.message,
      stack: error.stack,
      name: error.name,
      timestamp: new Date().toISOString(),
      ...context
    }

    if (error instanceof AppError) {
      logData.code = error.code
      logData.statusCode = error.statusCode
      logData.details = error.details
      logData.isOperational = error.isOperational
    }

    // In development, log to console
    if (process.env.NODE_ENV === 'development') {
      console.error('Application Error:', logData)
    }

    // In production, send to external logging service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with external logging service (e.g., Sentry, LogRocket)
      // await externalLogger.log(logData)
    }
  }

  static logAndThrow(
    error: Error | AppError,
    context?: ErrorContext
  ): never {
    this.log(error, context)
    throw error
  }
}

// Error Boundary for Vue Components
export function handleAsyncError<T>(
  promise: Promise<T>,
  context?: ErrorContext
): Promise<ApiResponse<T>> {
  return promise
    .then(data => createSuccessResponse(data))
    .catch(error => {
      ErrorLogger.log(error, context)
      return createErrorResponse<T>(error)
    })
}

// User-Friendly Error Messages
export const USER_FRIENDLY_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.AUTH_REQUIRED]: 'Please log in to continue',
  [ERROR_CODES.AUTH_INVALID_TOKEN]: 'Your session has expired. Please log in again',
  [ERROR_CODES.AUTH_TOKEN_EXPIRED]: 'Your session has expired. Please log in again',
  [ERROR_CODES.AUTH_INSUFFICIENT_PERMISSIONS]: 'You don\'t have permission to perform this action',

  [ERROR_CODES.VALIDATION_FAILED]: 'Please check your input and try again',
  [ERROR_CODES.VALIDATION_REQUIRED_FIELD]: 'This field is required',
  [ERROR_CODES.VALIDATION_INVALID_FORMAT]: 'Please enter a valid value',
  [ERROR_CODES.VALIDATION_DUPLICATE_VALUE]: 'This value already exists',

  [ERROR_CODES.RESOURCE_NOT_FOUND]: 'The requested item could not be found',
  [ERROR_CODES.RESOURCE_CONFLICT]: 'This action conflicts with existing data',
  [ERROR_CODES.RESOURCE_GONE]: 'This item is no longer available',

  [ERROR_CODES.BUSINESS_INSUFFICIENT_STOCK]: 'Not enough items in stock',
  [ERROR_CODES.BUSINESS_INVALID_OPERATION]: 'This operation is not allowed',
  [ERROR_CODES.BUSINESS_RATE_LIMITED]: 'Too many requests. Please try again later',

  [ERROR_CODES.PAYMENT_FAILED]: 'Payment processing failed. Please try again',
  [ERROR_CODES.PAYMENT_DECLINED]: 'Your payment was declined. Please check your payment method',
  [ERROR_CODES.PAYMENT_INSUFFICIENT_FUNDS]: 'Insufficient funds. Please use a different payment method',
  [ERROR_CODES.PAYMENT_INVALID_METHOD]: 'Invalid payment method. Please try a different method',

  [ERROR_CODES.SERVER_INTERNAL_ERROR]: 'Something went wrong on our end. Please try again later',
  [ERROR_CODES.SERVER_SERVICE_UNAVAILABLE]: 'Service temporarily unavailable. Please try again later',
  [ERROR_CODES.SERVER_TIMEOUT]: 'Request timed out. Please try again',
  [ERROR_CODES.SERVER_MAINTENANCE]: 'System under maintenance. Please try again later',
}

export function getUserFriendlyMessage(code: ErrorCode): string {
  return USER_FRIENDLY_MESSAGES[code] || USER_FRIENDLY_MESSAGES[ERROR_CODES.SERVER_INTERNAL_ERROR]
}

// Validation Helpers
export function validateRequired<T>(
  value: T | null | undefined,
  fieldName: string
): T {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(`${fieldName} is required`, fieldName, value)
  }
  return value
}

// validateEmail removed to avoid conflicts with utils/validation.ts
// Use the one from utils/validation.ts instead

export function validatePositiveNumber(
  value: number,
  fieldName: string
): number {
  if (value <= 0) {
    throw new ValidationError(
      `${fieldName} must be greater than 0`,
      fieldName,
      value
    )
  }
  return value
}

export function validateStringLength(
  value: string,
  fieldName: string,
  minLength: number = 0,
  maxLength: number = Infinity
): string {
  if (value.length < minLength) {
    throw new ValidationError(
      `${fieldName} must be at least ${minLength} characters long`,
      fieldName,
      value
    )
  }
  if (value.length > maxLength) {
    throw new ValidationError(
      `${fieldName} must be no more than ${maxLength} characters long`,
      fieldName,
      value
    )
  }
  return value.trim()
}