import { defineStore } from 'pinia'

interface UIState {
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  searchModalOpen: boolean
  cartSidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  loading: {
    global: boolean
    page: boolean
  }
  toast: {
    show: boolean
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    duration: number
  } | null
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    sidebarOpen: false,
    mobileMenuOpen: false,
    searchModalOpen: false,
    cartSidebarOpen: false,
    theme: 'system',
    loading: {
      global: false,
      page: false
    },
    toast: null
  }),

  getters: {
    isMobileSidebarOpen: (state) => state.mobileMenuOpen,
    isDesktopSidebarOpen: (state) => state.sidebarOpen,
    isSearchOpen: (state) => state.searchModalOpen,
    isCartOpen: (state) => state.cartSidebarOpen,
    isLoading: (state) => state.loading.global || state.loading.page,
    currentTheme: (state) => state.theme
  },

  actions: {
    // Sidebar actions
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen
    },

    openSidebar() {
      this.sidebarOpen = true
    },

    closeSidebar() {
      this.sidebarOpen = false
    },

    // Mobile menu actions
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
    },

    openMobileMenu() {
      this.mobileMenuOpen = true
    },

    closeMobileMenu() {
      this.mobileMenuOpen = false
    },

    // Search modal actions
    toggleSearchModal() {
      this.searchModalOpen = !this.searchModalOpen
    },

    openSearchModal() {
      this.searchModalOpen = true
    },

    closeSearchModal() {
      this.searchModalOpen = false
    },

    // Cart sidebar actions
    toggleCartSidebar() {
      this.cartSidebarOpen = !this.cartSidebarOpen
    },

    openCartSidebar() {
      this.cartSidebarOpen = true
    },

    closeCartSidebar() {
      this.cartSidebarOpen = false
    },

    // Loading actions
    setGlobalLoading(loading: boolean) {
      this.loading.global = loading
    },

    setPageLoading(loading: boolean) {
      this.loading.page = loading
    },

    // Theme actions
    setTheme(theme: 'light' | 'dark' | 'system') {
      this.theme = theme
      if (process.client) {
        localStorage.setItem('theme', theme)
        this.applyTheme()
      }
    },

    applyTheme() {
      if (process.client) {
        const root = document.documentElement

        if (this.theme === 'dark') {
          root.classList.add('dark')
        } else if (this.theme === 'light') {
          root.classList.remove('dark')
        } else {
          // System theme
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          if (prefersDark) {
            root.classList.add('dark')
          } else {
            root.classList.remove('dark')
          }
        }
      }
    },

    initializeTheme() {
      if (process.client) {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
        if (savedTheme) {
          this.theme = savedTheme
        }
        this.applyTheme()

        // Listen for system theme changes
        if (this.theme === 'system') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
          mediaQuery.addEventListener('change', () => {
            if (this.theme === 'system') {
              this.applyTheme()
            }
          })
        }
      }
    },

    // Toast actions
    showToast(
      message: string,
      type: 'success' | 'error' | 'warning' | 'info' = 'info',
      duration: number = 5000
    ) {
      this.toast = { show: true, message, type, duration }

      if (duration > 0) {
        setTimeout(() => {
          this.hideToast()
        }, duration)
      }
    },

    hideToast() {
      if (this.toast) {
        this.toast.show = false
      }
      setTimeout(() => {
        this.toast = null
      }, 300) // Allow for fade out animation
    },

    showSuccess(message: string, duration?: number) {
      this.showToast(message, 'success', duration)
    },

    showError(message: string, duration?: number) {
      this.showToast(message, 'error', duration)
    },

    showWarning(message: string, duration?: number) {
      this.showToast(message, 'warning', duration)
    },

    showInfo(message: string, duration?: number) {
      this.showToast(message, 'info', duration)
    },

    // Close all modals and sidebars
    closeAll() {
      this.closeSidebar()
      this.closeMobileMenu()
      this.closeSearchModal()
      this.closeCartSidebar()
    },

    // Reset state
    reset() {
      this.sidebarOpen = false
      this.mobileMenuOpen = false
      this.searchModalOpen = false
      this.cartSidebarOpen = false
      this.loading = {
        global: false,
        page: false
      }
      this.toast = null
    }
  }
})
