<template>
  <div class="overflow-x-auto pb-4 px-4 sm:px-0 -mx-4 sm:mx-0">
    <div class="flex space-x-4 sm:space-x-6 min-w-max pl-4 sm:pl-0">
      <div
        v-for="i in count"
        :key="i"
        class="group flex-none animate-pulse"
        :class="cardWidthClass"
      >
        <div class="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden">
          <!-- Image skeleton -->
          <div
            class="bg-gray-200"
            :class="imageHeightClass"
          ></div>

          <!-- Content skeleton -->
          <div class="p-4 sm:p-5">
            <!-- Title skeleton -->
            <div
              v-if="showTitle"
              class="bg-gray-200 rounded mb-2"
              :class="titleHeightClass"
            ></div>

            <!-- Description skeleton -->
            <div
              v-if="showDescription"
              class="bg-gray-200 rounded mb-4"
              :class="descriptionHeightClass"
            ></div>

            <!-- Tags skeleton -->
            <div v-if="showTags" class="flex space-x-2">
              <div
                v-for="j in tagCount"
                :key="j"
                class="bg-gray-200 rounded"
                :class="tagSizeClass"
              ></div>
            </div>

            <!-- Custom content skeleton -->
            <div v-if="customContent" v-html="customContent"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  count?: number
  cardWidth?: 'sm' | 'md' | 'lg' | 'xl'
  imageHeight?: 'sm' | 'md' | 'lg'
  showTitle?: boolean
  showDescription?: boolean
  showTags?: boolean
  tagCount?: number
  titleHeight?: 'sm' | 'md' | 'lg'
  descriptionHeight?: 'sm' | 'md' | 'lg'
  tagSize?: 'sm' | 'md' | 'lg'
  customContent?: string
}

const props = withDefaults(defineProps<Props>(), {
  count: 4,
  cardWidth: 'lg',
  imageHeight: 'md',
  showTitle: true,
  showDescription: true,
  showTags: true,
  tagCount: 3,
  titleHeight: 'md',
  descriptionHeight: 'sm',
  tagSize: 'sm'
})

// Computed classes for different sizes
const cardWidthClass = computed(() => {
  const widthClasses = {
    sm: 'w-64 sm:w-72',
    md: 'w-68 sm:w-76',
    lg: 'w-72 sm:w-80',
    xl: 'w-80 sm:w-96'
  }
  return widthClasses[props.cardWidth]
})

const imageHeightClass = computed(() => {
  const heightClasses = {
    sm: 'h-32 sm:h-36',
    md: 'h-44 sm:h-48',
    lg: 'h-52 sm:h-56'
  }
  return heightClasses[props.imageHeight]
})

const titleHeightClass = computed(() => {
  const heightClasses = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-5'
  }
  return heightClasses[props.titleHeight]
})

const descriptionHeightClass = computed(() => {
  const heightClasses = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-5'
  }
  return heightClasses[props.descriptionHeight]
})

const tagSizeClass = computed(() => {
  const sizeClasses = {
    sm: 'h-3 w-16',
    md: 'h-4 w-20',
    lg: 'h-5 w-24'
  }
  return sizeClasses[props.tagSize]
})
</script>