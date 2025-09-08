<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <h2 class="text-base sm:text-lg font-medium text-gray-900">Visitor Analytics</h2>
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <!-- Time Period Buttons -->
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="period in timePeriods" 
            :key="period.value"
            @click="selectPeriod(period.value)"
            :class="[
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedPeriod === period.value && !showCalendar
                ? 'bg-brand-brown text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            ]"
          >
            {{ period.label }}
          </button>
        </div>
        
        <!-- Custom Date Button -->
        <button 
          @click="toggleCalendar"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center',
            showCalendar 
              ? 'bg-brand-brown text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          ]"
        >
          <Icon name="heroicons:calendar-days" class="w-4 h-4 mr-2" />
          Custom Range
        </button>
      </div>
    </div>
    
    <!-- Calendar Date Picker -->
    <div v-if="showCalendar" class="mt-4 pt-4 border-t border-gray-200">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">From</label>
          <input 
            v-model="customDateRange.from"
            type="date" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-transparent"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">To</label>
          <input 
            v-model="customDateRange.to"
            type="date" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-brown focus:border-transparent"
          />
        </div>
      </div>
      <div class="mt-4 flex gap-2">
        <button 
          @click="applyCustomRange"
          class="px-4 py-2 bg-brand-brown text-white rounded-lg hover:bg-brand-brown/90 transition-colors text-sm font-medium"
        >
          Apply Range
        </button>
        <button 
          @click="cancelCustomRange"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  selectedPeriod: string
  showCalendar: boolean
  customDateRange: {
    from: string
    to: string
  }
}

interface Emits {
  (e: 'update:selectedPeriod', value: string): void
  (e: 'update:showCalendar', value: boolean): void
  (e: 'update:customDateRange', value: { from: string, to: string }): void
  (e: 'periodChanged'): void
  (e: 'customRangeApplied'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Time periods for filtering
const timePeriods = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: 'week' },
  { label: '30 Days', value: 'month' },
  { label: '90 Days', value: 'quarter' }
]

const selectPeriod = (period: string) => {
  emit('update:selectedPeriod', period)
  emit('update:showCalendar', false)
  emit('periodChanged')
}

const toggleCalendar = () => {
  emit('update:showCalendar', !props.showCalendar)
}

const applyCustomRange = () => {
  if (!props.customDateRange.from || !props.customDateRange.to) {
    useToast().error('Please select both start and end dates')
    return
  }
  
  emit('update:selectedPeriod', 'custom')
  emit('update:showCalendar', false)
  emit('customRangeApplied')
}

const cancelCustomRange = () => {
  emit('update:showCalendar', false)
}
</script>