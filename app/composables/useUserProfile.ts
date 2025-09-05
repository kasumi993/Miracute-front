import type { AuthUser } from './useAuth'

export const useUserProfile = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const { authUser, fetchUserProfile } = useAuth()

  // Update user profile with checkout information
  const updateProfileFromCheckout = async (checkoutData: {
    firstName: string
    lastName: string
    country: string
  }) => {
    if (!user.value) {
      throw new Error('User must be authenticated to update profile')
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          first_name: checkoutData.firstName.trim(),
          last_name: checkoutData.lastName.trim(),
          country: checkoutData.country
        })
        .eq('id', user.value.id)
        .select()
        .single()

      if (error) throw error

      // Refresh the auth user profile
      await fetchUserProfile()
      
      return data
    } catch (error) {
      console.error('Error updating user profile from checkout:', error)
      throw error
    }
  }

  // Get checkout prefill data from user profile
  const getCheckoutPrefillData = () => {
    // Always prioritize the user's email from auth profile or Supabase user
    const email = authUser.value?.email || user.value?.email || ''
    
    if (!authUser.value) {
      return {
        firstName: '',
        lastName: '',
        email,
        country: ''
      }
    }

    return {
      firstName: authUser.value.first_name || '',
      lastName: authUser.value.last_name || '',
      email: email, // Use the fallback email logic here too
      country: authUser.value.country || ''
    }
  }

  // Check if user has complete profile information
  const hasCompleteProfile = computed(() => {
    return !!(
      authUser.value?.first_name &&
      authUser.value?.last_name &&
      authUser.value?.country
    )
  })

  return {
    updateProfileFromCheckout,
    getCheckoutPrefillData,
    hasCompleteProfile
  }
}