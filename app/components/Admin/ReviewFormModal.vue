<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-medium text-gray-900">
        {{ isEditing ? 'Edit Review' : 'Create New Review' }}
      </h2>
      <button
        @click="$emit('cancel')"
        class="text-gray-400 hover:text-gray-500"
      >
        <Icon name="heroicons:x-mark" class="w-6 h-6" />
      </button>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Product Selection (only for new reviews) -->
      <div v-if="!isEditing">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Product *
        </label>
        <select
          v-model="form.product_id"
          required
          class="form-input"
        >
          <option value="">Select a product...</option>
          <option 
            v-for="product in products" 
            :key="product.id"
            :value="product.id"
          >
            {{ product.name }}
          </option>
        </select>
        <p v-if="errors.product_id" class="mt-1 text-sm text-red-600">{{ errors.product_id }}</p>
      </div>

      <!-- User Selection (only for new reviews) -->
      <div v-if="!isEditing">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Customer *
        </label>
        <div class="relative">
          <input
            v-model="userSearch"
            @input="searchUsers"
            type="text"
            placeholder="Search by name or email..."
            class="form-input"
            required
          >
          <div 
            v-if="showUserDropdown && filteredUsers.length > 0"
            class="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1"
          >
            <button
              v-for="user in filteredUsers"
              :key="user.id"
              type="button"
              @click="selectUser(user)"
              class="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div class="font-medium text-gray-900">{{ getUserFullName(user) }}</div>
              <div class="text-sm text-gray-500">{{ user.email }}</div>
            </button>
          </div>
        </div>
        <p v-if="errors.user_id" class="mt-1 text-sm text-red-600">{{ errors.user_id }}</p>
      </div>

      <!-- Rating -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Rating *
        </label>
        <div class="flex items-center space-x-2">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            @click="setRating(star)"
            :class="[
              'w-8 h-8 transition-colors',
              form.rating >= star ? 'text-yellow-400' : 'text-gray-300'
            ]"
          >
            <Icon name="heroicons:star-20-solid" class="w-8 h-8" />
          </button>
          <span v-if="form.rating > 0" class="ml-2 text-sm text-gray-600">
            {{ ratingLabels[form.rating - 1] }}
          </span>
        </div>
        <p v-if="errors.rating" class="mt-1 text-sm text-red-600">{{ errors.rating }}</p>
      </div>

      <!-- Title -->
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
          Review Title (Optional)
        </label>
        <input
          id="title"
          v-model="form.title"
          type="text"
          class="form-input"
          placeholder="Summarize the review..."
          maxlength="100"
        >
        <p v-if="errors.title" class="mt-1 text-sm text-red-600">{{ errors.title }}</p>
      </div>

      <!-- Comment -->
      <div>
        <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">
          Review Comment (Optional)
        </label>
        <textarea
          id="comment"
          v-model="form.comment"
          rows="4"
          class="form-input"
          placeholder="Detailed review..."
          maxlength="1000"
        ></textarea>
        <div class="flex justify-between items-center mt-1">
          <p v-if="errors.comment" class="text-sm text-red-600">{{ errors.comment }}</p>
          <p class="text-xs text-gray-500 ml-auto">
            {{ form.comment?.length || 0 }}/1000 characters
          </p>
        </div>
      </div>

      <!-- Status Options -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex items-center">
          <input
            id="is_approved"
            v-model="form.is_approved"
            type="checkbox"
            class="h-4 w-4 text-brand-sage focus:ring-brand-sage border-gray-300 rounded"
          >
          <label for="is_approved" class="ml-2 block text-sm text-gray-700">
            Approved
          </label>
        </div>
        
        <div class="flex items-center">
          <input
            id="is_verified_purchase"
            v-model="form.is_verified_purchase"
            type="checkbox"
            class="h-4 w-4 text-brand-sage focus:ring-brand-sage border-gray-300 rounded"
          >
          <label for="is_verified_purchase" class="ml-2 block text-sm text-gray-700">
            Verified Purchase
          </label>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end space-x-4 pt-4">
        <button
          type="button"
          @click="$emit('cancel')"
          class="btn-outline"
        >
          Cancel
        </button>
        
        <button
          type="submit"
          :disabled="isSubmitting"
          class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="!isSubmitting">
            {{ isEditing ? 'Update Review' : 'Create Review' }}
          </span>
          <span v-else class="flex items-center space-x-2">
            <Icon name="heroicons:arrow-path" class="w-4 h-4 animate-spin" />
            <span>{{ isEditing ? 'Updating...' : 'Creating...' }}</span>
          </span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { debounce } from 'lodash-es'

