<template>
  <div class="text-center mt-12">
    <!-- Load More Button -->
    <button
      v-if="hasMore && !isLoading"
      @click="loadMore"
      :disabled="isLoadingMore"
      :class="buttonClass"
    >
      <span v-if="!isLoadingMore">{{ loadMoreText }}</span>
      <span v-else class="flex items-center justify-center space-x-2">
        <Icon name="heroicons:arrow-path" class="w-5 h-5 animate-spin" />
        <span>{{ loadingText }}</span>
      </span>
    </button>

    <!-- Auto-scroll trigger -->
    <div
      v-if="autoScroll && hasMore && !isLoading && !isLoadingMore"
      ref="scrollTrigger"
      class="h-1"
    />

    <!-- End message -->
    <div
      v-if="!hasMore && !isLoading && showEndMessage"
      class="text-gray-500 text-sm py-4"
    >
      {{ endMessage }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  hasMore: {
    type: Boolean,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  isLoadingMore: {
    type: Boolean,
    default: false
  },
  loadMoreText: {
    type: String,
    default: 'Show more templates'
  },
  loadingText: {
    type: String,
    default: 'Loading...'
  },
  endMessage: {
    type: String,
    default: 'You\'ve seen all available items'
  },
  showEndMessage: {
    type: Boolean,
    default: true
  },
  autoScroll: {
    type: Boolean,
    default: false
  },
  autoScrollOffset: {
    type: Number,
    default: 200
  },
  buttonClass: {
    type: String,
    default: 'bg-white border-2 border-gray-200 hover:border-brand-sage text-gray-700 hover:text-brand-sage px-8 py-3 rounded-xl transition-all font-medium shadow-sm hover:shadow-md'
  }
})

const emit = defineEmits(['load-more'])

const scrollTrigger = ref(null)

const loadMore = () => {
  if (!props.hasMore || props.isLoadingMore) return
  emit('load-more')
}

const handleIntersection = (entries) => {
  const [entry] = entries
  if (entry.isIntersecting && props.hasMore && !props.isLoading && !props.isLoadingMore) {
    loadMore()
  }
}

let observer = null

onMounted(() => {
  if (props.autoScroll && scrollTrigger.value) {
    observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: `${props.autoScrollOffset}px`,
      threshold: 0.1
    })
    observer.observe(scrollTrigger.value)
  }
})

onUnmounted(() => {
  if (observer && scrollTrigger.value) {
    observer.unobserve(scrollTrigger.value)
    observer.disconnect()
  }
})

watch(() => props.autoScroll, (newValue) => {
  if (newValue && scrollTrigger.value && !observer) {
    observer = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: `${props.autoScrollOffset}px`,
      threshold: 0.1
    })
    observer.observe(scrollTrigger.value)
  } else if (!newValue && observer) {
    observer.disconnect()
    observer = null
  }
})
</script>