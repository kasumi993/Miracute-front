<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Reviews Management</h1>
            <p class="text-gray-600 mt-1">Manage customer reviews and feedback</p>
          </div>
          
          <button
            @click="showCreateModal = true"
            class="btn-primary"
          >
            <Icon name="heroicons:plus" class="w-5 h-5 mr-2" />
            Add Review
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Cards -->
      <div v-if="stats" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <Icon name="heroicons:chat-bubble-left-ellipsis" class="w-6 h-6 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-500">Total Reviews</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <Icon name="heroicons:check-circle" class="w-6 h-6 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-500">Approved</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.approved }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <Icon name="heroicons:clock" class="w-6 h-6 text-yellow-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-500">Pending</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <Icon name="heroicons:star" class="w-6 h-6 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-500">Avg Rating</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.average_rating.toFixed(1) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select v-model="filters.status" @change="loadReviews" class="form-input">
              <option value="all">All Reviews</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <select v-model="filters.rating" @change="loadReviews" class="form-input">
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <input
              v-model="filters.search"
              @input="debounceSearch"
              type="text"
              placeholder="Search products..."
              class="form-input"
            >
          </div>
          
          <div class="flex items-end">
            <button
              @click="resetFilters"
              class="btn-outline w-full"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Reviews Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer & Product
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating & Review
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="review in reviews" :key="review.id">
                <!-- Customer & Product -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div class="flex items-center space-x-2">
                      <div class="w-8 h-8 rounded-full bg-brand-sage/20 flex items-center justify-center">
                        <span class="text-xs font-medium text-brand-brown">
                          {{ review.user?.full_name?.charAt(0) || 'A' }}
                        </span>
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-900">{{ review.user?.full_name || 'Anonymous' }}</p>
                        <p class="text-xs text-gray-500">{{ review.user?.email }}</p>
                      </div>
                    </div>
                    <div class="mt-2">
                      <p class="text-sm text-gray-900 font-medium">{{ review.product?.name }}</p>
                      <div class="flex items-center space-x-2 mt-1">
                        <span v-if="review.is_verified_purchase" class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <Icon name="heroicons:check-badge" class="w-3 h-3 mr-1" />
                          Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Rating & Review -->
                <td class="px-6 py-4">
                  <div class="flex items-center space-x-1 mb-2">
                    <Icon 
                      v-for="star in 5" 
                      :key="star"
                      name="heroicons:star-20-solid" 
                      :class="star <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                      class="w-4 h-4" 
                    />
                    <span class="text-sm text-gray-600 ml-1">({{ review.rating }})</span>
                  </div>
                  <div class="max-w-xs">
                    <p v-if="review.title" class="text-sm font-medium text-gray-900 mb-1">{{ review.title }}</p>
                    <p v-if="review.comment" class="text-sm text-gray-700 line-clamp-2">{{ review.comment }}</p>
                    <p v-else class="text-sm text-gray-500 italic">No comment provided</p>
                  </div>
                </td>

                <!-- Status -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    review.is_approved 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  ]">
                    {{ review.is_approved ? 'Approved' : 'Pending' }}
                  </span>
                </td>

                <!-- Date -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(review.created_at) }}
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex items-center justify-end space-x-2">
                    <button
                      v-if="!review.is_approved"
                      @click="approveReview(review.id)"
                      class="text-green-600 hover:text-green-900 transition-colors"
                      title="Approve Review"
                    >
                      <Icon name="heroicons:check" class="w-4 h-4" />
                    </button>
                    
                    <button
                      v-if="review.is_approved"
                      @click="rejectReview(review.id)"
                      class="text-yellow-600 hover:text-yellow-900 transition-colors"
                      title="Reject Review"
                    >
                      <Icon name="heroicons:x-mark" class="w-4 h-4" />
                    </button>
                    
                    <button
                      @click="editReview(review)"
                      class="text-blue-600 hover:text-blue-900 transition-colors"
                      title="Edit Review"
                    >
                      <Icon name="heroicons:pencil" class="w-4 h-4" />
                    </button>
                    
                    <button
                      @click="confirmDeleteReview(review.id, review.user?.full_name)"
                      class="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete Review"
                    >
                      <Icon name="heroicons:trash" class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.pages > 1" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div class="flex items-center justify-between">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                @click="changePage(pagination.page - 1)"
                :disabled="pagination.page <= 1"
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                @click="changePage(pagination.page + 1)"
                :disabled="pagination.page >= pagination.pages"
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing <span class="font-medium">{{ ((pagination.page - 1) * pagination.limit) + 1 }}</span>
                  to <span class="font-medium">{{ Math.min(pagination.page * pagination.limit, pagination.total) }}</span>
                  of <span class="font-medium">{{ pagination.total }}</span> results
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    v-for="page in getVisiblePages()"
                    :key="page"
                    @click="changePage(page)"
                    :class="[
                      'relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors',
                      page === pagination.page
                        ? 'z-10 bg-brand-sage border-brand-sage text-white'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    ]"
                  >
                    {{ page }}
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="p-8">
          <div class="space-y-4">
            <div v-for="i in 5" :key="i" class="animate-pulse flex space-x-4">
              <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div class="flex-1 space-y-2 py-1">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!isLoading && reviews.length === 0" class="p-8 text-center">
          <Icon name="heroicons:chat-bubble-left-ellipsis" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">No reviews found</h3>
          <p class="text-gray-600">No reviews match your current filters.</p>
        </div>
      </div>
    </div>

    <!-- Create/Edit Review Modal -->
    <div v-if="showCreateModal || editingReview" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <ReviewFormModal
          :review="editingReview"
          @save="handleReviewSave"
          @cancel="closeModal"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { debounce } from 'lodash-es'

