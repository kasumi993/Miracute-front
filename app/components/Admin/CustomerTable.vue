<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200">
    <!-- Loading State -->
    <div v-if="loading" class="p-8 text-center">
      <div class="inline-flex items-center px-4 py-2 text-gray-600">
        <Icon name="heroicons:arrow-path" class="w-5 h-5 mr-2 animate-spin" />
        Loading customers...
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!customers.length" class="p-8 text-center">
      <div class="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
        <Icon name="heroicons:users" class="w-8 h-8 text-gray-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
      <p class="text-gray-600">Customers will appear here when they register, subscribe, or contact you.</p>
    </div>

    <!-- Customers Table -->
    <div v-else class="overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orders
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Spent
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Newsletter
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="customer in customers" :key="customer.id" class="hover:bg-gray-50">
              <!-- Customer Info -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <UserIcon
                    :first-name="customer.first_name"
                    :last-name="customer.last_name"
                    :email="customer.email"
                    size="md"
                  />
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ getCustomerFullName(customer) }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ customer.email }}
                    </div>
                  </div>
                </div>
              </td>

              <!-- Customer Type -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-wrap gap-1">
                  <span v-if="customer.stripe_customer_id"
                        class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Customer
                  </span>
                  <span v-if="customer.newsletter_subscribed"
                        class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                    Newsletter
                  </span>
                  <span v-if="customer.contacted_at"
                        class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                    Contact
                  </span>
                  <span v-if="customer.role === 'admin'"
                        class="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    Admin
                  </span>
                </div>
              </td>

              <!-- Order Count -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ customer.order_count || 0 }}
              </td>

              <!-- Total Spent -->
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${{ customer.total_spent ? parseFloat(customer.total_spent).toFixed(2) : '0.00' }}
              </td>

              <!-- Newsletter Status -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                  :class="customer.newsletter_subscribed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                >
                  {{ customer.newsletter_subscribed ? 'Subscribed' : 'Not subscribed' }}
                </span>
              </td>

              <!-- Join Date -->
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(customer.created_at) }}
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex space-x-2">
                  <button
                    @click="$emit('viewCustomer', customer)"
                    class="text-brand-brown hover:text-brand-brown/80"
                  >
                    View
                  </button>
                  <button
                    v-if="!customer.newsletter_subscribed"
                    @click="$emit('subscribeToNewsletter', customer)"
                    class="text-purple-600 hover:text-purple-500"
                  >
                    Subscribe
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <UIPagination
        v-if="pagination.totalPages > 1"
        :page="pagination.page"
        :limit="pagination.limit"
        :total="pagination.total"
        :total-pages="pagination.totalPages"
        :has-next="pagination.hasNext"
        :has-prev="pagination.hasPrev"
        item-name="customers"
        @change-page="$emit('changePage', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface CustomerData {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
  role: 'customer' | 'admin'
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
  newsletter_subscribed?: boolean
  contacted_at?: string
  order_count?: number
  total_spent?: string
  last_order_date?: string
}

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface Props {
  customers: CustomerData[]
  loading: boolean
  pagination: PaginationData
}

interface Emits {
  (e: 'viewCustomer', customer: CustomerData): void
  (e: 'subscribeToNewsletter', customer: CustomerData): void
  (e: 'changePage', page: number): void
}

defineProps<Props>()
defineEmits<Emits>()

const getCustomerFullName = (customer: CustomerData) => {
  if (!customer) return 'Guest Customer'
  if (customer.first_name || customer.last_name) {
    return `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
  }
  return 'Guest Customer'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>