// Input validation and sanitization utilities
import { z } from 'zod'

export const createValidator = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown): T => {
    try {
      return schema.parse(data)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Validation Error',
          data: {
            errors: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          }
        })
      }
      throw error
    }
  }
}

// Common validation schemas
export const schemas = {
  email: z.string().email().max(255),
  uuid: z.string().uuid(),
  positiveNumber: z.number().positive(),
  couponCode: z.string().min(3).max(50).regex(/^[A-Z0-9_-]+$/),
  pagination: z.object({
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(10)
  }),
  productId: z.string().uuid(),
  cartItem: z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().min(1).max(999),
    price: z.number().positive().optional()
  })
}

// Sanitization functions
export function sanitizeString(input: string): string {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}