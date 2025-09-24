/**
 * Professional Server-Side Authentication Utilities
 * Replaces scattered admin auth logic with centralized, secure system
 */

import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~/types/database'
import type { H3Event } from 'h3'
import type { UserRole } from '~/types/api'
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  ERROR_CODES
} from '~/utils/errors'

export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
  emailConfirmed: boolean
  createdAt: string
}

export interface AuthContext {
  user: AuthenticatedUser
  supabase: ReturnType<typeof serverSupabaseServiceRole>
}

/**
 * Extract and validate authentication token from request
 */
async function extractAuthUser(event: H3Event): Promise<any> {
  try {
    const user = await serverSupabaseUser(event)

    if (!user) {
      throw new AuthenticationError('No authentication token provided')
    }

    if (!user.email_confirmed_at) {
      throw new AuthenticationError('Email address not confirmed')
    }

    return user

  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error
    }
    throw new AuthenticationError('Invalid authentication token')
  }
}

/**
 * Fetch user profile with role from database
 */
async function fetchUserProfile(
  supabase: ReturnType<typeof serverSupabaseServiceRole>,
  userId: string
): Promise<AuthenticatedUser> {
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, email, role, created_at')
    .eq('id', userId)
    .single()

  if (userError) {
    if (userError.code === 'PGRST116') {
      throw new AuthenticationError('User profile not found')
    }
    throw new AppError(
      'Failed to fetch user profile',
      ERROR_CODES.SERVER_INTERNAL_ERROR,
      500,
      { supabaseError: userError }
    )
  }

  if (!userData) {
    throw new AuthenticationError('User profile not found')
  }

  return {
    id: userData.id,
    email: userData.email,
    role: userData.role as UserRole,
    emailConfirmed: true,
    createdAt: userData.created_at
  }
}

/**
 * Core authentication middleware
 * Validates token and fetches user profile
 */
export async function requireAuthentication(event: H3Event): Promise<AuthContext> {
  try {
    // Extract and validate auth user
    const authUser = await extractAuthUser(event)

    // Get service role client
    const supabase = serverSupabaseServiceRole<Database>(event)

    // Fetch user profile with role
    const user = await fetchUserProfile(supabase, authUser.id)

    return { user, supabase }

  } catch (error) {
    if (error instanceof AppError) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message
      })
    }

    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }
}

/**
 * Admin-only authentication middleware
 * Validates token and ensures user has admin role
 */
export async function requireAdminAuthentication(event: H3Event): Promise<AuthContext> {
  const context = await requireAuthentication(event)

  if (context.user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }

  return context
}

/**
 * Role-based authentication middleware
 * Validates token and ensures user has required role
 */
export async function requireRole(
  event: H3Event,
  requiredRole: UserRole
): Promise<AuthContext> {
  const context = await requireAuthentication(event)

  if (context.user.role !== requiredRole) {
    throw createError({
      statusCode: 403,
      statusMessage: `${requiredRole} access required`
    })
  }

  return context
}

/**
 * Optional authentication middleware
 * Returns user context if authenticated, null otherwise
 */
export async function getOptionalAuth(event: H3Event): Promise<AuthContext | null> {
  try {
    return await requireAuthentication(event)
  } catch {
    return null
  }
}

/**
 * Check if current request has admin access
 * Does not throw, returns boolean
 */
export async function hasAdminAccess(event: H3Event): Promise<boolean> {
  try {
    const context = await requireAuthentication(event)
    return context.user.role === 'admin'
  } catch {
    return false
  }
}

/**
 * Resource ownership validation
 * Ensures user can only access their own resources (unless admin)
 */
export async function requireResourceOwnership(
  event: H3Event,
  resourceUserId: string
): Promise<AuthContext> {
  const context = await requireAuthentication(event)

  // Admins can access any resource
  if (context.user.role === 'admin') {
    return context
  }

  // Regular users can only access their own resources
  if (context.user.id !== resourceUserId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied - insufficient permissions'
    })
  }

  return context
}

/**
 * Rate limiting helper for authenticated endpoints
 */
export async function checkRateLimit(
  event: H3Event,
  action: string,
  maxRequests: number = 10,
  windowMinutes: number = 1
): Promise<void> {
  // This is a basic implementation
  // In production, use Redis or similar for distributed rate limiting

  const context = await requireAuthentication(event)
  const key = `rate_limit:${context.user.id}:${action}`

  // TODO: Implement proper rate limiting with Redis
  // For now, just log the attempt
  console.log(`Rate limit check for user ${context.user.id}, action ${action}`)
}

/**
 * Audit logging for sensitive operations
 */
export async function auditLog(
  event: H3Event,
  action: string,
  resource: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const context = await getOptionalAuth(event)
    const clientIP = getClientIP(event)
    const userAgent = getHeader(event, 'user-agent')

    const auditEntry = {
      timestamp: new Date().toISOString(),
      action,
      resource,
      userId: context?.user.id,
      userEmail: context?.user.email,
      userRole: context?.user.role,
      clientIP,
      userAgent,
      details
    }

    // In production, send to external audit service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to external audit logging service
      console.log('AUDIT:', auditEntry)
    } else {
      console.log('🔍 Audit Log:', auditEntry)
    }

  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw - audit logging failure shouldn't break the request
  }
}

/**
 * Security headers middleware
 */
export function setSecurityHeaders(event: H3Event): void {
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  }

  Object.entries(headers).forEach(([key, value]) => {
    setHeader(event, key, value)
  })
}

/**
 * CORS handling for API endpoints
 */
export function handleCORS(event: H3Event, allowedOrigins: string[] = []): void {
  const origin = getHeader(event, 'origin')
  const method = getMethod(event)

  // Handle preflight requests
  if (method === 'OPTIONS') {
    setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
    setHeader(event, 'Access-Control-Max-Age', '86400')
  }

  // Set CORS headers
  if (origin && (allowedOrigins.length === 0 || allowedOrigins.includes(origin))) {
    setHeader(event, 'Access-Control-Allow-Origin', origin)
    setHeader(event, 'Access-Control-Allow-Credentials', 'true')
  }
}

// Backward compatibility exports
export const validateAdminAccess = requireAdminAuthentication
export const adminAuth = requireAdminAuthentication