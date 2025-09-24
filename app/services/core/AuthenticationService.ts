/**
 * Centralized Authentication Service
 * Consolidates all authentication logic from scattered files into a single, reliable system
 */

import type {
  AuthUser,
  UserProfile,
  UserProfileCreateInput,
  UserProfileUpdateInput,
  UserRole,
  ApiResponse
} from '~/types/api'
import {
  AppError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  createSuccessResponse,
  ERROR_CODES,
  validateRequired,
  validateEmail
} from '~/utils/errors'
import { BaseApiService } from './BaseApiService'

export interface SignUpCredentials {
  email: string
  password: string
  firstName?: string
  lastName?: string
  marketingOptIn?: boolean
}

export interface SignInCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface PasswordResetRequest {
  email: string
  redirectUrl?: string
}

export interface PasswordUpdateRequest {
  newPassword: string
  confirmPassword: string
}

export interface AuthState {
  user: AuthUser | null
  profile: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export class AuthenticationService extends BaseApiService {
  private static instance: AuthenticationService
  private authState: AuthState = {
    user: null,
    profile: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  }

  private constructor() {
    super({ baseUrl: '/api/auth' })
  }

  static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService()
    }
    return AuthenticationService.instance
  }

  // ==========================================
  // Public Authentication Methods
  // ==========================================

  /**
   * Initialize authentication state
   * Should be called on app startup
   */
  async initialize(): Promise<void> {
    if (!process.client) return

    this.setLoading(true)

    try {
      const { $supabase } = useNuxtApp()
      const { data: { session }, error } = await $supabase.auth.getSession()

      if (error) {
        throw new AuthenticationError('Failed to get session')
      }

      if (session?.user) {
        await this.handleAuthSuccess(session.user)
      } else {
        this.clearAuthState()
      }

      // Listen for auth changes
      $supabase.auth.onAuthStateChange(async (event, session) => {
        await this.handleAuthStateChange(event, session)
      })

    } catch (error) {
      this.handleAuthError(error)
    } finally {
      this.setLoading(false)
    }
  }

  /**
   * Sign up new user
   */
  async signUp(credentials: SignUpCredentials): Promise<ApiResponse<{ user: AuthUser }>> {
    try {
      this.setLoading(true)
      this.clearError()

      // Validate input
      validateRequired(credentials.email, 'Email')
      validateRequired(credentials.password, 'Password')
      validateEmail(credentials.email)

      if (credentials.password.length < 8) {
        throw new ValidationError('Password must be at least 8 characters long', 'password')
      }

      const { $supabase } = useNuxtApp()
      const { data, error } = await $supabase.auth.signUp({
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password,
        options: {
          data: {
            first_name: credentials.firstName?.trim(),
            last_name: credentials.lastName?.trim(),
            full_name: credentials.firstName && credentials.lastName
              ? `${credentials.firstName} ${credentials.lastName}`.trim()
              : undefined,
            marketing_opt_in: credentials.marketingOptIn || false
          }
        }
      })

      if (error) {
        throw this.transformSupabaseError(error)
      }

      if (!data.user) {
        throw new AppError('Sign up failed - no user returned', ERROR_CODES.SERVER_INTERNAL_ERROR)
      }

      // Create user profile
      if (data.user.email_confirmed_at) {
        await this.createUserProfile(data.user)
      }

      return createSuccessResponse({ user: this.transformSupabaseUser(data.user) })

    } catch (error) {
      this.handleAuthError(error)
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  /**
   * Sign in existing user
   */
  async signIn(credentials: SignInCredentials): Promise<ApiResponse<{ user: AuthUser; profile: UserProfile }>> {
    try {
      this.setLoading(true)
      this.clearError()

      // Validate input
      validateRequired(credentials.email, 'Email')
      validateRequired(credentials.password, 'Password')
      validateEmail(credentials.email)

      const { $supabase } = useNuxtApp()
      const { data, error } = await $supabase.auth.signInWithPassword({
        email: credentials.email.toLowerCase().trim(),
        password: credentials.password
      })

      if (error) {
        throw this.transformSupabaseError(error)
      }

      if (!data.user) {
        throw new AuthenticationError('Sign in failed - no user returned')
      }

      await this.handleAuthSuccess(data.user)

      return createSuccessResponse({
        user: this.authState.user!,
        profile: this.authState.profile!
      })

    } catch (error) {
      this.handleAuthError(error)
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    try {
      this.setLoading(true)

      const { $supabase } = useNuxtApp()
      const { error } = await $supabase.auth.signOut()

      if (error) {
        throw this.transformSupabaseError(error)
      }

      this.clearAuthState()

      // Redirect to login page
      await navigateTo('/auth/login')

    } catch (error) {
      this.handleAuthError(error)
      throw error
    } finally {
      this.setLoading(false)
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(request: PasswordResetRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      validateRequired(request.email, 'Email')
      validateEmail(request.email)

      const { $supabase } = useNuxtApp()
      const { error } = await $supabase.auth.resetPasswordForEmail(
        request.email.toLowerCase().trim(),
        {
          redirectTo: request.redirectUrl || `${window.location.origin}/auth/reset-password`
        }
      )

      if (error) {
        throw this.transformSupabaseError(error)
      }

      return createSuccessResponse({
        message: 'Password reset instructions have been sent to your email'
      })

    } catch (error) {
      this.handleAuthError(error)
      throw error
    }
  }

  /**
   * Update user password
   */
  async updatePassword(request: PasswordUpdateRequest): Promise<ApiResponse<{ message: string }>> {
    try {
      validateRequired(request.newPassword, 'New password')
      validateRequired(request.confirmPassword, 'Confirm password')

      if (request.newPassword !== request.confirmPassword) {
        throw new ValidationError('Passwords do not match', 'confirmPassword')
      }

      if (request.newPassword.length < 8) {
        throw new ValidationError('Password must be at least 8 characters long', 'newPassword')
      }

      if (!this.authState.isAuthenticated) {
        throw new AuthenticationError('Must be signed in to update password')
      }

      const { $supabase } = useNuxtApp()
      const { error } = await $supabase.auth.updateUser({
        password: request.newPassword
      })

      if (error) {
        throw this.transformSupabaseError(error)
      }

      return createSuccessResponse({
        message: 'Password updated successfully'
      })

    } catch (error) {
      this.handleAuthError(error)
      throw error
    }
  }

  // ==========================================
  // Profile Management
  // ==========================================

  /**
   * Get current user profile
   */
  async getCurrentProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      if (!this.authState.isAuthenticated || !this.authState.user) {
        throw new AuthenticationError()
      }

      if (this.authState.profile) {
        return createSuccessResponse(this.authState.profile)
      }

      // Fetch from API if not cached
      const response = await this.get<{ user: UserProfile }>('/user')

      if (response.success && response.data?.user) {
        this.authState.profile = response.data.user
        return createSuccessResponse(response.data.user)
      }

      throw new NotFoundError('User profile')

    } catch (error) {
      this.handleAuthError(error)
      throw error
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: UserProfileUpdateInput): Promise<ApiResponse<UserProfile>> {
    try {
      if (!this.authState.isAuthenticated) {
        throw new AuthenticationError()
      }

      // Validate updates
      if (updates.firstName !== undefined) {
        validateRequired(updates.firstName, 'First name')
      }

      const response = await this.patch<{ user: UserProfile }>('/user', updates)

      if (response.success && response.data?.user) {
        this.authState.profile = response.data.user
        return createSuccessResponse(response.data.user)
      }

      throw new AppError('Failed to update profile', ERROR_CODES.SERVER_INTERNAL_ERROR)

    } catch (error) {
      this.handleAuthError(error)
      throw error
    }
  }

  // ==========================================
  // Authorization Methods
  // ==========================================

  /**
   * Check if current user has admin role
   */
  isAdmin(): boolean {
    return this.authState.profile?.role === 'admin'
  }

  /**
   * Check if current user has specific role
   */
  hasRole(role: UserRole): boolean {
    return this.authState.profile?.role === role
  }

  /**
   * Require admin access (throws if not admin)
   */
  requireAdmin(): void {
    if (!this.authState.isAuthenticated) {
      throw new AuthenticationError()
    }

    if (!this.isAdmin()) {
      throw new AuthorizationError('Admin access required')
    }
  }

  /**
   * Require authentication (throws if not authenticated)
   */
  requireAuth(): void {
    if (!this.authState.isAuthenticated) {
      throw new AuthenticationError()
    }
  }

  /**
   * Get current authentication state
   */
  getAuthState(): Readonly<AuthState> {
    return { ...this.authState }
  }

  // ==========================================
  // Private Helper Methods
  // ==========================================

  private async handleAuthSuccess(supabaseUser: any): Promise<void> {
    this.authState.user = this.transformSupabaseUser(supabaseUser)
    this.authState.isAuthenticated = true

    try {
      // Fetch or create user profile
      await this.fetchOrCreateProfile(supabaseUser)
    } catch (error) {
      console.warn('Failed to fetch/create profile:', error)
      // Don't throw - user is still authenticated
    }
  }

  private async handleAuthStateChange(event: string, session: any): Promise<void> {
    switch (event) {
      case 'SIGNED_IN':
        if (session?.user) {
          await this.handleAuthSuccess(session.user)
        }
        break

      case 'SIGNED_OUT':
        this.clearAuthState()
        break

      case 'TOKEN_REFRESHED':
        if (session?.user) {
          this.authState.user = this.transformSupabaseUser(session.user)
        }
        break
    }
  }

  private async fetchOrCreateProfile(supabaseUser: any): Promise<void> {
    try {
      // Try to fetch existing profile
      const response = await this.get<{ user: UserProfile }>('/user', {}, { skipAuth: false })

      if (response.success && response.data?.user) {
        this.authState.profile = response.data.user
        return
      }

      // Profile doesn't exist, create one
      if (response.error?.includes('not found')) {
        await this.createUserProfile(supabaseUser)
      }

    } catch (error) {
      console.warn('Profile fetch/create failed:', error)
    }
  }

  private async createUserProfile(supabaseUser: any): Promise<void> {
    const profileData: UserProfileCreateInput = {
      userId: supabaseUser.id,
      email: supabaseUser.email,
      firstName: supabaseUser.user_metadata?.first_name,
      lastName: supabaseUser.user_metadata?.last_name,
      avatarUrl: supabaseUser.user_metadata?.avatar_url,
      role: supabaseUser.user_metadata?.role || 'customer',
      marketingOptIn: supabaseUser.user_metadata?.marketing_opt_in || false
    }

    const response = await this.post<{ user: UserProfile }>('/create-user-profile', profileData)

    if (response.success && response.data?.user) {
      this.authState.profile = response.data.user
    }
  }

  private transformSupabaseUser(supabaseUser: any): AuthUser {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      emailConfirmed: !!supabaseUser.email_confirmed_at,
      phone: supabaseUser.phone,
      createdAt: supabaseUser.created_at,
      updatedAt: supabaseUser.updated_at,
      userMetadata: supabaseUser.user_metadata || {},
      appMetadata: supabaseUser.app_metadata || {}
    }
  }

  private transformSupabaseError(error: any): AppError {
    switch (error.message) {
      case 'Invalid login credentials':
        return new AuthenticationError('Invalid email or password')
      case 'Email not confirmed':
        return new AuthenticationError('Please check your email and click the confirmation link')
      case 'User already registered':
        return new ValidationError('An account with this email already exists', 'email')
      default:
        return new AppError(
          error.message || 'Authentication failed',
          ERROR_CODES.AUTH_REQUIRED,
          400
        )
    }
  }

  private setLoading(loading: boolean): void {
    this.authState.isLoading = loading
  }

  private clearError(): void {
    this.authState.error = null
  }

  private handleAuthError(error: unknown): void {
    this.authState.error = error instanceof Error ? error.message : String(error)
  }

  private clearAuthState(): void {
    this.authState = {
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    }
  }
}

// Export singleton instance
export const authService = AuthenticationService.getInstance()