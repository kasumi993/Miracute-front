<template>
  <div :class="containerClass">
    <div :class="scrollClass">
      <button
        v-for="(media, index) in mediaItems"
        :key="`${layout}-${index}`"
        @click="$emit('select', index)"
        :class="[
          'rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 relative',
          layout === 'horizontal' ? 'w-16 h-16' : 'w-16 h-16 lg:w-20 lg:h-20',
          currentIndex === index
            ? 'border-brand-brown ring-2 ring-brand-brown/20 opacity-100' + (layout === 'horizontal' ? ' scale-105' : '')
            : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-90'
        ]"
      >
        <!-- Video Thumbnail -->
        <video
          v-if="media.type === 'video'"
          :src="media.url"
          class="w-full h-full object-cover"
          muted
          preload="metadata"
        />

        <!-- Image Thumbnail -->
        <img
          v-else
          :src="media.url"
          :alt="`${media.type} ${index + 1}`"
          class="w-full h-full object-cover"
        />

        <!-- Video Play Icon Overlay -->
        <div
          v-if="media.type === 'video'"
          class="absolute inset-0 flex items-center justify-center bg-black/20"
        >
          <Icon
            name="heroicons:play"
            :class="layout === 'horizontal' ? 'w-6 h-6' : 'w-4 h-4 lg:w-5 lg:h-5'"
            class="text-white drop-shadow-lg"
          />
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  mediaItems: Array<{ type: 'video' | 'image', url: string }>
  currentIndex: number
  layout: 'horizontal' | 'vertical'
}

const props = defineProps<Props>()

defineEmits<{
  select: [number]
}>()

// Computed classes based on layout
const containerClass = computed(() => {
  return props.layout === 'horizontal'
    ? 'mt-3'
    : 'flex-shrink-0'
})

const scrollClass = computed(() => {
  return props.layout === 'horizontal'
    ? 'flex space-x-2 overflow-x-auto pb-2 scrollbar-hide'
    : 'flex flex-col space-y-2 h-[500px] overflow-y-auto scrollbar-hide'
})
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>