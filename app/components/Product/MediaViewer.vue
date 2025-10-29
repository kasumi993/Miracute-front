<template>
  <div
    :class="[
      'relative overflow-hidden bg-gray-100 group',
      mobile ? 'touch-pan-x select-none' : '',
      className
    ]"
    @touchstart="mobile ? $emit('touchstart', $event) : null"
    @touchmove="mobile ? $emit('touchmove', $event) : null"
    @touchend="mobile ? $emit('touchend', $event) : null"
  >
    <!-- Current Media Display -->
    <div class="w-full h-full relative">
      <!-- Video Display -->
      <video
        v-if="currentMedia?.type === 'video'"
        ref="videoRef"
        :src="currentMedia.url"
        class="w-full h-full object-cover transition-all duration-300"
        :style="mobile && imageTranslateX ? { transform: `translateX(${imageTranslateX}px)` } : {}"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
        @play="isVideoPlaying = true"
        @pause="isVideoPlaying = false"
        @error="onVideoError"
        @loadstart="isVideoLoading = true"
        @loadeddata="isVideoLoading = false"
        @canplay="onVideoCanPlay"
      />

      <!-- Image Display -->
      <img
        v-else-if="currentMedia?.type === 'image'"
        :src="currentMedia.url"
        :alt="currentMedia.type"
        class="w-full h-full object-cover transition-all duration-300"
        :style="mobile && imageTranslateX ? { transform: `translateX(${imageTranslateX}px)` } : {}"
      >

      <!-- Placeholder -->
      <div v-else class="w-full h-full flex items-center justify-center">
        <Icon name="heroicons:photo" class="w-16 h-16 text-gray-400" />
      </div>

      <!-- Loading/Error States -->
      <div
        v-if="currentMedia?.type === 'video' && isVideoLoading"
        class="absolute inset-0 flex items-center justify-center bg-gray-100"
      >
        <div class="flex flex-col items-center space-y-2">
          <div class="w-8 h-8 border-2 border-brand-brown border-t-transparent rounded-full animate-spin"></div>
          <span class="text-sm text-gray-600">Loading video...</span>
        </div>
      </div>

      <div
        v-if="currentMedia?.type === 'video' && hasVideoError"
        class="absolute inset-0 flex items-center justify-center bg-gray-100"
      >
        <div class="flex flex-col items-center space-y-2 text-center p-4">
          <Icon name="heroicons:exclamation-triangle" class="w-12 h-12 text-gray-400" />
          <span class="text-sm text-gray-600">Video failed to load</span>
          <button
            @click="retryVideo"
            class="px-3 py-1 bg-brand-brown text-white text-xs rounded hover:bg-brand-brown/80 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation Arrows -->
    <div v-if="mediaItems.length > 1" class="absolute inset-0 flex items-center justify-between p-3 pointer-events-none">
      <button
        @click="$emit('previous')"
        :class="[
          'bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 pointer-events-auto',
          mobile ? 'w-12 h-12' : 'w-10 h-10 opacity-0 group-hover:opacity-100',
          currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
        ]"
        :disabled="currentIndex === 0"
      >
        <Icon name="heroicons:chevron-left" :class="mobile ? 'w-6 h-6' : 'w-5 h-5'" class="text-gray-700" />
      </button>

      <button
        @click="$emit('next')"
        :class="[
          'bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 pointer-events-auto',
          mobile ? 'w-12 h-12' : 'w-10 h-10 opacity-0 group-hover:opacity-100',
          currentIndex === mediaItems.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
        ]"
        :disabled="currentIndex === mediaItems.length - 1"
      >
        <Icon name="heroicons:chevron-right" :class="mobile ? 'w-6 h-6' : 'w-5 h-5'" class="text-gray-700" />
      </button>
    </div>

    <!-- Media Counter -->
    <div v-if="mediaItems.length > 1" class="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur">
      {{ currentIndex + 1 }} / {{ mediaItems.length }}
    </div>

    <!-- Video Status -->
    <div v-if="currentMedia?.type === 'video'" class="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur flex items-center">
      <Icon :name="isVideoPlaying ? 'heroicons:pause' : 'heroicons:play'" class="w-3 h-3 mr-1" />
      {{ isVideoPlaying ? 'Playing' : 'Paused' }}
    </div>

    <!-- Zoom Icon (Images only, desktop) -->
    <div v-if="currentMedia?.type === 'image' && !mobile" class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <div class="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer">
        <Icon name="heroicons:magnifying-glass-plus" class="w-4 h-4 text-gray-700" />
      </div>
    </div>

    <!-- Wishlist Slot -->
    <slot name="wishlist-button" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentMedia: { type: 'video' | 'image', url: string } | null
  mediaItems: Array<{ type: 'video' | 'image', url: string }>
  currentIndex: number
  imageTranslateX?: number
  mobile?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  imageTranslateX: 0,
  mobile: false,
  className: ''
})

defineEmits<{
  next: []
  previous: []
  touchstart: [TouchEvent]
  touchmove: [TouchEvent]
  touchend: [TouchEvent]
}>()

// Video state
const videoRef = ref<HTMLVideoElement | null>(null)
const isVideoPlaying = ref(false)
const isVideoLoading = ref(false)
const hasVideoError = ref(false)

// Watch for media changes and handle video
watch(() => props.currentMedia, (newMedia, oldMedia) => {
  hasVideoError.value = false
  isVideoLoading.value = false
  isVideoPlaying.value = false

  if (newMedia?.url === oldMedia?.url) return

  nextTick(() => {
    if (newMedia?.type === 'video' && videoRef.value) {
      videoRef.value.currentTime = 0
      videoRef.value.play().catch(() => {
        // Ignore autoplay failures
      })
    } else if (oldMedia?.type === 'video' && videoRef.value) {
      videoRef.value.pause()
      videoRef.value.currentTime = 0
    }
  })
})

// Video handlers
const onVideoError = () => {
  hasVideoError.value = true
  isVideoLoading.value = false
}

const onVideoCanPlay = () => {
  hasVideoError.value = false
  isVideoLoading.value = false
}

const retryVideo = () => {
  if (videoRef.value && props.currentMedia?.type === 'video') {
    hasVideoError.value = false
    isVideoLoading.value = true
    videoRef.value.load()
  }
}
</script>