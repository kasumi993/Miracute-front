<template>
  <div v-if="tags?.length" class="pt-4">
    <button
      @click="toggleTags"
      class="flex items-center justify-between w-full text-left lg:cursor-default"
      :class="{'lg:pointer-events-none': true}"
    >
      <h3 class="text-lg font-medium text-gray-900">Tags</h3>
      <Icon
        :name="isOpen ? 'heroicons:chevron-up' : 'heroicons:chevron-down'"
        class="w-5 h-5 text-gray-400 lg:hidden"
      />
    </button>
    <div :class="['overflow-hidden transition-all duration-300', isOpen || $device.isDesktop ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0']">
      <div class="flex flex-wrap gap-2">
        <span v-for="tag in tags" :key="tag" class="text-xs lg:text-sm text-gray-600 bg-gray-100 px-2 lg:px-3 py-1 rounded-full">
          {{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  tags: string[]
  isOpen: boolean
}

interface Emits {
  (e: 'toggle'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toggleTags = () => {
  emit('toggle')
}
</script>