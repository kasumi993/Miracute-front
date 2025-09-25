// Global window typings
export {}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}


