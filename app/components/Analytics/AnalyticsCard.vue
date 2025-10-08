<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-medium text-gray-600">{{ title }}</h3>
      <div :class="[
        'w-8 h-8 rounded-lg flex items-center justify-center',
        iconBackgroundClass
      ]">
        <Icon :name="icon" :class="['w-4 h-4', iconTextClass]" />
      </div>
    </div>
    
    <div class="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
      {{ formatNumber(value) }}
    </div>
    
    <div v-if="showChange" :class="[
      'text-sm flex items-center',
      change >= 0 ? 'text-green-600' : 'text-red-600'
    ]">
      <Icon 
        :name="change >= 0 ? 'heroicons:arrow-trending-up' : 'heroicons:arrow-trending-down'" 
        class="w-4 h-4 mr-1" 
      />
      {{ Math.abs(change) }}% vs previous period
    </div>
    
    <div v-else-if="subtitle" class="text-sm text-gray-600">
      {{ subtitle }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: number
  change?: number
  subtitle?: string
  icon: string
  iconColor: 'blue' | 'green' | 'purple' | 'orange'
  showChange: boolean
}

const props = defineProps<Props>()

const iconBackgroundClass = computed(() => {
  const colors = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    purple: 'bg-purple-100',
    orange: 'bg-orange-100'
  }
  return colors[props.iconColor]
})

const iconTextClass = computed(() => {
  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  }
  return colors[props.iconColor]
})

const formatNumber = (number: number) => {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M'
  }
  if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K'
  }
  return number.toString()
}
</script>