interface Props {
  review?: any
}

interface Emits {
  (e: 'save'): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const { createReview, updateReview } = useReviews()
const toast = useToast()

// State
const isEditing = computed(() => !!props.review)

const form = reactive({
  product_id: '',
  user_id: '',
  rating: 0,
  title: '',
  comment: '',
  is_approved: true,
  is_verified_purchase: false
})

const errors = reactive({
  product_id: '',
  user_id: '',
  rating: '',
  title: '',
  comment: ''
})

const isSubmitting = ref(false)
const products = ref([])
const users = ref([])
const filteredUsers = ref([])
const userSearch = ref('')
const showUserDropdown = ref(false)
const selectedUser = ref(null)

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

const searchUsers = debounce(async () => {
  if (userSearch.value.length < 2) {
    showUserDropdown.value = false
    return
  }
  
  try {
    // In a real app, you'd have a user search API
    // For now, we'll mock this with a simple filter
    const response = await $fetch('/api/admin/users/search', {
      method: 'GET',
      query: { q: userSearch.value, limit: 10 }
    })
    
    filteredUsers.value = response.users || []
    showUserDropdown.value = filteredUsers.value.length > 0
  } catch (error) {
    console.error('Error searching users:', error)
    showUserDropdown.value = false
  }
}, 300)

const getUserFullName = (user: any) => {
  if (!user) return 'Anonymous'
  if (user.first_name || user.last_name) {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim()
  }
  return 'Anonymous'
}

const selectUser = (user: any) => {
  selectedUser.value = user
  form.user_id = user.id
  userSearch.value = `${getUserFullName(user)} (${user.email})`
  showUserDropdown.value = false
  errors.user_id = ''
}

const loadProducts = async () => {
  try {
    const response = await $fetch('/api/admin/products', {
      method: 'GET',
      query: { limit: 1000, status: 'active' }
    })
    
    if (response.success) {
      products.value = response.products
    }
  } catch (error) {
    console.error('Error loading products:', error)
  }
}

const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
  
  let isValid = true
  
  if (!isEditing.value) {
    if (!form.product_id) {
      errors.product_id = 'Product is required'
      isValid = false
    }
    
    if (!form.user_id) {
      errors.user_id = 'Customer is required'
      isValid = false
    }
  }
  
  if (!form.rating || form.rating < 1 || form.rating > 5) {
    errors.rating = 'Please select a rating'
    isValid = false
  }
  
  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  try {
    if (isEditing.value) {
      await updateReview(props.review.id, {
        rating: form.rating,
        title: form.title.trim() || null,
        comment: form.comment.trim() || null,
        is_approved: form.is_approved
      })
    } else {
      await createReview({
        product_id: form.product_id,
        user_id: form.user_id,
        rating: form.rating,
        title: form.title.trim() || null,
        comment: form.comment.trim() || null,
        is_verified_purchase: form.is_verified_purchase,
        is_approved: form.is_approved,
        force_override: true
      })
    }
    
    emit('save')
  } catch (error: any) {
    console.error('Error saving review:', error)
    const errorMessage = error.data?.message || error.message || 'Failed to save review'
    toast.error(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}

// Initialize form with existing review data
watch(() => props.review, (newReview) => {
  if (newReview) {
    form.rating = newReview.rating
    form.title = newReview.title || ''
    form.comment = newReview.comment || ''
    form.is_approved = newReview.is_approved
    form.is_verified_purchase = newReview.is_verified_purchase
  }
}, { immediate: true })

// Load products on mount
onMounted(() => {
  if (!isEditing.value) {
    loadProducts()
  }
})

// Click outside handler to close user dropdown
onClickOutside($refs.userDropdown, () => {
  showUserDropdown.value = false
})
</script>