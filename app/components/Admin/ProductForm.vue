<template>
  <form @submit.prevent="handleSubmit" class="space-y-8">
    <!-- Basic Information -->
    <BasicInformation
      :form="form"
      :errors="errors"
      :categories="categories"
    />

    <!-- Description & Content -->
    <div class="card p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-6">Description & Content</h3>

      <div class="space-y-6">
        <div>
          <label class="form-label">Description</label>
          <textarea
            v-model="form.description"
            class="form-input min-h-[120px]"
            :class="{ 'border-red-300': errors.description }"
            placeholder="Detailed description of the template..."
          ></textarea>
          <p v-if="errors.description" class="mt-2 text-sm text-red-600">{{ errors.description }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="form-label">Difficulty Level</label>
            <select v-model="form.difficulty_level" class="form-input">
              <option value="">Select Level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <Input
            v-model="form.file_size"
            label="File Size"
            placeholder="e.g., 2.5 MB"
          />

          <Input
            v-model="form.dimensions"
            label="Dimensions"
            placeholder="e.g., 1920x1080"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ArrayFieldManager
            v-model="form.file_formats"
            label="File Formats"
            placeholder="e.g., .psd, .ai, .png"
            add-button-text="Add Format"
          />

          <ArrayFieldManager
            v-model="form.software_required"
            label="Software Required"
            placeholder="e.g., Figma, Canva, Photoshop"
            add-button-text="Add Software"
          />
        </div>

        <ArrayFieldManager
          v-model="form.tags"
          label="Tags"
          placeholder="e.g., wedding, elegant, modern"
          add-button-text="Add Tag"
        />
      </div>
    </div>

    <!-- SEO Settings -->
    <div class="card p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-6">SEO Settings</h3>

      <div class="space-y-6">
        <Input
          v-model="form.seo_title"
          label="SEO Title"
          :error="errors.seo_title"
          placeholder="Optimized title for search engines"
        />

        <div>
          <label class="form-label">SEO Description</label>
          <textarea
            v-model="form.seo_description"
            class="form-input min-h-[80px]"
            placeholder="Meta description for search engines"
          ></textarea>
        </div>

        <ArrayFieldManager
          v-model="form.meta_keywords"
          label="Meta Keywords"
          placeholder="keyword"
          add-button-text="Add Keyword"
        />
      </div>
    </div>

    <!-- Settings -->
    <div class="card p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-6">Settings</h3>

      <div class="space-y-4">
        <label class="flex items-center">
          <input
            v-model="form.is_featured"
            type="checkbox"
            class="rounded border-gray-300 text-brand-sage focus:ring-brand-sage"
          />
          <span class="ml-3 text-sm font-medium text-gray-700">Featured Product</span>
        </label>

        <label class="flex items-center">
          <input
            v-model="form.is_digital"
            type="checkbox"
            class="rounded border-gray-300 text-brand-sage focus:ring-brand-sage"
          />
          <span class="ml-3 text-sm font-medium text-gray-700">Digital Product</span>
        </label>
      </div>
    </div>

    <!-- Submit Actions -->
    <ProductFormActions
      :is-loading="isLoading"
      :is-draft-loading="isDraftLoading"
      :is-form-valid="isFormValid"
      :is-editing="!!product"
      @cancel="$emit('cancel')"
      @save-draft="saveDraft"
    />
  </form>
</template>

<script setup lang="ts">
import BasicInformation from './ProductForm/BasicInformation.vue'
import ArrayFieldManager from './ProductForm/ArrayFieldManager.vue'
import ProductFormActions from './ProductForm/ProductFormActions.vue'

interface Product {
  id?: string
  name: string
  slug?: string
  category_id: string
  price: string
  compare_at_price?: string
  short_description?: string
  description?: string
  status: 'draft' | 'active' | 'archived'
  thumbnail_url?: string
  preview_images: string[]
  download_url?: string
  file_formats: string[]
  software_required: string[]
  tags: string[]
  difficulty_level?: string
  file_size?: string
  dimensions?: string
  seo_title?: string
  seo_description?: string
  meta_keywords: string[]
  is_featured: boolean
  is_digital: boolean
}

interface Props {
  product?: Product | null
  categories: Array<{ id: string; name: string }>
}

const props = withDefaults(defineProps<Props>(), {
  product: null
})

const emit = defineEmits<{
  submit: [product: Product]
  cancel: []
}>()

// Use the composable for form management
const {
  form,
  errors,
  isLoading,
  isDraftLoading,
  isFormValid,
  validateForm,
  cleanFormData
} = useProductForm(props.product)

const handleSubmit = async () => {
  if (!validateForm()) return

  isLoading.value = true

  try {
    const cleanedData = cleanFormData()
    cleanedData.status = 'active'
    emit('submit', cleanedData)
  } finally {
    isLoading.value = false
  }
}

const saveDraft = async () => {
  isDraftLoading.value = true

  try {
    const cleanedData = cleanFormData()
    cleanedData.status = 'draft'
    emit('submit', cleanedData)
  } finally {
    isDraftLoading.value = false
  }
}
</script>