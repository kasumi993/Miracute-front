<template>
  <div :class="variant === 'overlay' ? 'flex items-center space-x-1' : 'flex items-center justify-end space-x-2'">
    <button
      @click.stop="$emit('edit', product)"
      :class="variant === 'overlay' 
        ? 'bg-white/90 backdrop-blur-sm text-gray-700 hover:text-blue-600 p-2 rounded-full border border-gray-200/50 hover:border-blue-300 transition-all' 
        : 'text-blue-600 hover:text-blue-900 p-1'"
      title="Edit"
    >
      <Icon name="heroicons:pencil" class="w-4 h-4" />
    </button>
    
    <button
      @click.stop="$emit('toggleStatus', product)"
      :class="variant === 'overlay' 
        ? 'bg-white/90 backdrop-blur-sm text-gray-700 hover:text-gray-900 p-2 rounded-full border border-gray-200/50 hover:border-gray-300 transition-all' 
        : 'text-gray-600 hover:text-gray-900 p-1'"
      :title="product.is_active ? 'Deactivate' : 'Activate'"
    >
      <Icon :name="product.is_active ? 'heroicons:eye-slash' : 'heroicons:eye'" class="w-4 h-4" />
    </button>
    
    <button
      @click.stop="$emit('delete', product)"
      :class="variant === 'overlay' 
        ? 'bg-white/90 backdrop-blur-sm text-gray-700 hover:text-red-600 p-2 rounded-full border border-gray-200/50 hover:border-red-300 transition-all' 
        : 'text-red-600 hover:text-red-900 p-1'"
      title="Delete"
    >
      <Icon name="heroicons:trash" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  product: any
  variant?: 'default' | 'overlay'
}

interface Emits {
  (e: 'edit', product: any): void
  (e: 'toggleStatus', product: any): void
  (e: 'delete', product: any): void
}

withDefaults(defineProps<Props>(), {
  variant: 'default'
})
defineEmits<Emits>()
</script>