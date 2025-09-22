<template>
  <ClientOnly>
    <slot />
    <template #fallback>
      <!-- Optional fallback content during SSR -->
      <div v-if="showFallback" :class="fallbackClass">
        {{ fallbackText }}
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
interface Props {
  showFallback?: boolean
  fallbackText?: string
  fallbackClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  showFallback: false,
  fallbackText: 'Loading...',
  fallbackClass: 'text-gray-500 text-sm'
})
</script>