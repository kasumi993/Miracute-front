import type { User, Session } from '@supabase/supabase-js'

interface AuthUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'customer' | 'admin'
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
    if (!authUser.value?.full_name) return user.value?.email?.charAt(0).toUpperCase() || 'U'
    const names = authUser.value.full_name.split(' ')
    return names.length > 1 
      ? `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
      : names[0].charAt(0).toUpperCase()
  })

  // Fetch user profile data
  const fetchUserProfile = async () => {
    if (!user.value) {
      authUser.value = null
      return
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      // If user doesn't exist in users table, create them
      if (!data) {
        await createUserProfile()
      } else {
        authUser.value = data
      }
    } catch (err) {
      console.error('Error fetching user profile:', err)
      error.value = 'Failed to load user profile'
    }
  }

  // Create user profile in database
  const createUserProfile = async () => {
    if (!user.value) return

    try {
      const { data, error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.value.id,
          email: user.value.email!,
          full_name: user.value.user_metadata?.full_name || null,
          avatar_url: user.value.user_metadata?.avatar_url || null,
          role: 'customer'
        })
        .select()
        .single()

      if (insertError) throw insertError
      
      authUser.value = data
    } catch (err) {
      console.error('Error creating user profile:', err)
      error.value = 'Failed to create user profile'
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName?: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      })

      if (signUpError) throw signUpError

      return { user: data.user, session: data.session }
    } catch (err: any) {
      error.value = err.message || 'Failed to sign up'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (signInError) throw signInError

      return { user: data.user, session: data.session }
    } catch (err: any) {
      error.value = err.message || 'Failed to sign in'
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

  // Reset password
  const resetPassword = async (email: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (resetError) throw resetError

      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to send reset email'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update password
  const updatePassword = async (newPassword: string) => {
    isLoading.value = true
    error.value = null

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) throw updateError

      return true
    } catch (err: any) {
      error.value = err.message || 'Failed to update password'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update profile
  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user.value) throw new Error('Not authenticated')

    isLoading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.value.id)
        .select()
        .single()

      if (updateError) throw updateError

      authUser.value = data
      return data
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
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile()
      } else if (event === 'SIGNED_OUT') {
        authUser.value = null
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
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    fetchUserProfile,
    requireAdmin,
    init,
    clearError
  }
}