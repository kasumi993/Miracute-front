// Global Vue component property typings
import type {} from 'vue'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $device?: {
      isDesktop?: boolean
      isMobile?: boolean
      isTablet?: boolean
    }
  }
}

export {}


