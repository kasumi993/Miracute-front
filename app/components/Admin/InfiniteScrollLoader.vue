<template>
  <div>
    <!-- Load More Button/Loading State -->
    <div v-if="hasNextPage && !isInitialLoading" class="p-6 text-center border-t border-gray-200">
      <button
        v-if="!isLoadingMore"
        @click="$emit('loadMore')"
        class="btn-secondary"
      >
        Load More Templates
      </button>
      <div v-else class="flex items-center justify-center">
        <Icon name="heroicons:arrow-path" class="w-5 h-5 animate-spin mr-2" />
        Loading more...
      </div>
    </div>

    <!-- Intersection Observer Trigger -->
    <div ref="infiniteScrollTrigger" class="h-4"></div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  hasNextPage: boolean
  isInitialLoading: boolean
  isLoadingMore: boolean
}

interface Emits {
  (e: 'loadMore'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const infiniteScrollTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const setupInfiniteScroll = () => {
  if (!infiniteScrollTrigger.value) return

  observer = new IntersectionObserver(
    (entries) => {
      const [entry] = entries
      if (entry.isIntersecting && props.hasNextPage && !props.isLoadingMore) {
        emit('loadMore')
      }
    },
    {
      rootMargin: '100px'
    }
  )

  observer.observe(infiniteScrollTrigger.value)
}

// Setup infinite scroll after component is mounted
onMounted(() => {
  nextTick(() => {
    setupInfiniteScroll()
  })
})

// Cleanup observer on unmount
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>