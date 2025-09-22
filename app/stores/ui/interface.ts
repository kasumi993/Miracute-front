import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ToastNotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  persistent?: boolean
  actions?: Array<{
    label: string
    action: () => void
    style?: 'primary' | 'secondary' | 'danger'
  }>
  createdAt: number
}

export interface Modal {
  id: string
  component: string
  props?: Record<string, any>
  options?: {
    persistent?: boolean
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    position?: 'center' | 'top' | 'bottom'
    backdrop?: boolean
    keyboard?: boolean
  }
  createdAt: number
}

export interface LoadingOverlay {
  id: string
  message?: string
  progress?: number
  cancellable?: boolean
  onCancel?: () => void
  createdAt: number
}

interface UIState {
  // Theme management
  theme: ThemeMode
  isDarkMode: boolean

  // Mobile and responsive
  isMobileMenuOpen: boolean
  isSidebarOpen: boolean
  isMobile: boolean
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

  // Loading states
  loadingOverlays: LoadingOverlay[]
  globalLoading: boolean

  // Notifications
  toasts: ToastNotification[]
  maxToasts: number

  // Modals
  modals: Modal[]
  modalBackdropVisible: boolean

  // Layout preferences
  layout: {
    sidebar: {
      collapsed: boolean
      position: 'left' | 'right'
    }
    header: {
      sticky: boolean
      transparent: boolean
    }
    footer: {
      visible: boolean
    }
  }

  // App state
  isOnline: boolean
  pageLoading: boolean

  // User preferences
  preferences: {
    animations: boolean
    reducedMotion: boolean
    soundEnabled: boolean
    compactMode: boolean
    language: string
  }

  // Scroll and focus management
  lastScrollPosition: number
  focusedElement: string | null
}