// Middleware
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

// SEO
useSeoMeta({
  title: 'Reviews Management - Miracute Admin',
  description: 'Manage customer reviews and feedback for templates'
})

// Composables
const { getAdminReviews, updateReview, deleteReview, approveReview, rejectReview } = useReviews()
const toast = useToast()

// State
const reviews = ref([])
const stats = ref(null)
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})

const filters = reactive({
  status: 'all',
  rating: '',
  search: ''
})

const isLoading = ref(true)
const showCreateModal = ref(false)
const editingReview = ref(null)

// Methods
const loadReviews = async () => {
  try {
    isLoading.value = true
    
    const params = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      status: filters.status,
      rating: filters.rating ? parseInt(filters.rating) : undefined
    }
    
    const response = await getAdminReviews(params)
    
    if (response.success) {
      reviews.value = response.reviews
      stats.value = response.stats
      pagination.value = response.pagination
    }
  } catch (error) {
    console.error('Error loading reviews:', error)
    toast.error('Failed to load reviews')
  } finally {
    isLoading.value = false
  }
}

const debounceSearch = debounce(() => {
  loadReviews()
}, 500)

const resetFilters = () => {
  filters.status = 'all'
  filters.rating = ''
  filters.search = ''
  pagination.value.page = 1
  loadReviews()
}

const changePage = (page: number) => {
  if (page >= 1 && page <= pagination.value.pages) {
    pagination.value.page = page
    loadReviews()
  }
}

const getVisiblePages = () => {
  const current = pagination.value.page
  const total = pagination.value.pages
  const delta = 2
  
  const range = []
  const rangeStart = Math.max(1, current - delta)
  const rangeEnd = Math.min(total, current + delta)
  
  for (let i = rangeStart; i <= rangeEnd; i++) {
    range.push(i)
  }
  
  return range
}

const editReview = (review: any) => {
  editingReview.value = { ...review }
}

const closeModal = () => {
  showCreateModal.value = false
  editingReview.value = null
}

const handleReviewSave = () => {
  closeModal()
  loadReviews()
  toast.success('Review saved successfully')
}

const confirmDeleteReview = (reviewId: string, customerName: string) => {
  if (confirm(`Are you sure you want to delete this review from ${customerName}? This action cannot be undone.`)) {
    handleDeleteReview(reviewId)
  }
}

const handleDeleteReview = async (reviewId: string) => {
  try {
    await deleteReview(reviewId)
    toast.success('Review deleted successfully')
    loadReviews()
  } catch (error) {
    console.error('Error deleting review:', error)
    toast.error('Failed to delete review')
  }
}

const handleApproveReview = async (reviewId: string) => {
  try {
    await approveReview(reviewId)
    toast.success('Review approved')
    loadReviews()
  } catch (error) {
    console.error('Error approving review:', error)
    toast.error('Failed to approve review')
  }
}

const handleRejectReview = async (reviewId: string) => {
  try {
    await rejectReview(reviewId)
    toast.success('Review rejected')
    loadReviews()
  } catch (error) {
    console.error('Error rejecting review:', error)
    toast.error('Failed to reject review')
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Load reviews on mount
onMounted(() => {
  loadReviews()
})
</script>