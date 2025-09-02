<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
    <div class="space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-4">
      <!-- Search Bar -->
      <div class="flex-1">
        <div class="relative">
          <Icon name="heroicons:magnifying-glass" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            v-model="searchQuery"
            @input="onSearch"
            type="text"
            class="form-input pl-10"
            placeholder="Search templates..."
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <Icon name="heroicons:x-mark" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-2 lg:gap-3">
        <!-- Category Filter -->
        <UISelect
          v-model="selectedCategory"
          @update:model-value="onFilterChange"
          placeholder="All Categories"
          :options="categoryOptions"
          option-value="id"
          option-label="name"
          class="min-w-[140px]"
        />

        <!-- Status Filter -->
        <UISelect
          v-model="selectedStatus"
          @update:model-value="onFilterChange"
          placeholder="All Status"
          :options="statusOptions"
          class="min-w-[120px]"
        />

        <!-- Template Type Filter -->
        <UISelect
          v-model="selectedTemplateType"
          @update:model-value="onFilterChange"
          placeholder="All Types"
          :options="templateTypeOptions"
          class="min-w-[120px]"
        />

        <!-- Clear Filters -->
        <button
          v-if="hasActiveFilters"
          @click="clearAllFilters"
          class="btn-outline text-sm px-3 py-1.5"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Results count -->
    <div v-if="searchQuery || hasActiveFilters" class="mt-4 text-sm text-gray-600">
      {{ filteredCount }} of {{ totalCount }} templates
      <span v-if="searchQuery">for "{{ searchQuery }}"</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  searchQuery: string
  selectedCategory: string
  selectedStatus: string
  selectedTemplateType: string
  categories: any[]
  templateTypes: any[]
  filteredCount: number
  totalCount: number
}

interface Emits {
  (e: 'update:searchQuery', value: string): void
  (e: 'update:selectedCategory', value: string): void
  (e: 'update:selectedStatus', value: string): void
  (e: 'update:selectedTemplateType', value: string): void
  (e: 'search'): void
  (e: 'filterChange'): void
  (e: 'clearSearch'): void
  (e: 'clearFilters'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed options
const categoryOptions = computed(() => {
  return [{ id: '', name: 'All Categories' }, ...props.categories]
})

const statusOptions = computed(() => [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'featured', label: 'Featured' }
])

const templateTypeOptions = computed(() => {
  return [{ value: '', label: 'All Types' }, ...props.templateTypes.map(type => ({
    value: type.slug,
    label: type.name
  }))]
})

const hasActiveFilters = computed(() => {
  return props.selectedCategory || props.selectedStatus || props.selectedTemplateType
})

// Local reactive refs for v-model
const searchQuery = computed({
  get: () => props.searchQuery,
  set: (value) => emit('update:searchQuery', value)
})

const selectedCategory = computed({
  get: () => props.selectedCategory,
  set: (value) => emit('update:selectedCategory', value)
})

const selectedStatus = computed({
  get: () => props.selectedStatus,
  set: (value) => emit('update:selectedStatus', value)
})

const selectedTemplateType = computed({
  get: () => props.selectedTemplateType,
  set: (value) => emit('update:selectedTemplateType', value)
})

// Event handlers
const onSearch = useDebounceFn(() => {
  emit('search')
}, 300)

const onFilterChange = () => {
  emit('filterChange')
}

const clearSearch = () => {
  emit('clearSearch')
}

const clearAllFilters = () => {
  emit('clearFilters')
}
</script>