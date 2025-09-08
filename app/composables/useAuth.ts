import type { User, Session } from '@supabase/supabase-js'

interface AuthUser {
  id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  role: 'customer' | 'admin'
  country?: string
  created_at: string
}

export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  // Reactive state
  const authUser = ref<AuthUser | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => authUser.value?.role === 'admin')
  const userInitials = computed(() => {
    if (authUser.value?.first_name && authUser.value?.last_name) {
      return `${authUser.value.first_name.charAt(0)}${authUser.value.last_name.charAt(0)}`.toUpperCase()
    }
    if (authUser.value?.first_name) {
      return authUser.value.first_name.charAt(0).toUpperCase()
    }
    return user.value?.email?.charAt(0).toUpperCase() || 'U'
  })

  // Fetch user profile data using API (service role)
  const fetchUserProfile = async () => {
    if (!user.value) {
      authUser.value = null
      return
    }

    try {
      // Always use API endpoint with service role for user profile operations
      const response = await $fetch('/api/auth/user')

      if (response.user) {
        authUser.value = response.user
      } else {
        // If user doesn't exist in users table, create them
        await createUserProfile()
      }
    } catch (err: any) {
      console.error('Error fetching user profile:', err)
      error.value = 'Failed to load user profile'
    }
  }

  // Create user profile in database using server-side API
  const createUserProfile = async () => {
    if (!user.value) return

    try {
      console.log('Creating user profile for:', user.value.id, user.value.email)
      
      // Extract name from metadata - could be full_name or separate first/last names
      const metaData = user.value.user_metadata || {}
      let firstName = metaData.first_name || null
      let lastName = metaData.last_name || null
      
      // If we only have full_name, try to split it
      if (!firstName && !lastName && metaData.full_name) {
        const nameParts = metaData.full_name.split(' ')
        firstName = nameParts[0] || null
        lastName = nameParts.slice(1).join(' ') || null
      }
      
      const response = await $fetch('/api/auth/create-user-profile', {
        method: 'POST',
        body: {
          user_id: user.value.id,
          email: user.value.email,
          first_name: firstName,
          last_name: lastName,
          avatar_url: metaData.avatar_url || null
        }
      })
      
      console.log('User profile creation response:', response)
      
      if (response.success) {
        if (response.user) {
          // User profile was created successfully
          authUser.value = response.user
          console.log('User profile created and set:', response.user)
        } else {
          // User profile creation was skipped (likely due to unverified email)
          console.log('User profile creation skipped:', response.message)
          authUser.value = null
        }
      }
      
    } catch (err) {
      console.error('Error creating user profile:', err)
      error.value = 'Failed to create user profile'
      throw err
    }
  }

  // Sign in with magic link
  const signInWithMagicLink = async (email: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (signInError) throw signInError

      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to send magic link'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    isLoading.value = true
    error.value = null

    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (signInError) throw signInError

      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to sign in with Google'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Sign out
  const signOut = async () => {
    isLoading.value = true
    error.value = null

    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      
      authUser.value = null
      await navigateTo('/auth/login')
    } catch (err: any) {
      error.value = err.message || 'Failed to sign out'
      throw err
    } finally {
      isLoading.value = false
    }
  }


  // Update profile using API (service role)
  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user.value) throw new Error('Not authenticated')

    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch('/api/auth/user', {
        method: 'PATCH',
        body: updates
      })

      if (response.user) {
        authUser.value = response.user
        return response.user
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to update profile'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Check if user can access admin features
  const requireAdmin = () => {
    if (!isAuthenticated.value) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }

    if (!isAdmin.value) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      })
    }
  }

  // Initialize auth state
  const init = async () => {
    // Wait for Supabase to initialize
    await nextTick()
    
    if (user.value) {
      await fetchUserProfile()
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id)
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          await fetchUserProfile()
        } catch (error) {
          console.error('Failed to fetch user profile after sign in:', error)
        }
      } else if (event === 'SIGNED_OUT') {
        authUser.value = null
        console.log('User signed out, cleared auth user')
      }
    })
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    user: readonly(user),
    authUser: readonly(authUser),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Computed
    isAuthenticated,
    isAdmin,
    userInitials,

    // Methods
    signInWithMagicLink,
    signInWithGoogle,
    signOut,
    updateProfile,
    fetchUserProfile,
    requireAdmin,
    init,
    clearError
  }
}