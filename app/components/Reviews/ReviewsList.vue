<template>
  <div class="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
    <!-- Mobile Header -->
    <div class="lg:hidden mb-4">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-medium text-gray-900">Reviews</h2>
        <button
          v-if="canWriteReview && !showReviewForm"
          @click="showReviewForm = true"
          class="text-sm px-3 py-1.5 bg-brand-purple text-white rounded-lg font-medium hover:bg-brand-purple-dark transition-colors"
        >
          Write Review
        </button>
      </div>
      <div v-if="stats" class="flex items-center space-x-3 text-sm text-gray-600">
        <div class="flex items-center space-x-1">
          <div class="flex items-center">
            <Icon
              v-for="star in 5"
              :key="star"
              name="heroicons:star-20-solid"
              :class="star <= Math.round(stats?.averageRating) ? 'text-yellow-400' : 'text-gray-300'"
              class="w-3.5 h-3.5"
            />
          </div>
          <span class="font-medium ml-1">{{ (stats?.averageRating || 0).toFixed(1) }}</span>
        </div>
        <span>{{ stats?.totalReviews }} review{{ stats?.totalReviews !== 1 ? 's' : '' }}</span>
      </div>
    </div>

    <!-- Desktop Header -->
    <div class="hidden lg:flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-medium text-gray-900 mb-2">Customer Reviews</h2>
        <div v-if="stats" class="flex items-center space-x-4 text-sm text-gray-600">
          <div class="flex items-center space-x-1">
            <div class="flex items-center">
              <Icon
                v-for="star in 5"
                :key="star"
                name="heroicons:star-20-solid"
                :class="star <= Math.round(stats?.averageRating) ? 'text-yellow-400' : 'text-gray-300'"
                class="w-4 h-4"
              />
            </div>
            <span class="font-medium ml-1">{{ (stats?.averageRating || 0).toFixed(1) }}</span>
          </div>
          <span>{{ stats?.totalReviews }} review{{ stats?.totalReviews !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      <!-- Write Review Button -->
      <button
        v-if="canWriteReview && !showReviewForm"
        @click="showReviewForm = true"
        class="btn-primary"
      >
        Write Review
      </button>
    </div>
    
    <!-- Rating Breakdown -->
    <div v-if="stats && stats?.totalReviews > 0" class="mb-6 lg:mb-8">
      <!-- Mobile: Collapsible Rating Breakdown -->
      <div class="lg:hidden">
        <button
          @click="showRatingBreakdown = !showRatingBreakdown"
          class="flex items-center justify-between w-full text-left py-2"
        >
          <span class="text-sm font-medium text-gray-700">Rating Breakdown</span>
          <Icon
            :name="showRatingBreakdown ? 'heroicons:chevron-up' : 'heroicons:chevron-down'"
            class="w-4 h-4 text-gray-400"
          />
        </button>
        <div v-if="showRatingBreakdown" class="space-y-2 pt-2">
          <div
            v-for="rating in [5, 4, 3, 2, 1]"
            :key="rating"
            class="flex items-center space-x-2 text-xs"
          >
            <div class="flex items-center space-x-1 w-12">
              <span class="text-gray-600">{{ rating }}</span>
              <Icon name="heroicons:star-20-solid" class="w-2.5 h-2.5 text-yellow-400" />
            </div>
            <div class="flex-1 bg-gray-200 rounded-full h-1.5">
              <div
                class="bg-yellow-400 h-1.5 rounded-full transition-all duration-300"
                :style="{
                  width: stats?.totalReviews > 0
                    ? `${(stats?.ratingDistribution[rating] / stats?.totalReviews) * 100}%`
                    : '0%'
                }"
              ></div>
            </div>
            <span class="text-gray-600 w-6 text-right text-xs">{{ stats?.ratingDistribution[rating] }}</span>
          </div>
        </div>
      </div>

      <!-- Desktop: Always Visible Rating Breakdown -->
      <div class="hidden lg:block">
        <div class="space-y-2">
          <div
            v-for="rating in [5, 4, 3, 2, 1]"
            :key="rating"
            class="flex items-center space-x-3 text-sm"
          >
            <div class="flex items-center space-x-1 w-16">
              <span class="text-gray-600">{{ rating }}</span>
              <Icon name="heroicons:star-20-solid" class="w-3 h-3 text-yellow-400" />
            </div>
            <div class="flex-1 bg-gray-200 rounded-full h-2">
              <div
                class="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                :style="{
                  width: stats?.totalReviews > 0
                    ? `${(stats?.ratingDistribution[rating] / stats?.totalReviews) * 100}%`
                    : '0%'
                }"
              ></div>
            </div>
            <span class="text-gray-600 w-8 text-right">{{ stats?.ratingDistribution[rating] }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Review Form -->
    <div v-if="showReviewForm" class="mb-8">
      <ReviewForm
        :product-id="productId"
        :user-id="userId"
        @success="handleReviewSuccess"
        @cancel="showReviewForm = false"
      />
    </div>
    
    <!-- Reviews List -->
    <div v-if="reviews && reviews.length > 0" class="space-y-4 lg:space-y-6">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="border-b border-gray-100 pb-4 lg:pb-6 last:border-b-0 last:pb-0"
      >
        <!-- Mobile Layout -->
        <div class="lg:hidden">
          <!-- Header with rating and name -->
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 rounded-full bg-brand-sage/20 flex items-center justify-center">
                <span class="text-xs font-medium text-brand-brown">{{ review.user.initials }}</span>
              </div>
              <h4 class="text-sm font-medium text-gray-900">{{ review.user.name }}</h4>
            </div>
            <div class="flex items-center">
              <Icon
                v-for="star in 5"
                :key="star"
                name="heroicons:star-20-solid"
                :class="star <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                class="w-3.5 h-3.5"
              />
            </div>
          </div>

          <!-- Meta info -->
          <div class="flex items-center space-x-3 mb-3 text-xs text-gray-500">
            <span>{{ formatDate(review.created_at) }}</span>
            <span v-if="review.is_verified_purchase" class="flex items-center space-x-1 text-green-600">
              <Icon name="heroicons:check-badge" class="w-3 h-3" />
              <span>Verified</span>
            </span>
          </div>

          <!-- Review Title -->
          <h5 v-if="review.title" class="text-sm font-medium text-gray-900 mb-2">
            {{ review.title }}
          </h5>

          <!-- Review Comment -->
          <p v-if="review.comment" class="text-sm text-gray-700 leading-relaxed">
            {{ review.comment }}
          </p>

          <!-- User Actions (Mobile) -->
          <div v-if="canUserEditReview(review)" class="mt-3 pt-3 border-t border-gray-100">
            <!-- Edit Status & Timer -->
            <div v-if="!review.is_editable" class="text-xs text-gray-500 mb-2">
              <Icon name="heroicons:clock" class="w-3 h-3 inline mr-1" />
              Edit window expired {{ formatTimeAgo(review.edit_deadline) }}
            </div>
            <div v-else class="text-xs text-green-600 mb-2">
              <Icon name="heroicons:pencil" class="w-3 h-3 inline mr-1" />
              Editable until {{ formatDateTime(review.edit_deadline) }}
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center space-x-2 flex-wrap gap-2">
              <button
                v-if="review.is_editable"
                @click="editReview(review)"
                class="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Edit
              </button>
              <button
                v-else
                @click="addEditNote(review)"
                class="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
              >
                Add Note
              </button>
              <button
                @click="toggleAnonymity(review)"
                class="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
              >
                {{ review.is_anonymous ? 'Make Public' : 'Make Anonymous' }}
              </button>
              <button
                @click="deleteReview(review.id)"
                class="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Desktop Layout -->
        <div class="hidden lg:flex items-start space-x-4">
          <!-- Avatar -->
          <div class="flex-shrink-0">
            <div class="w-10 h-10 rounded-full bg-brand-sage/20 flex items-center justify-center">
              <span class="text-sm font-medium text-brand-brown">{{ review.user.initials }}</span>
            </div>
          </div>

          <!-- Review Content -->
          <div class="flex-1 min-w-0">
            <!-- Header -->
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-3">
                <h4 class="text-sm font-medium text-gray-900">{{ review.user.name }}</h4>
                <div class="flex items-center">
                  <Icon
                    v-for="star in 5"
                    :key="star"
                    name="heroicons:star-20-solid"
                    :class="star <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                    class="w-4 h-4"
                  />
                </div>
                <div class="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{{ formatDate(review.created_at) }}</span>
                  <span v-if="review.is_verified_purchase" class="flex items-center space-x-1 text-green-600">
                    <Icon name="heroicons:check-badge" class="w-4 h-4" />
                    <span>Verified Purchase</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Review Title -->
            <h5 v-if="review.title" class="text-sm font-medium text-gray-900 mb-2">
              {{ review.title }}
            </h5>

            <!-- Review Comment -->
            <p v-if="review.comment" class="text-sm text-gray-700 leading-relaxed">
              {{ review.comment }}
            </p>

            <!-- User Actions (Desktop) -->
            <div v-if="canUserEditReview(review)" class="mt-3 pt-3 border-t border-gray-100">
              <!-- Edit Status & Timer -->
              <div v-if="!review.is_editable" class="text-sm text-gray-500 mb-3">
                <Icon name="heroicons:clock" class="w-4 h-4 inline mr-1" />
                Edit window expired {{ formatTimeAgo(review.edit_deadline) }}
              </div>
              <div v-else class="text-sm text-green-600 mb-3">
                <Icon name="heroicons:pencil" class="w-4 h-4 inline mr-1" />
                Editable until {{ formatDateTime(review.edit_deadline) }}
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center space-x-2 flex-wrap gap-2">
                <button
                  v-if="review.is_editable"
                  @click="editReview(review)"
                  class="text-sm px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  Edit Review
                </button>
                <button
                  v-else
                  @click="addEditNote(review)"
                  class="text-sm px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                >
                  Add Edit Note
                </button>
                <button
                  @click="toggleAnonymity(review)"
                  class="text-sm px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  {{ review.is_anonymous ? 'Make Public' : 'Make Anonymous' }}
                </button>
                <button
                  @click="deleteReview(review.id)"
                  class="text-sm px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="!isLoading" class="text-center py-6 lg:py-8">
      <Icon name="heroicons:chat-bubble-left-ellipsis" class="w-10 h-10 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-3 lg:mb-4" />
      <h3 class="text-base lg:text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
      <p class="text-sm lg:text-base text-gray-600 mb-4">Be the first to share your thoughts on this template!</p>
      <button
        v-if="canWriteReview && !showReviewForm"
        @click="showReviewForm = true"
        class="px-4 py-2 bg-brand-purple text-white rounded-lg font-medium hover:bg-brand-purple-dark transition-colors text-sm lg:text-base"
      >
        Write the First Review
      </button>
    </div>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="animate-pulse flex space-x-4">
        <div class="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div class="flex-1 space-y-2 py-1">
          <div class="h-4 bg-gray-200 rounded w-1/4"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Edit Review Modal -->
    <Modal
      v-model="showEditModal"
      title="Edit Review"
      size="lg"
    >
      <form @submit.prevent="submitEditReview" class="space-y-4">
        <!-- Rating -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div class="flex items-center space-x-1">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              @click="editForm.rating = star"
              @mouseover="hoverRating = star"
              @mouseleave="hoverRating = 0"
              :class="[
                'w-8 h-8 transition-colors',
                (hoverRating > 0 ? hoverRating : editForm.rating) >= star
                  ? 'text-yellow-400'
                  : 'text-gray-300'
              ]"
            >
              <Icon name="heroicons:star-20-solid" class="w-8 h-8" />
            </button>
          </div>
        </div>

        <!-- Title -->
        <div>
          <label for="edit-title" class="block text-sm font-medium text-gray-700 mb-2">
            Review Title (Optional)
          </label>
          <input
            id="edit-title"
            v-model="editForm.title"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent"
            placeholder="Summarize your experience..."
            maxlength="100"
          >
        </div>

        <!-- Comment -->
        <div>
          <label for="edit-comment" class="block text-sm font-medium text-gray-700 mb-2">
            Your Review (Optional)
          </label>
          <textarea
            id="edit-comment"
            v-model="editForm.comment"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent resize-none"
            placeholder="Tell others about your experience with this template..."
            maxlength="1000"
          ></textarea>
          <div class="flex justify-end mt-1">
            <p class="text-xs text-gray-500">
              {{ editForm.comment?.length || 0 }}/1000 characters
            </p>
          </div>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          @click="showEditModal = false"
          class="px-4 py-2 border border-gray-300 text-gray-600 bg-white rounded-lg font-medium hover:text-gray-700 hover:border-gray-400 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          @click="submitEditReview"
          :disabled="isEditingReview || !editForm.rating"
          class="px-6 py-2 bg-brand-purple text-white rounded-lg font-medium hover:bg-brand-purple-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!isEditingReview">Update Review</span>
          <span v-else class="flex items-center space-x-2">
            <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
            <span>Updating...</span>
          </span>
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
// Import the ReviewForm component explicitly
import ReviewForm from '@/components/Reviews/ReviewForm.vue'
import Modal from '@/components/UI/Modal.vue'
import { ReviewsService } from '@/services'

// Types matching the UI expectations (snake_case as returned by API/UI usage)
interface ReviewUser {
  id: string
  name: string
  initials: string
}

interface ReviewListItem {
  id: string
  user_id?: string
  user: ReviewUser
  rating: number
  title?: string
  comment?: string
  is_verified_purchase?: boolean
  is_editable?: boolean
  is_anonymous?: boolean
  helpful_count?: number
  edit_deadline?: string
  created_at: string
}

interface ReviewStatsUI {
  average_rating: number
  total_reviews: number
  rating_breakdown: Record<number, number>
}

interface Props {
  productId: string
  userId?: string
  canWriteReview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canWriteReview: false
})