export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    // Theme
    theme: 'system',
    isDarkMode: false,

    // Mobile and responsive
    isMobileMenuOpen: false,
    isSidebarOpen: true,
    isMobile: false,
    screenSize: 'lg',

    // Loading
    loadingOverlays: [],
    globalLoading: false,

    // Notifications
    toasts: [],
    maxToasts: 5,

    // Modals
    modals: [],
    modalBackdropVisible: false,

    // Layout
    layout: {
      sidebar: {
        collapsed: false,
        position: 'left'
      },
      header: {
        sticky: true,
        transparent: false
      },
      footer: {
        visible: true
      }
    },

    // App state
    isOnline: true,
    pageLoading: false,

    // Preferences
    preferences: {
      animations: true,
      reducedMotion: false,
      soundEnabled: true,
      compactMode: false,
      language: 'en'
    },

    // Scroll and focus
    lastScrollPosition: 0,
    focusedElement: null
  }),

  getters: {
    // Theme getters
    currentTheme: (state) => {
      if (state.theme === 'system') {
        return state.isDarkMode ? 'dark' : 'light'
      }
      return state.theme
    },

    shouldUseDarkMode: (state) => {
      if (state.theme === 'dark') return true
      if (state.theme === 'light') return false
      return state.isDarkMode
    },

    // Mobile and responsive
    isDesktop: (state) => ['lg', 'xl', '2xl'].includes(state.screenSize),
    isTablet: (state) => ['md'].includes(state.screenSize),
    isMobileSize: (state) => ['xs', 'sm'].includes(state.screenSize),

    // Loading states
    hasLoadingOverlays: (state) => state.loadingOverlays.length > 0,
    isLoading: (state) => state.globalLoading || state.loadingOverlays.length > 0,

    // Notifications
    hasToasts: (state) => state.toasts.length > 0,
    visibleToasts: (state) => state.toasts.slice(0, state.maxToasts),

    errorToasts: (state) => state.toasts.filter(toast => toast.type === 'error'),
    successToasts: (state) => state.toasts.filter(toast => toast.type === 'success'),

    // Modals
    hasModals: (state) => state.modals.length > 0,
    activeModal: (state) => state.modals[state.modals.length - 1] || null,
    modalStack: (state) => state.modals,

    // Layout
    sidebarVisible: (state) => state.isSidebarOpen && !state.layout.sidebar.collapsed,

    // Responsive layout
    shouldShowMobileLayout: (state) => state.isMobileSize || state.isMobile,
    shouldCollapseSidebar: (state) => state.isMobileSize && state.isSidebarOpen,

    // Accessibility
    hasReducedMotion: (state) => state.preferences.reducedMotion,
    animationsEnabled: (state) => state.preferences.animations && !state.preferences.reducedMotion
  },

  actions: {
    // Theme management
    setTheme(theme: ThemeMode) {
      this.theme = theme
      this.updateThemeClass()
    },

    toggleTheme() {
      if (this.theme === 'light') {
        this.setTheme('dark')
      } else if (this.theme === 'dark') {
        this.setTheme('system')
      } else {
        this.setTheme('light')
      }
    },

    setDarkMode(isDark: boolean) {
      this.isDarkMode = isDark
      this.updateThemeClass()
    },

    updateThemeClass() {
      if (process.client) {
        const isDark = this.shouldUseDarkMode
        document.documentElement.classList.toggle('dark', isDark)
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
      }
    },

    // Mobile menu management
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
    },

    closeMobileMenu() {
      this.isMobileMenuOpen = false
    },

    openMobileMenu() {
      this.isMobileMenuOpen = true
    },

    // Sidebar management
    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen
    },

    openSidebar() {
      this.isSidebarOpen = true
    },

    closeSidebar() {
      this.isSidebarOpen = false
    },

    setSidebarCollapsed(collapsed: boolean) {
      this.layout.sidebar.collapsed = collapsed
    },

    // Screen size management
    setScreenSize(size: UIState['screenSize']) {
      this.screenSize = size
      this.isMobile = ['xs', 'sm'].includes(size)

      // Auto-close mobile menu on desktop
      if (!this.isMobile) {
        this.isMobileMenuOpen = false
      }
    },

    // Loading overlay management
    showLoadingOverlay(options: Omit<LoadingOverlay, 'id' | 'createdAt'> = {}) {
      const overlay: LoadingOverlay = {
        id: `loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        ...options
      }

      this.loadingOverlays.push(overlay)
      return overlay.id
    },

    hideLoadingOverlay(id?: string) {
      if (id) {
        this.loadingOverlays = this.loadingOverlays.filter(overlay => overlay.id !== id)
      } else {
        this.loadingOverlays = []
      }
    },

    updateLoadingProgress(id: string, progress: number) {
      const overlay = this.loadingOverlays.find(o => o.id === id)
      if (overlay) {
        overlay.progress = progress
      }
    },

    setGlobalLoading(loading: boolean) {
      this.globalLoading = loading
    },

    // Toast notifications
    showToast(options: Omit<ToastNotification, 'id' | 'createdAt'>) {
      const toast: ToastNotification = {
        id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: Date.now(),
        duration: 5000,
        ...options
      }

      this.toasts.push(toast)

      // Auto-remove toast after duration (unless persistent)
      if (!toast.persistent && toast.duration && toast.duration > 0) {
        setTimeout(() => {
          this.removeToast(toast.id)
        }, toast.duration)
      }

      // Limit number of visible toasts
      if (this.toasts.length > this.maxToasts) {
        this.toasts = this.toasts.slice(-this.maxToasts)
      }

      return toast.id
    },

    removeToast(id: string) {
      this.toasts = this.toasts.filter(toast => toast.id !== id)
    },

    clearToasts(type?: ToastNotification['type']) {
      if (type) {
        this.toasts = this.toasts.filter(toast => toast.type !== type)
      } else {
        this.toasts = []
      }
    },

    // Quick toast methods
    showSuccess(title: string, message?: string, options?: Partial<ToastNotification>) {
      return this.showToast({ type: 'success', title, message, ...options })
    },

    showError(title: string, message?: string, options?: Partial<ToastNotification>) {
      return this.showToast({ type: 'error', title, message, persistent: true, ...options })
    },

    showWarning(title: string, message?: string, options?: Partial<ToastNotification>) {
      return this.showToast({ type: 'warning', title, message, ...options })
    },

    showInfo(title: string, message?: string, options?: Partial<ToastNotification>) {
      return this.showToast({ type: 'info', title, message, ...options })
    },

    // Modal management
    showModal(component: string, props?: Record<string, any>, options?: Modal['options']) {
      const modal: Modal = {
        id: `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        component,
        props,
        options: {
          persistent: false,
          size: 'md',
          position: 'center',
          backdrop: true,
          keyboard: true,
          ...options
        },
        createdAt: Date.now()
      }

      this.modals.push(modal)
      this.modalBackdropVisible = true

      // Prevent body scroll
      if (process.client) {
        document.body.style.overflow = 'hidden'
      }

      return modal.id
    },

    closeModal(id?: string) {
      if (id) {
        this.modals = this.modals.filter(modal => modal.id !== id)
      } else {
        // Close top modal
        this.modals.pop()
      }

      // Update backdrop visibility
      this.modalBackdropVisible = this.modals.length > 0

      // Restore body scroll if no modals
      if (this.modals.length === 0 && process.client) {
        document.body.style.overflow = ''
      }
    },

    closeAllModals() {
      this.modals = []
      this.modalBackdropVisible = false

      if (process.client) {
        document.body.style.overflow = ''
      }
    },

    // Layout preferences
    setHeaderSticky(sticky: boolean) {
      this.layout.header.sticky = sticky
    },

    setHeaderTransparent(transparent: boolean) {
      this.layout.header.transparent = transparent
    },

    setFooterVisible(visible: boolean) {
      this.layout.footer.visible = visible
    },

    // User preferences
    setPreference<K extends keyof UIState['preferences']>(
      key: K,
      value: UIState['preferences'][K]
    ) {
      this.preferences[key] = value
    },

    togglePreference(key: keyof Pick<UIState['preferences'], 'animations' | 'reducedMotion' | 'soundEnabled' | 'compactMode'>) {
      this.preferences[key] = !this.preferences[key]
    },

    // Online status
    setOnlineStatus(isOnline: boolean) {
      this.isOnline = isOnline
    },

    // Page loading
    setPageLoading(loading: boolean) {
      this.pageLoading = loading
    },

    // Scroll management
    saveScrollPosition() {
      if (process.client) {
        this.lastScrollPosition = window.scrollY
      }
    },

    restoreScrollPosition() {
      if (process.client && this.lastScrollPosition > 0) {
        window.scrollTo(0, this.lastScrollPosition)
      }
    },

    // Focus management
    setFocusedElement(element: string | null) {
      this.focusedElement = element
    },

    // Initialization
    initialize() {
      if (process.client) {
        // Set initial theme
        this.updateThemeClass()

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        this.setDarkMode(mediaQuery.matches)

        mediaQuery.addEventListener('change', (e) => {
          this.setDarkMode(e.matches)
        })

        // Listen for reduced motion preference
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        this.setPreference('reducedMotion', reducedMotionQuery.matches)

        reducedMotionQuery.addEventListener('change', (e) => {
          this.setPreference('reducedMotion', e.matches)
        })

        // Listen for online status
        this.setOnlineStatus(navigator.onLine)
        window.addEventListener('online', () => this.setOnlineStatus(true))
        window.addEventListener('offline', () => this.setOnlineStatus(false))

        // Listen for screen size changes
        this.updateScreenSize()
        window.addEventListener('resize', () => this.updateScreenSize())
      }
    },

    updateScreenSize() {
      if (process.client) {
        const width = window.innerWidth

        if (width < 640) {
          this.setScreenSize('xs')
        } else if (width < 768) {
          this.setScreenSize('sm')
        } else if (width < 1024) {
          this.setScreenSize('md')
        } else if (width < 1280) {
          this.setScreenSize('lg')
        } else if (width < 1536) {
          this.setScreenSize('xl')
        } else {
          this.setScreenSize('2xl')
        }
      }
    }
  },

})