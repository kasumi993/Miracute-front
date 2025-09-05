export default defineNuxtPlugin(() => {
  const router = useRouter()
  const user = useSupabaseUser()
  const { storeCurrentPage } = useAuthRedirect()
  
  // Store current page when navigating (for unauthenticated users)
  router.beforeEach((to) => {
    // Only store redirect for unauthenticated users
    if (!user.value) {
      // Don't store certain paths
      const excludePaths = ['/auth/', '/api/']
      if (!excludePaths.some(path => to.path.startsWith(path))) {
        storeCurrentPage()
      }
    }
  })
})