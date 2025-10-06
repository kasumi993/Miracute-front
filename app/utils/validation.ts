import { z } from 'zod'

// Email validation
export const emailSchema = z.string().email('Invalid email address')

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

// Name validation
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens and apostrophes')

// Phone validation
export const phoneSchema = z
  .string()
  .regex(/^[+]?[(]?[\d\s\-\(\)]{10,}$/, 'Invalid phone number format')

// URL validation
export const urlSchema = z.string().url('Invalid URL format')

// Slug validation
export const slugSchema = z
  .string()
  .min(1, 'Slug is required')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug can only contain lowercase letters, numbers and hyphens')

// Product validation schemas
export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100),
  slug: slugSchema,
  description: z.string().optional(),
  short_description: z.string().max(200).optional(),
  price: z.string().regex(/^\d+(\.\d{2})?$/, 'Invalid price format'),
  compare_at_price: z.string().regex(/^\d+(\.\d{2})?$/, 'Invalid price format').optional(),
  category_id: z.string().uuid().optional(),
  template_type: z.string().optional(),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  tags: z.array(z.string()).optional(),
  software_required: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false)
})

// Category validation schemas
export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50),
  slug: slugSchema,
  description: z.string().optional(),
  seo_title: z.string().max(60).optional(),
  seo_description: z.string().max(160).optional(),
  sort_order: z.number().min(0).default(0),
  is_active: z.boolean().default(true)
})

// User profile validation
export const userProfileSchema = z.object({
  first_name: nameSchema.nullable().optional(),
  last_name: nameSchema.nullable().optional(),
  country: z.string().nullable().optional(),
  avatar_url: urlSchema.nullable().optional()
})

// User profile update validation (for existing users)
export const userProfileUpdateSchema = z.object({
  first_name: z.string().min(1, 'First name cannot be empty').optional().nullable(),
  last_name: z.string().min(1, 'Last name cannot be empty').optional().nullable(),
  country: z.string().optional().nullable(),
  avatar_url: urlSchema.optional().nullable()
})

// Auth validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  first_name: nameSchema.optional(),
  last_name: nameSchema.optional()
})

export const resetPasswordSchema = z.object({
  email: emailSchema
})

export const updatePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: passwordSchema,
  confirm_password: z.string()
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password']
})

// Validation helper functions
export function validateEmail(email: string): { valid: boolean; error?: string } {
  try {
    emailSchema.parse(email)
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message }
    }
    return { valid: false, error: 'Invalid email' }
  }
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  try {
    passwordSchema.parse(password)
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message }
    }
    return { valid: false, error: 'Invalid password' }
  }
}

export function validateSlug(slug: string): { valid: boolean; error?: string } {
  try {
    slugSchema.parse(slug)
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message }
    }
    return { valid: false, error: 'Invalid slug format' }
  }
}

// Generate slug from text
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

// Validate and parse form data
export function validateFormData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true
  data: T
} | {
  success: false
  errors: Record<string, string>
} {
  try {
    const parsedData = schema.parse(data)
    return { success: true, data: parsedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      if (error.errors && Array.isArray(error.errors)) {
        error.errors.forEach((err) => {
          const path = err.path.join('.')
          errors[path] = err.message
        })
      }
      return { success: false, errors }
    }
    return { success: false, errors: { _root: 'Validation failed' } }
  }
}