// State
const reviews = ref<ReviewListItem[]>([])
const stats = ref<ReviewStatsUI | null>(null)
const isLoading = ref(true)
const showReviewForm = ref(false)
const showRatingBreakdown = ref(false)

// Edit review state
const showEditModal = ref(false)
const editingReview = ref(null)
const isEditingReview = ref(false)
const hoverRating = ref(0)

const editForm = reactive({
  rating: 0,
  title: '',
  comment: ''
})

// Methods
const fetchReviews = async () => {
  try {
    isLoading.value = true

    // Fetch both reviews and stats in parallel
    const [reviewsResponse, statsResponse] = await Promise.all([
      ReviewsService.getProductReviews(props.productId),
      ReviewsService.getProductReviewStats(props.productId)
    ])

    if (reviewsResponse.success && reviewsResponse.data) {
      reviews.value = (reviewsResponse.data as any).data as ReviewListItem[]
    } else {
      reviews.value = []
    }

    if (statsResponse.success && statsResponse.data) {
      stats.value = statsResponse.data as ReviewStatsUI
    } else {
      stats.value = {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      }
    }
  } catch (error) {
    console.error('Error fetching reviews:', error)
  } finally {
    isLoading.value = false
  }
}

const handleReviewSuccess = (newReview: any) => {
  showReviewForm.value = false

  // Try to refresh all reviews (if provided by parent)
  const refreshAllReviews = inject('refreshAllReviews', null)
  if (refreshAllReviews) {
    ReviewsService.refreshAllReviews()
  } else {
    // Fallback: refresh only this component
    fetchReviews()
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const formatTimeAgo = (dateString: string) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
  } else {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
  }
}

