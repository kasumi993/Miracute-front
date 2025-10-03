import { useUserStore } from '~/stores/auth/user' 

export default defineNuxtPlugin(() => {
  const router = useRouter()
  const userStore = useUserStore()
  const { storeCurrentPage } = useAuthRedirect()

  // Store current page when navigating (for unauthenticated users)
  router.beforeEach((to) => {
    // Only store redirect for unauthenticated users
    if (!userStore.isAuthenticatedAndValid) {
      // Don't store certain paths
      const excludePaths = ['/auth/', '/api/']
      if (!excludePaths.some(path => to.path.startsWith(path))) {
        // Pass the route path explicitly to avoid useRoute() call in middleware context
        storeCurrentPage(to.fullPath)
      }
    }
  })
})
