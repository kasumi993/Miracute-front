<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Search -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
        <UISearchInput
          :model-value="filters.search"
          @search="$emit('update:search', $event)"
          @clear="$emit('update:search', '')"
          placeholder="Name, email..."
          size="md"
        />
      </div>

      <!-- Type Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Customer Type</label>
        <UIFilterSelect
          :model-value="filters.type"
          @update="$emit('update:type', $event)"
          :options="customerTypeOptions"
          placeholder="All Types"
          size="md"
        />
      </div>

      <!-- Date Range -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">From Date</label>
        <UIInput
          :model-value="filters.dateFrom"
          @update:model-value="$emit('update:dateFrom', $event)"
          type="date"
          placeholder="Select date"
        />
      </div>

      <!-- Clear Filters -->
      <div class="flex items-end">
        <UIClearFiltersButton
          @clear="$emit('clearFilters')"
          size="md"
          block
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CustomerFilters {
  search: string
  type: string
  dateFrom: string
}

interface Props {
  filters: CustomerFilters
}

interface Emits {
  (e: 'update:search', value: string): void
  (e: 'update:type', value: string): void
  (e: 'update:dateFrom', value: string): void
  (e: 'clearFilters'): void
}

defineProps<Props>()
defineEmits<Emits>()

// Customer type options for the select
const customerTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'registered', label: 'Registered Users' },
  { value: 'purchased', label: 'Purchased' },
  { value: 'newsletter', label: 'Newsletter Only' },
  { value: 'contact', label: 'Contact Only' }
]
</script>