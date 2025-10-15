<template>
  <div class="border-t border-gray-200 pt-4 lg:pt-6">
    <button
      @click="toggleDescription"
      class="flex items-center justify-between w-full text-left lg:cursor-default"
      :class="{'lg:pointer-events-none': true}"
    >
      <h2 class="text-lg lg:text-xl font-medium text-gray-900">Description</h2>
      <Icon
        :name="isOpen ? 'heroicons:chevron-up' : 'heroicons:chevron-down'"
        class="w-5 h-5 text-gray-400 lg:hidden"
      />
    </button>
    <div :class="['overflow-hidden transition-all duration-300', isOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 lg:max-h-96 lg:opacity-100 lg:mt-4']">
      <div class="prose prose-gray max-w-none">
        <p class="text-sm lg:text-base text-gray-700 leading-relaxed">{{ description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  description: string
  isOpen: boolean
}

interface Emits {
  (e: 'toggle'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const toggleDescription = () => {
  emit('toggle')
}
</script>