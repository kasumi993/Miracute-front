/**
 * Composable for managing admin layout state and responsive behavior
 */
export const useAdminLayout = () => {
  // Global sidebar state
  const isSidebarOpen = ref(false)
  const isMobile = ref(false)

  // Sidebar methods
  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  const closeSidebar = () => {
    isSidebarOpen.value = false
  }

  const openSidebar = () => {
    isSidebarOpen.value = true
  }

  // Responsive breakpoint detection
  const updateBreakpoint = () => {
    if (typeof window !== 'undefined') {
      isMobile.value = window.innerWidth < 1024 // lg breakpoint

      // Auto-close sidebar on desktop
      if (!isMobile.value && isSidebarOpen.value) {
        closeSidebar()
      }
    }
  }

  // Breadcrumb generation
  const generateBreadcrumbs = (routePath: string) => {
    const segments = routePath.split('/').filter(Boolean)
    const crumbs = []

    // Skip 'dashboard' as it's the root
    for (let i = 1; i < segments.length; i++) {
      const segment = segments[i]
      const path = `/${  segments.slice(0, i + 1).join('/')}`

      // Create breadcrumb with proper formatting
      const label = segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())

      crumbs.push({
        label,
        to: i < segments.length - 1 ? path : undefined // Last item shouldn't be a link
      })
    }

    return crumbs
  }

  // Initialize responsive behavior
  onMounted(() => {
    updateBreakpoint()

    const handleResize = () => {
      updateBreakpoint()
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen.value) {
        closeSidebar()
      }
    }

    window.addEventListener('resize', handleResize)
    document.addEventListener('keydown', handleEscape)

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('keydown', handleEscape)
    })
  })

  // Auto-close on route changes
  const route = useRoute()
  watch(() => route.path, () => {
    if (isMobile.value) {
      closeSidebar()
    }
  })

  return {
    // State
    isSidebarOpen: readonly(isSidebarOpen),
    isMobile: readonly(isMobile),

    // Methods
    toggleSidebar,
    closeSidebar,
    openSidebar,
    generateBreadcrumbs
  }
}
