<template>
  <div class="space-y-3">
    <!-- Mobile Layout -->
    <div class="sm:hidden">
      <ProductMediaViewer
        :current-media="currentMedia"
        :media-items="mediaItems"
        :current-index="currentIndex"
        :image-translate-x="imageTranslateX"
        class="w-full h-[400px] rounded-lg"
        mobile
        @next="nextMedia"
        @previous="previousMedia"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <template #wishlist-button>
          <slot name="wishlist-button" :class="'absolute top-3 right-3'" />
        </template>
      </ProductMediaViewer>

      <!-- Mobile Thumbnails -->
      <ProductThumbnailCarousel
        v-if="mediaItems.length > 1"
        :media-items="mediaItems"
        :current-index="currentIndex"
        layout="horizontal"
        @select="goToMedia"
      />
    </div>

    <!-- Desktop/Tablet Layout -->
    <div v-if="mediaItems.length > 1" class="hidden sm:flex space-x-4">
      <!-- Vertical Thumbnails -->
      <ProductThumbnailCarousel
        :media-items="mediaItems"
        :current-index="currentIndex"
        layout="vertical"
        @select="goToMedia"
      />

      <!-- Main Media -->
      <div class="relative flex-1 flex items-start">
        <ProductMediaViewer
          :current-media="currentMedia"
          :media-items="mediaItems"
          :current-index="currentIndex"
          class="w-full max-w-[500px] h-[500px] mx-auto rounded-lg lg:rounded-xl"
          @next="nextMedia"
          @previous="previousMedia"
        />
      </div>
    </div>

    <!-- Desktop Single Media -->
    <div v-else class="hidden sm:block">
      <ProductMediaViewer
        :current-media="currentMedia"
        :media-items="mediaItems"
        :current-index="currentIndex"
        class="w-full max-w-[500px] h-[500px] mx-auto rounded-lg lg:rounded-xl"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  images: string[]
  productName: string
  initialIndex?: number
  videoUrl?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0
})

// Media type definition
type MediaItem = {
  type: 'video' | 'image'
  url: string
}

// Create unified media items array (video first, then images)
const mediaItems = computed(() => {
  const items: MediaItem[] = []

  if (props.videoUrl) {
    items.push({ type: 'video', url: props.videoUrl })
  }

  if (props.images?.length) {
    items.push(...props.images.map(image => ({ type: 'image' as const, url: image })))
  }

  return items
})

// Current media state
const currentIndex = ref(Math.min(props.initialIndex, mediaItems.value.length - 1))
const currentMedia = computed(() => mediaItems.value[currentIndex.value] || null)

// Touch gesture state (mobile only)
const touchStartX = ref(0)
const touchEndX = ref(0)
const imageTranslateX = ref(0)
const isDragging = ref(false)

// Debounced navigation
let navigationTimeout: NodeJS.Timeout | null = null

const goToMedia = (index: number) => {
  if (index >= 0 && index < mediaItems.value.length && index !== currentIndex.value) {
    if (navigationTimeout) clearTimeout(navigationTimeout)

    navigationTimeout = setTimeout(() => {
      currentIndex.value = index
      navigationTimeout = null
    }, 50)
  }
}

const nextMedia = () => {
  if (currentIndex.value < mediaItems.value.length - 1) {
    goToMedia(currentIndex.value + 1)
  }
}

const previousMedia = () => {
  if (currentIndex.value > 0) {
    goToMedia(currentIndex.value - 1)
  }
}

// Touch gesture methods
const onTouchStart = (event: TouchEvent) => {
  touchStartX.value = event.touches[0].clientX
  imageTranslateX.value = 0
  isDragging.value = true
}

const onTouchMove = (event: TouchEvent) => {
  if (!isDragging.value) return

  const currentX = event.touches[0].clientX
  const diffX = currentX - touchStartX.value
  const maxDrag = 100
  imageTranslateX.value = Math.max(-maxDrag, Math.min(maxDrag, diffX))
}

const onTouchEnd = (event: TouchEvent) => {
  if (!isDragging.value) return

  touchEndX.value = event.changedTouches[0].clientX
  const diffX = touchStartX.value - touchEndX.value
  const threshold = 75

  imageTranslateX.value = 0
  isDragging.value = false

  if (Math.abs(diffX) > threshold) {
    if (diffX > 0) {
      nextMedia()
    } else {
      previousMedia()
    }
  }
}

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') {
    previousMedia()
  } else if (event.key === 'ArrowRight') {
    nextMedia()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  if (navigationTimeout) {
    clearTimeout(navigationTimeout)
    navigationTimeout = null
  }
})

// Expose core methods
defineExpose({
  goToMedia,
  nextMedia,
  previousMedia,
  currentIndex: readonly(currentIndex),
  currentMedia: readonly(currentMedia)
})
</script>

<style scoped>
.touch-pan-x {
  touch-action: pan-x;
}
</style>