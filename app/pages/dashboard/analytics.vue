<template>
  <!-- Admin Loading State -->
  <AdminLoader v-if="isCheckingAccess" />
  
  <!-- Admin Content -->
  <div v-else-if="hasAdminAccess">
    <!-- Analytics Header -->
    <AnalyticsHeader />

    <!-- Time Range Filter -->
    <AnalyticsTimeFilter
      v-model:selected-period="selectedPeriod"
      v-model:show-calendar="showCalendar"
      v-model:custom-date-range="customDateRange"
      @period-changed="refreshData"
      @custom-range-applied="applyCustomRange"
    />

    <!-- Analytics Metrics Cards -->
    <AnalyticsMetricsCards
      :analytics="analytics"
      :is-loading="isLoading"
      :period-label="getPeriodLabel()"
    />

    <!-- Top Pages Analytics -->
    <AnalyticsTopPages
      :top-pages="topPages"
      :is-loading="isLoading"
    />
  </div>
</template>

<script setup>
// Admin Guard
const { isCheckingAccess, hasAdminAccess } = useAdminGuard()

// Middleware and SEO
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

useSeoMeta({
  title: 'Analytics | Dashboard',
  description: 'Track your platform performance and analytics',
  robots: 'noindex, nofollow'
})

// State
const isLoading = ref(false)
const selectedPeriod = ref('today')
const showCalendar = ref(false)
const customDateRange = ref({
  from: '',
  to: ''
})

const analytics = ref({
  visitors: 0,
  visitorsChange: 0,
  pageViews: 0,
  pageViewsChange: 0,
  productViews: 0,
  addToCarts: 0
})

const topPages = ref([])

// Time periods for filtering
const timePeriods = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: 'week' },
  { label: '30 Days', value: 'month' },
  { label: '90 Days', value: 'quarter' }
]

// Methods
const loadAnalytics = async () => {
  isLoading.value = true
  
  try {
    const params = new URLSearchParams()
    if (showCalendar.value && customDateRange.value.from && customDateRange.value.to) {
      params.append('from', customDateRange.value.from)
      params.append('to', customDateRange.value.to)
    } else {
      params.append('period', selectedPeriod.value)
    }
    
    const response = await $fetch(`/api/admin/analytics?${params.toString()}`)
    
    if (response.success) {
      analytics.value = response.data
      topPages.value = response.data.topPages
    } else {
      throw new Error(response.error || 'Failed to load analytics data')
    }
  } catch (error) {
    console.error('Error loading analytics:', error)
    useToast().error('Failed to load analytics data')
    
    // Set default values on error
    analytics.value = {
      visitors: 0,
      visitorsChange: 0,
      pageViews: 0,
      pageViewsChange: 0,
      productViews: 0,
      addToCarts: 0
    }
    topPages.value = []
  } finally {
    isLoading.value = false
  }
}

const refreshData = async () => {
  await loadAnalytics()
}

const getPeriodLabel = () => {
  const labels = {
    today: 'Today\'s',
    week: 'Last 7 Days',
    month: 'Last 30 Days', 
    quarter: 'Last 90 Days',
    custom: 'Custom Range'
  }
  return showCalendar.value ? labels.custom : labels[selectedPeriod.value]
}

const applyCustomRange = () => {
  if (!customDateRange.value.from || !customDateRange.value.to) {
    useToast().error('Please select both start and end dates')
    return
  }
  
  selectedPeriod.value = 'custom'
  showCalendar.value = false
  refreshData()
}

// Watch for period changes
watch(selectedPeriod, () => {
  refreshData()
})

// Initialize
onMounted(() => {
  refreshData()
})
</script>