// Check if current user can edit/delete this review
const canUserEditReview = (review: any) => {
  return props.userId && (
    review.user_id === props.userId ||
    review.user?.id === props.userId
  )
}

// Edit review functionality
const editReview = (review: any) => {
  editingReview.value = review
  editForm.rating = review.rating
  editForm.title = review.title || ''
  editForm.comment = review.comment || ''
  showEditModal.value = true
}

// Submit edit review
const submitEditReview = async () => {
  if (!editingReview.value || !editForm.rating) return

  const toast = useToast()
  isEditingReview.value = true

  try {
    const response = await ReviewsService.updateReview(editingReview.value.id, {
      rating: editForm.rating,
      title: editForm.title.trim() || undefined,
      content: editForm.comment.trim() || undefined
    })

    if (response.success) {
      toast.success('Review updated successfully!')
      showEditModal.value = false

      // Refresh reviews
      const refreshAllReviews = inject('refreshAllReviews', null)
      if (refreshAllReviews) {
        ReviewsService.refreshAllReviews()
      } else {
        fetchReviews()
      }
    } else {
      throw new Error(response.message || 'Failed to update review')
    }
  } catch (error: any) {
    console.error('Error updating review:', error)
    const errorMessage = error.data?.message || error.message || 'Failed to update review'
    toast.error(errorMessage)
  } finally {
    isEditingReview.value = false
  }
}

