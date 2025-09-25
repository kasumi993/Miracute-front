/**
 * Validation Types
 * Types for form validation and error handling
 */

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors?: ValidationError[]
}
