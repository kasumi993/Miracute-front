<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200">
    <!-- Loading State -->
    <div v-if="loading" class="p-6 sm:p-8 text-center">
      <div class="inline-flex items-center px-4 py-2 text-gray-600">
        <Icon name="heroicons:arrow-path" class="w-5 h-5 mr-2 animate-spin" />
        Loading customers...
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!customers.length" class="p-6 sm:p-8 text-center">
      <div class="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
        <Icon name="heroicons:users" class="w-8 h-8 text-gray-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
      <p class="text-gray-600">Customers will appear here when they register, subscribe, or contact you.</p>
    </div>

    <!-- Customers Cards -->
    <div v-else class="overflow-hidden">
      <!-- Unified Card List for All Screen Sizes -->
      <div class="space-y-2">
        <div
          v-for="customer in customers"
          :key="customer.id"
          class="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-sm hover:border-gray-300 transition-all duration-150"
        >
          <!-- Compact Customer Row -->
          <div class="flex items-center justify-between">
            <!-- Left: Customer Info -->
            <div class="flex items-center space-x-3 min-w-0 flex-1">
              <UserIcon
                :first-name="customer.first_name"
                :last-name="customer.last_name"
                :email="customer.email"
                size="sm"
              />
              <div class="min-w-0 flex-1">
                <div class="flex items-center space-x-2">
                  <div class="text-sm font-medium text-gray-900 truncate">
                    {{ getCustomerFullName(customer) }}
                  </div>
                  <!-- Customer Type Badges (inline) -->
                  <div class="flex space-x-1">
                    <span v-if="customer.stripe_customer_id"
                          class="inline-flex px-1.5 py-0.5 text-xs font-medium rounded bg-green-100 text-green-700">
                      Customer
                    </span>
                    <span v-if="customer.newsletter_subscribed"
                          class="inline-flex px-1.5 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-700">
                      Newsletter
                    </span>
                    <span v-if="customer.role === 'admin'"
                          class="inline-flex px-1.5 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700">
                      Admin
                    </span>
                  </div>
                </div>
                <div class="text-xs text-gray-500 truncate">
                  {{ customer.email }}
                </div>
              </div>
            </div>

            <!-- Center: Key Metrics -->
            <div class="hidden sm:flex items-center space-x-6 text-sm">
              <!-- Orders -->
              <div class="text-center">
                <div class="text-xs text-gray-500">Orders</div>
                <div class="font-medium text-gray-900">{{ customer.order_count || 0 }}</div>
              </div>

              <!-- Total Spent -->
              <div class="text-center">
                <div class="text-xs text-gray-500">Total</div>
                <div class="font-medium text-gray-900">
                  ${{ customer.total_spent ? parseFloat(customer.total_spent).toFixed(2) : '0.00' }}
                </div>
              </div>

              <!-- Join Date -->
              <div class="text-center">
                <div class="text-xs text-gray-500">Joined</div>
                <div class="text-xs text-gray-600">{{ formatDate(customer.created_at) }}</div>
              </div>

              <!-- Newsletter Status -->
              <div class="text-center">
                <div class="text-xs text-gray-500">Newsletter</div>
                <div class="flex justify-center">
                  <span
                    class="inline-flex w-2 h-2 rounded-full"
                    :class="customer.newsletter_subscribed ? 'bg-green-400' : 'bg-gray-300'"
                    :title="customer.newsletter_subscribed ? 'Subscribed' : 'Not subscribed'"
                  ></span>
                </div>
              </div>
            </div>

            <!-- Right: Actions -->
            <div class="flex items-center space-x-2 ml-4">
              <button
                @click="$emit('viewCustomer', customer)"
                class="text-brand-brown hover:text-brand-brown/80 text-xs font-medium"
              >
                View
              </button>
              <button
                v-if="!customer.newsletter_subscribed"
                @click="$emit('subscribeToNewsletter', customer)"
                class="text-purple-600 hover:text-purple-500 text-xs font-medium"
              >
                Subscribe
              </button>
            </div>
          </div>

          <!-- Mobile: Show metrics below on small screens -->
          <div class="sm:hidden mt-2 pt-2 border-t border-gray-100">
            <div class="grid grid-cols-4 gap-2 text-center text-xs">
              <div>
                <div class="text-gray-500">Orders</div>
                <div class="font-medium text-gray-900">{{ customer.order_count || 0 }}</div>
              </div>
              <div>
                <div class="text-gray-500">Total</div>
                <div class="font-medium text-gray-900">
                  ${{ customer.total_spent ? parseFloat(customer.total_spent).toFixed(2) : '0.00' }}
                </div>
              </div>
              <div>
                <div class="text-gray-500">Joined</div>
                <div class="text-gray-600">{{ formatDate(customer.created_at) }}</div>
              </div>
              <div>
                <div class="text-gray-500">Newsletter</div>
                <div class="flex justify-center">
                  <span
                    class="inline-flex w-2 h-2 rounded-full"
                    :class="customer.newsletter_subscribed ? 'bg-green-400' : 'bg-gray-300'"
                  ></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="mt-6 pt-6 border-t border-gray-200">
        <UIPagination
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