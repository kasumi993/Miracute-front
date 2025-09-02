<template>
  <div class="flex items-center justify-end space-x-2">
    <button
      @click.stop="$emit('edit', product)"
      class="text-blue-600 hover:text-blue-900 p-1"
      title="Edit"
    >
      <Icon name="heroicons:pencil" class="w-4 h-4" />
    </button>
    
    <button
      @click.stop="$emit('toggleStatus', product)"
      class="text-gray-600 hover:text-gray-900 p-1"
      :title="product.is_active ? 'Deactivate' : 'Activate'"
    >
      <Icon :name="product.is_active ? 'heroicons:eye-slash' : 'heroicons:eye'" class="w-4 h-4" />
    </button>
    
    <button
      @click.stop="$emit('delete', product)"
      class="text-red-600 hover:text-red-900 p-1"
      title="Delete"
    >
      <Icon name="heroicons:trash" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  product: any
}

interface Emits {
  (e: 'edit', product: any): void
  (e: 'toggleStatus', product: any): void
  (e: 'delete', product: any): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>