<template>
  <div class="bg-white rounded-xl shadow-soft border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
    <div class="flex items-center">
      <div class="flex-shrink-0">
        <Icon :name="icon" :class="['w-8 h-8', iconColor]" />
      </div>
      <div class="ml-4">
        <div class="text-lg sm:text-xl font-bold text-gray-900">{{ formattedValue }}</div>
        <div class="text-xs sm:text-sm text-gray-600">{{ label }}</div>
      </div>
    </div>

    <div v-if="showChange && !isNaN(change) && change !== null && change !== undefined" :class="[
      'text-sm flex items-center mt-2',
      change >= 0 ? 'text-green-600' : 'text-red-600'
    ]">
      <Icon
        :name="change >= 0 ? 'heroicons:arrow-trending-up' : 'heroicons:arrow-trending-down'"
        class="w-4 h-4 mr-1"
      />
      {{ Math.abs(change) }}% vs previous period
    </div>

    <div v-else-if="subtitle" class="text-sm text-gray-600 mt-2">
      {{ subtitle }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  iconColor: string
  value: string | number
  label: string
  formatAsCurrency?: boolean
  change?: number
  subtitle?: string
  showChange?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  formatAsCurrency: false,
  showChange: false
})

const formattedValue = computed(() => {
  // Handle null/undefined values
  if (props.value === null || props.value === undefined) {
    return '0'
  }

  const numValue = typeof props.value === 'string' ? parseFloat(props.value) : props.value

  if (props.formatAsCurrency && !isNaN(numValue)) {
    return `$${numValue.toFixed(0)}`
  }

  // Format large numbers with K/M notation
  if (!isNaN(numValue)) {
    if (numValue >= 1000000) {
      return (numValue / 1000000).toFixed(1) + 'M'
    }
    if (numValue >= 1000) {
      return (numValue / 1000).toFixed(1) + 'K'
    }
  }

  return props.value.toString()
})
</script>