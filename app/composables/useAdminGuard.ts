export const useAdminGuard = () => {
  const isCheckingAccess = ref(true)
  const hasAdminAccess = ref(false)

  const checkAdminAccess = async () => {
    console.log('Admin guard: Checking access...')
    
    const supabase = useSupabaseClient()
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Admin guard - Session found:', !!session)
      
      if (!session || !session.user) {
        console.log('Admin guard: No session, redirecting to home...')
        if (process.client) {
          window.location.replace('/')
        }
        return
      }
      
      const userRole = session.user.app_metadata?.role
      console.log('Admin guard - User role:', userRole)
      
      if (userRole !== 'admin') {
        console.log('Admin guard: Not admin, redirecting to home...')
        if (process.client) {
          window.location.replace('/')
        }
        return
      }
      
      console.log('Admin guard: Admin access granted')
      hasAdminAccess.value = true
      
    } catch (error) {
      console.error('Admin guard access error:', error)
      if (process.client) {
        window.location.replace('/')
      }
    } finally {
      isCheckingAccess.value = false
    }
  }

  // Auto-check on creation
  onMounted(async () => {
    await checkAdminAccess()
  })

  return {
    isCheckingAccess: readonly(isCheckingAccess),
    hasAdminAccess: readonly(hasAdminAccess),
    checkAdminAccess
  }
}