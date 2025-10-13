/**
 * Authentication & User Types
 * Types for user authentication, profiles, and roles
 */

export type UserRole = 'customer' | 'admin' | 'moderator'

export interface AuthState {
  user: AuthUser | null
  profile: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  error: String | Error | null
}

export interface AuthUser {
  id: string
  email: string
  emailConfirmed: boolean
  phone?: string
  createdAt: string
  updatedAt: string
  userMetadata: UserMetadata
  appMetadata: AppMetadata
}

export interface UserMetadata {
  avatar_url?: string
  first_name?: string
  last_name?: string
}

export interface AppMetadata {
  provider?: string
  providers?: string[]
  role?: UserRole
}

export interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  role: UserRole
  stripeCustomerId?: string
  country?: string
  phoneNumber?: string
  dateOfBirth?: string
  marketingOptIn: boolean
  createdAt: string
  updatedAt: string
}

export interface UserProfileCreateInput {
  userId: string
  email: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  role?: UserRole
  country?: string
  phoneNumber?: string
  marketingOptIn?: boolean
}

export interface UserProfileUpdateInput {
  firstName?: string
  lastName?: string
  avatarUrl?: string
  country?: string
  phoneNumber?: string
  dateOfBirth?: string
  marketingOptIn?: boolean
}
