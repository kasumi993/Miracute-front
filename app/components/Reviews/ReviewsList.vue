<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <!-- Header with stats -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-xl font-medium text-gray-900 mb-2">Customer Reviews</h2>
        <div v-if="stats" class="flex items-center space-x-4 text-sm text-gray-600">
          <div class="flex items-center space-x-1">
            <div class="flex items-center">
              <Icon 
                v-for="star in 5" 
                :key="star"
                name="heroicons:star-20-solid" 
                :class="star <= Math.round(stats.average_rating) ? 'text-yellow-400' : 'text-gray-300'"
                class="w-4 h-4" 
              />
            </div>
            <span class="font-medium ml-1">{{ stats.average_rating.toFixed(1) }}</span>
          </div>
          <span>{{ stats.total_reviews }} review{{ stats.total_reviews !== 1 ? 's' : '' }}</span>
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
    <div v-if="stats && stats.total_reviews > 0" class="mb-8">
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
                width: stats.total_reviews > 0 
                  ? `${(stats.rating_breakdown[rating] / stats.total_reviews) * 100}%` 
                  : '0%' 
              }"
            ></div>
          </div>
          <span class="text-gray-600 w-8 text-right">{{ stats.rating_breakdown[rating] }}</span>
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
    <div v-if="reviews.length > 0" class="space-y-6">
      <div 
        v-for="review in reviews" 
        :key="review.id"
        class="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0"
      >
        <div class="flex items-start space-x-4">
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
          </div>
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="!isLoading" class="text-center py-8">
      <Icon name="heroicons:chat-bubble-left-ellipsis" class="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
      <p class="text-gray-600 mb-4">Be the first to share your thoughts on this template!</p>
      <button
        v-if="canWriteReview && !showReviewForm"
        @click="showReviewForm = true"
        class="btn-primary"
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
  </div>
</template>

<script setup lang="ts">
// Import the ReviewForm component explicitly
import ReviewForm from '~/components/Reviews/ReviewForm.vue'

interface Props {
  productId: string
  userId?: string
  canWriteReview?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canWriteReview: false
})

// State
const reviews = ref([])
const stats = ref(null)
const isLoading = ref(true)
const showReviewForm = ref(false)

// Methods
const fetchReviews = async () => {
  try {
    isLoading.value = true
    const response = await $fetch(`/api/reviews/${props.productId}`)
    
    if (response.success) {
      reviews.value = response.reviews
      stats.value = response.stats
    }
  } catch (error) {
    console.error('Error fetching reviews:', error)
  } finally {
    isLoading.value = false
  }
}

const handleReviewSuccess = (newReview: any) => {
  showReviewForm.value = false
  // Refresh reviews to get updated data
  fetchReviews()
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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