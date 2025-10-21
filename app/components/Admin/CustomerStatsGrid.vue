<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
    <AnalyticsCard
      title="Total Customers"
      :value="stats.totalCustomers"
      icon="heroicons:users"
      icon-color="blue"
      :show-change="false"
    />

    <AnalyticsCard
      title="Paying Customers"
      :value="stats.payingCustomers"
      icon="heroicons:shopping-bag"
      icon-color="green"
      :show-change="false"
    />

    <AnalyticsCard
      title="Newsletter Subscribers"
      :value="stats.newsletterSubscribers"
      icon="heroicons:envelope"
      icon-color="purple"
      :show-change="false"
    />

    <AnalyticsCard
      title="Contact Submissions"
      :value="stats.contactSubmissions"
      icon="heroicons:chat-bubble-left-right"
      icon-color="orange"
      :show-change="false"
    />
  </div>
</template>

<script setup lang="ts">
interface CustomerStats {
  totalCustomers: number
  payingCustomers: number
  newsletterSubscribers: number
  contactSubmissions: number
}

interface Props {
  stats: CustomerStats
}

defineProps<Props>()
</script>