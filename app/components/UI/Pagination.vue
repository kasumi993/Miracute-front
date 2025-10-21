<template>
  <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200">
    <div class="flex items-center justify-between">
      <div class="text-sm text-gray-700">
        Showing {{ startItem }} to {{ endItem }} of {{ total }} {{ itemName }}
      </div>
      <div class="flex space-x-1">
        <button
          @click="$emit('changePage', page - 1)"
          :disabled="!hasPrev"
          class="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
        <button
          @click="$emit('changePage', page + 1)"
          :disabled="!hasNext"
          class="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  itemName?: string
}

interface Emits {
  (e: 'changePage', page: number): void
}

const props = withDefaults(defineProps<Props>(), {
  itemName: 'items'
})

defineEmits<Emits>()

const startItem = computed(() => (props.page - 1) * props.limit + 1)
const endItem = computed(() => Math.min(props.page * props.limit, props.total))
</script>