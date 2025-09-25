<template>
  <div class="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-100 p-4 lg:p-6">
    <h3 class="text-lg lg:text-xl font-bold text-gray-900 mb-4 lg:mb-6">Write a Review</h3>
    
    <form @submit.prevent="submitReview" class="space-y-4 lg:space-y-6">
      <!-- Rating -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Rating *
        </label>
        <div class="flex items-center space-x-1 lg:space-x-2">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            @click="setRating(star)"
            @mouseover="hoverRating = star"
            @mouseleave="hoverRating = 0"
            :class="[
              'w-10 h-10 lg:w-8 lg:h-8 transition-colors touch-manipulation',
              (hoverRating > 0 ? hoverRating : form.rating) >= star
                ? 'text-yellow-400'
                : 'text-gray-300'
            ]"
          >
            <Icon name="heroicons:star-20-solid" class="w-10 h-10 lg:w-8 lg:h-8" />
          </button>
          <span v-if="form.rating > 0" class="ml-2 text-sm text-gray-600">
            {{ ratingLabels[form.rating - 1] }}
          </span>
        </div>
        <p v-if="errors.rating" class="mt-1 text-sm text-red-600">{{ errors.rating }}</p>
      </div>
      
      <!-- Title -->
      <div>
        <label for="review-title" class="block text-sm font-medium text-gray-700 mb-2">
          Review Title (Optional)
        </label>
        <input
          id="review-title"
          v-model="form.title"
          type="text"
          :class="[
            'w-full px-3 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-sm lg:text-base',
            errors.title ? 'border-red-500 focus:ring-red-500' : ''
          ]"
          placeholder="Summarize your experience..."
          maxlength="100"
        >
        <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
      </div>

      <!-- Comment -->
      <div>
        <label for="review-comment" class="block text-sm font-medium text-gray-700 mb-2">
          Your Review (Optional)
        </label>
        <textarea
          id="review-comment"
          v-model="form.comment"
          rows="4"
          :class="[
            'w-full px-3 py-2 lg:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-sage focus:border-transparent text-sm lg:text-base resize-none',
            errors.comment ? 'border-red-500 focus:ring-red-500' : ''
          ]"
          placeholder="Tell others about your experience with this template..."
          maxlength="1000"
        ></textarea>
        <div class="flex justify-between items-center mt-1">
          <p v-if="errors.comment" class="text-sm text-red-600">{{ errors.comment }}</p>
          <p class="text-xs text-gray-500 ml-auto">
            {{ form.comment?.length || 0 }}/1000 characters
          </p>
        </div>
      </div>

      <!-- Submit Buttons -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-4 py-2.5 lg:py-2 border border-gray-300 text-gray-600 bg-white rounded-lg font-medium hover:text-gray-700 hover:border-gray-400 transition-colors text-sm lg:text-base order-2 sm:order-1"
        >
          Cancel
        </button>

        <button
          type="submit"
          :disabled="isSubmitting || !form.rating"
          class="px-6 py-2.5 lg:py-2 bg-brand-sage text-white rounded-lg font-medium hover:bg-brand-sage-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base order-1 sm:order-2"
        >
          <span v-if="!isSubmitting">Submit Review</span>
          <span v-else class="flex items-center justify-center space-x-2">
            <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
            <span>Submitting...</span>
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reviewsService } from '@/services'

interface Props {
  productId: string
  userId?: string
}

interface Emits {
  (e: 'success', review: any): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const toast = useToast()

// Form state
const form = reactive({
  rating: 0,
  title: '',
  comment: ''
})

const errors = reactive({
  rating: '',
  title: '',
  comment: ''
})

const isSubmitting = ref(false)
const hoverRating = ref(0)

const ratingLabels = [
  'Poor',
  'Fair', 
  'Good',
  'Very Good',
  'Excellent'
]

// Methods
const setRating = (rating: number) => {
  form.rating = rating
  errors.rating = ''
}

const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
  
  let isValid = true
  
  // Rating validation
  if (!form.rating || form.rating < 1 || form.rating > 5) {
    errors.rating = 'Please select a rating'
    isValid = false
  }
  
  // Title validation (optional but if provided, must be reasonable length)
  if (form.title && form.title.trim().length > 100) {
    errors.title = 'Title must be 100 characters or less'
    isValid = false
  }
  
  // Comment validation (optional but if provided, must be reasonable length)
  if (form.comment && form.comment.trim().length > 1000) {
    errors.comment = 'Comment must be 1000 characters or less'
    isValid = false
  }
  
  return isValid
}

const submitReview = async () => {
  console.log('ReviewForm: submitReview called')
  console.log('ReviewForm: props.userId =', props.userId)
  console.log('ReviewForm: props.productId =', props.productId)
  console.log('ReviewForm: form =', form)
  
  if (!validateForm()) {
    console.log('ReviewForm: Form validation failed')
    return
  }
  
  if (!props.userId) {
    console.log('ReviewForm: No userId, showing error')
    toast.error('Please log in to submit a review')
    return
  }
  
  isSubmitting.value = true
  console.log('ReviewForm: Starting submission...')
  
  try {
    const requestBody = {
      product_id: props.productId,
      user_id: props.userId,
      rating: form.rating,
      title: form.title.trim() || null,
      comment: form.comment.trim() || null
    }
    console.log('ReviewForm: Request body =', requestBody)
    
    const response = await reviewsService.submitReview(requestBody)
    
    console.log('ReviewForm: Response =', response)
    
    if (response.success && response.data) {
      toast.success('Review submitted successfully!')
      emit('success', response.data)
      
      // Reset form
      form.rating = 0
      form.title = ''
      form.comment = ''
    } else {
      throw new Error(response.message || 'Failed to submit review')
    }
    
  } catch (error: any) {
    console.error('Review submission failed:', error)

    // Better error handling with proper message extraction
    let errorMessage = 'Failed to submit review. Please try again.'

    if (error.statusCode === 409 || error.status === 409) {
      errorMessage = error.statusMessage || error.data?.message || error.message || 'You have already reviewed this product'
    } else if (error.data?.message) {
      errorMessage = error.data.message
    } else if (error.message) {
      errorMessage = error.message
    }

    toast.error(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}
</script>