// Delete review functionality
const deleteReview = async (reviewId: string) => {
  const toast = useToast()

  if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
    return
  }

  try {
    const response = await ReviewsService.deleteReview(reviewId)

    if (response.success) {
      toast.success('Review deleted successfully!')

      // Refresh reviews
      const refreshAllReviews = inject('refreshAllReviews', null)
      if (refreshAllReviews) {
        ReviewsService.refreshAllReviews()
      } else {
        fetchReviews()
      }
    } else {
      throw new Error(response.message || 'Failed to delete review')
    }
  } catch (error: any) {
    console.error('Error deleting review:', error)
    const errorMessage = error.data?.message || error.message || 'Failed to delete review'
    toast.error(errorMessage)
  }
}

// Toggle anonymity functionality
const toggleAnonymity = async (review: any) => {
  const toast = useToast()

  try {
    const response = await ReviewsService.toggleReviewAnonymity(review.id, !review.is_anonymous)

    if (response.success) {
      toast.success(response.data.message)

      // Refresh reviews
      const refreshAllReviews = inject('refreshAllReviews', null)
      if (refreshAllReviews) {
        refreshAllReviews()
      } else {
        fetchReviews()
      }
    } else {
      throw new Error(response.message || 'Failed to update anonymity')
    }
  } catch (error: any) {
    console.error('Error toggling anonymity:', error)
    const errorMessage = error.data?.message || error.message || 'Failed to update anonymity'
    toast.error(errorMessage)
  }
}

// Add edit note functionality
const addEditNote = async (review: any) => {
  const noteText = prompt('Add an edit note for your review:')

  if (!noteText || !noteText.trim()) {
    return
  }

  const toast = useToast()

  try {
    const response = await ReviewsService.addReviewEditNote(review.id, {
      note: noteText.trim(),
      note_type: 'edit'
    })

    if (response.success) {
      toast.success('Edit note added successfully!')

      // Refresh reviews to show the note
      const refreshAllReviews = inject('refreshAllReviews', null)
      if (refreshAllReviews) {
        refreshAllReviews()
      } else {
        fetchReviews()
      }
    } else {
      throw new Error(response.message || 'Failed to add edit note')
    }
  } catch (error: any) {
    console.error('Error adding edit note:', error)
    const errorMessage = error.data?.message || error.message || 'Failed to add edit note'
    toast.error(errorMessage)
  }
}

// Load reviews on mount
onMounted(() => {
  fetchReviews()
})

// Expose method for parent to refresh reviews
defineExpose({
  refreshReviews: fetchReviews
})
</script>