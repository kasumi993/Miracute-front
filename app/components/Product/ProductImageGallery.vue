<template>
  <div class="space-y-3">
    <!-- Mobile: Main Image with Touch Gestures -->
    <div class="md:hidden">
      <div
        class="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 group touch-pan-x select-none"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <img
          v-if="selectedImage"
          :src="selectedImage"
          :alt="productName"
          class="w-full h-full object-cover transition-all duration-300"
          :style="{ transform: `translateX(${imageTranslateX}px)` }"
        >
        <div v-else class="w-full h-full flex items-center justify-center">
          <Icon name="heroicons:photo" class="w-16 h-16 text-gray-400" />
        </div>

        <!-- Mobile Navigation Arrows (Always Visible) -->
        <div v-if="images.length > 1" class="absolute inset-0 flex items-center justify-between p-3 pointer-events-none">
          <!-- Previous Button -->
          <button
            @click="previousImage"
            class="w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 pointer-events-auto"
            :disabled="currentImageIndex === 0"
            :class="currentImageIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''"
          >
            <Icon name="heroicons:chevron-left" class="w-6 h-6 text-gray-700" />
          </button>

          <!-- Next Button -->
          <button
            @click="nextImage"
            class="w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 pointer-events-auto"
            :disabled="currentImageIndex === images.length - 1"
            :class="currentImageIndex === images.length - 1 ? 'opacity-50 cursor-not-allowed' : ''"
          >
            <Icon name="heroicons:chevron-right" class="w-6 h-6 text-gray-700" />
          </button>
        </div>

        <!-- Image Counter -->
        <div v-if="images.length > 1" class="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur">
          {{ currentImageIndex + 1 }} / {{ images.length }}
        </div>

        <!-- Wishlist Button (Mobile) -->
        <slot name="wishlist-button" :class="'absolute top-3 right-3 lg:hidden'" />
      </div>

      <!-- Mobile: Enhanced Thumbnail Carousel -->
      <div v-if="images.length > 1" class="mt-3">
        <div class="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            v-for="(image, index) in images"
            :key="index"
            @click="goToImage(index)"
            :class="[
              'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0',
              currentImageIndex === index
                ? 'border-brand-brown ring-2 ring-brand-brown/20 scale-105'
                : 'border-gray-200'
            ]"
          >
            <img :src="image" :alt="`Thumbnail ${index + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop/Tablet: Main Image with Left Vertical Thumbnails -->
    <div v-if="images.length > 1" class="hidden md:flex space-x-4">
      <!-- Vertical Thumbnail Strip (Left Side) -->
      <div class="flex-shrink-0">
        <div class="flex flex-col space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
          <button
            v-for="(image, index) in images"
            :key="index"
            @click="goToImage(index)"
            :class="[
              'w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0',
              currentImageIndex === index
                ? 'border-brand-brown ring-2 ring-brand-brown/20'
                : 'border-gray-200 hover:border-gray-300'
            ]"
          >
            <img :src="image" :alt="`Thumbnail ${index + 1}`" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Main Image (Right Side) -->
      <div class="relative flex-1 flex items-start">
        <div class="relative w-full max-w-full aspect-square">
          <div class="rounded-lg lg:rounded-xl overflow-hidden bg-gray-100 group w-full h-full">
            <img
              v-if="selectedImage"
              :src="selectedImage"
              :alt="productName"
              class="w-full h-full object-cover transition-all duration-300"
            >
            <div v-else class="w-full h-full flex items-center justify-center">
              <Icon name="heroicons:photo" class="w-16 h-16 text-gray-400" />
            </div>

            <!-- Desktop Navigation Arrows (Show on Hover) -->
            <div class="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
              <!-- Previous Button -->
              <button
                @click="previousImage"
                class="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 pointer-events-auto"
                :disabled="currentImageIndex === 0"
                :class="currentImageIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''"
              >
                <Icon name="heroicons:chevron-left" class="w-5 h-5 text-gray-700" />
              </button>

              <!-- Next Button -->
              <button
                @click="nextImage"
                class="w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 pointer-events-auto"
                :disabled="currentImageIndex === images.length - 1"
                :class="currentImageIndex === images.length - 1 ? 'opacity-50 cursor-not-allowed' : ''"
              >
                <Icon name="heroicons:chevron-right" class="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <!-- Image Counter -->
            <div class="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur">
              {{ currentImageIndex + 1 }} / {{ images.length }}
            </div>

            <!-- Zoom Icon (Desktop) -->
            <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div class="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer">
                <Icon name="heroicons:magnifying-glass-plus" class="w-4 h-4 text-gray-700" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Desktop/Tablet: Single Image (No Carousel) -->
    <div v-else class="hidden md:block">
      <div class="relative w-full max-w-full aspect-square">
        <div class="rounded-lg lg:rounded-xl overflow-hidden bg-gray-100 group w-full h-full">
          <img
            v-if="selectedImage"
            :src="selectedImage"
            :alt="productName"
            class="w-full h-full object-cover transition-all duration-300"
          >
          <div v-else class="w-full h-full flex items-center justify-center">
            <Icon name="heroicons:photo" class="w-16 h-16 text-gray-400" />
          </div>

          <!-- Zoom Icon (Desktop) -->
          <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div class="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer">
              <Icon name="heroicons:magnifying-glass-plus" class="w-4 h-4 text-gray-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  images: string[]
  productName: string
  initialIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0
})

// State
const currentImageIndex = ref(props.initialIndex)
const selectedImage = ref(props.images[props.initialIndex] || '')

// Touch gesture state
const touchStartX = ref(0)
const touchEndX = ref(0)
const imageTranslateX = ref(0)
const isDragging = ref(false)

// Watch for image changes
watch(() => props.images, (newImages) => {
  if (newImages.length > 0) {
    selectedImage.value = newImages[currentImageIndex.value] || newImages[0]
  }
}, { immediate: true })

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

  // Limit the drag distance to prevent too much movement
  const maxDrag = 100
  imageTranslateX.value = Math.max(-maxDrag, Math.min(maxDrag, diffX))
}

const onTouchEnd = (event: TouchEvent) => {
  if (!isDragging.value) return

  touchEndX.value = event.changedTouches[0].clientX
  const diffX = touchStartX.value - touchEndX.value
  const threshold = 75 // Minimum swipe distance

  // Reset image position
  imageTranslateX.value = 0
  isDragging.value = false

  // Determine swipe direction and change image
  if (Math.abs(diffX) > threshold) {
    if (diffX > 0) {
      // Swiped left, go to next image
      nextImage()
    } else {
      // Swiped right, go to previous image
      previousImage()
    }
  }
}

// Image carousel methods
const goToImage = (index: number) => {
  if (props.images && index >= 0 && index < props.images.length) {
    currentImageIndex.value = index
    selectedImage.value = props.images[index]
  }
}

const nextImage = () => {
  if (props.images && currentImageIndex.value < props.images.length - 1) {
    goToImage(currentImageIndex.value + 1)
  }
}

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    goToImage(currentImageIndex.value - 1)
  }
}

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') {
    previousImage()
  } else if (event.key === 'ArrowRight') {
    nextImage()
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// Expose methods for parent component
defineExpose({
  goToImage,
  nextImage,
  previousImage,
  currentImageIndex: readonly(currentImageIndex)
})
</script>

<style scoped>
/* Custom scrollbar hiding utility */
.scrollbar-hide {
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Safari and Chrome */
}

/* Smooth transitions for mobile interactions */
.touch-pan-x {
  touch-action: pan-x;
}
</style>