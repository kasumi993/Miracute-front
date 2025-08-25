interface ToastOptions {
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  closable?: boolean
}

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration: number
  closable: boolean
}

const toasts = ref<Toast[]>([])

export const useToast = () => {
  const show = (message: string, type: Toast['type'], options: ToastOptions = {}) => {
    const toast: Toast = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      duration: options.duration ?? (type === 'error' ? 7000 : 5000),
      closable: options.closable ?? true
    }

    toasts.value.push(toast)

    // Auto remove toast after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        remove(toast.id)
      }, toast.duration)
    }

    return toast.id
  }

  const success = (message: string, options?: ToastOptions) => {
    return show(message, 'success', options)
  }

  const error = (message: string, options?: ToastOptions) => {
    return show(message, 'error', options)
  }

  const warning = (message: string, options?: ToastOptions) => {
    return show(message, 'warning', options)
  }

  const info = (message: string, options?: ToastOptions) => {
    return show(message, 'info', options)
  }

  const remove = (id: string) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clear = () => {
    toasts.value = []
  }

  return {
    toasts: readonly(toasts),
    success,
    error,
    warning,
    info,
    remove,
    clear
  }
}