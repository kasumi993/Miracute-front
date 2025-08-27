<template>
  <form @submit.prevent="handleSubmit" class="space-y-8">
    <!-- Basic Information -->
    <div class="card p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-6">Basic Information</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          v-model="form.name"
          label="Product Name"
          required
          :error="errors.name"
          placeholder="Beautiful Wedding Website Template"
        />
        
        <div>
          <label class="form-label">Category</label>
          <select
            v-model="form.category_id"
            class="form-input"
            required
            :class="{ 'border-red-300': errors.category_id }"
          >
            <option value="">Select Category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          <p v-if="errors.category_id" class="mt-2 text-sm text-red-600">{{ errors.category_id }}</p>
        </div>

        <Input
          v-model="form.slug"
          label="URL Slug"
          :error="errors.slug"
          placeholder="beautiful-wedding-template"
          hint="Auto-generated from product name if left empty"
        />
        
        <Input
          v-model="form.price"
          label="Price ($)"
          type="number"
          step="0.01"
          min="0"
          required
          :error="errors.price"
        />
        
        <Input
          v-model="form.compare_at_price"
          label="Compare at Price ($)"
          type="number"
          step="0.01"
          min="0"
          :error="errors.compare_at_price"
          hint="Original price for showing discounts"
        />
        
        <div>
          <label class="form-label">Status</label>
          <select v-model="form.status" class="form-input">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div class="mt-6">
        <Input
          v-model="form.short_description"
          label="Short Description"
          :error="errors.short_description"
          placeholder="Brief description for product cards"
          hint="Shown in product listings and previews"
        />
      </div>
    </div>

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
              <option value="">Not specified</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          
          <Input
            v-model="form.file_size"
            label="File Size"
            placeholder="2.5 MB"
          />
          
          <Input
            v-model="form.dimensions"
            label="Dimensions"
            placeholder="1920x1080"
          />
        </div>
      </div>
    </div>

    <!-- Media & Files -->
    <div class="card p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-6">Media & Files</h3>
      
      <div class="space-y-6">
        <Input
          v-model="form.thumbnail_url"
          label="Thumbnail URL"
          type="url"
          :error="errors.thumbnail_url"
          placeholder="https://example.com/thumbnail.jpg"
        />

        <!-- Preview Images -->
        <div>
          <label class="form-label">Preview Images (URLs)</label>
          <div class="space-y-2">
            <div v-for="(image, index) in form.preview_images" :key="index" class="flex space-x-2">
              <Input
                v-model="form.preview_images[index]"
                type="url"
                placeholder="https://example.com/preview.jpg"
                class="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                @click="removePreviewImage(index)"
              >
                <Icon name="heroicons:x-mark" class="w-4 h-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              @click="addPreviewImage"
              class="w-full border-2 border-dashed border-gray-300 hover:border-gray-400"
            >
              <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
              Add Preview Image
            </Button>
          </div>
        </div>

        <Input
          v-model="form.download_url"
          label="Download URL"
          type="url"
          :error="errors.download_url"
          placeholder="https://example.com/template-files.zip"
          hint="Secure URL where the template files are hosted"
        />
      </div>
    </div>

    <!-- Technical Details -->
    <div class="card p-6">
      <h3 class="text-lg font-medium text-gray-900 mb-6">Technical Details</h3>
      
      <div class="space-y-6">
        <!-- File Formats -->
        <div>
          <label class="form-label">File Formats</label>
          <div class="space-y-2">
            <div v-for="(format, index) in form.file_formats" :key="index" class="flex space-x-2">
              <Input
                v-model="form.file_formats[index]"
                placeholder="e.g., HTML, CSS, JS"
                class="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                @click="removeFileFormat(index)"
              >
                <Icon name="heroicons:x-mark" class="w-4 h-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              @click="addFileFormat"
              class="w-full border-2 border-dashed border-gray-300 hover:border-gray-400"
            >
              <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
              Add File Format
            </Button>
          </div>
        </div>

        <!-- Software Required -->
        <div>
          <label class="form-label">Compatible Software</label>
          <div class="space-y-2">
            <div v-for="(software, index) in form.software_required" :key="index" class="flex space-x-2">
              <Input
                v-model="form.software_required[index]"
                placeholder="e.g., Figma, Canva, Photoshop"
                class="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                @click="removeSoftware(index)"
              >
                <Icon name="heroicons:x-mark" class="w-4 h-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              @click="addSoftware"
              class="w-full border-2 border-dashed border-gray-300 hover:border-gray-400"
            >
              <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
              Add Software
            </Button>
          </div>
        </div>

        <!-- Tags -->
        <div>
          <label class="form-label">Tags</label>
          <div class="space-y-2">
            <div v-for="(tag, index) in form.tags" :key="index" class="flex space-x-2">
              <Input
                v-model="form.tags[index]"
                placeholder="e.g., wedding, elegant, modern"
                class="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                @click="removeTag(index)"
              >
                <Icon name="heroicons:x-mark" class="w-4 h-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              @click="addTag"
              class="w-full border-2 border-dashed border-gray-300 hover:border-gray-400"
            >
              <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
              Add Tag
            </Button>
          </div>
        </div>
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

        <!-- Meta Keywords -->
        <div>
          <label class="form-label">Meta Keywords</label>
          <div class="space-y-2">
            <div v-for="(keyword, index) in form.meta_keywords" :key="index" class="flex space-x-2">
              <Input
                v-model="form.meta_keywords[index]"
                placeholder="keyword"
                class="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                @click="removeKeyword(index)"
              >
                <Icon name="heroicons:x-mark" class="w-4 h-4" />
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              @click="addKeyword"
              class="w-full border-2 border-dashed border-gray-300 hover:border-gray-400"
            >
              <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
              Add Keyword
            </Button>
          </div>
        </div>
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
    <div class="flex items-center justify-between pt-6 border-t border-gray-200">
      <Button
        type="button"
        variant="ghost"
        @click="$emit('cancel')"
      >
        Cancel
      </Button>
      
      <div class="flex space-x-3">
        <Button
          type="button"
          variant="secondary"
          @click="saveDraft"
          :loading="isDraftLoading"
        >
          Save as Draft
        </Button>
        
        <Button
          type="submit"
          :loading="isLoading"
          :disabled="!isFormValid"
        >
          {{ product ? 'Update Product' : 'Create Product' }}
        </Button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
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

// Form state
const form = reactive<Product>({
  name: '',
  category_id: '',
  price: '',
  compare_at_price: '',
  short_description: '',
  description: '',
  status: 'draft',
  thumbnail_url: '',
  preview_images: [''],
  download_url: '',
  file_formats: [''],
  software_required: [''],
  tags: [''],
  difficulty_level: '',
  file_size: '',
  dimensions: '',
  seo_title: '',
  seo_description: '',
  meta_keywords: [''],
  is_featured: false,
  is_digital: true
})

const errors = ref<Record<string, string>>({})
const isLoading = ref(false)
const isDraftLoading = ref(false)

// Initialize form with product data
if (props.product) {
  Object.assign(form, {
    ...props.product,
    preview_images: props.product.preview_images?.length ? props.product.preview_images : [''],
    file_formats: props.product.file_formats?.length ? props.product.file_formats : [''],
    software_required: props.product.software_required?.length ? props.product.software_required : [''],
    tags: props.product.tags?.length ? props.product.tags : [''],
    meta_keywords: props.product.meta_keywords?.length ? props.product.meta_keywords : ['']
  })
}

// Computed
const isFormValid = computed(() => {
  return form.name && form.category_id && form.price && parseFloat(form.price) >= 0
})

// Auto-generate slug from name
watch(() => form.name, (newName) => {
  if (!props.product && newName) {
    form.slug = newName.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }
})

// Methods
const addPreviewImage = () => form.preview_images.push('')
const removePreviewImage = (index: number) => form.preview_images.splice(index, 1)

const addFileFormat = () => form.file_formats.push('')
const removeFileFormat = (index: number) => form.file_formats.splice(index, 1)

const addSoftware = () => form.software_required.push('')
const removeSoftware = (index: number) => form.software_required.splice(index, 1)

const addTag = () => form.tags.push('')
const removeTag = (index: number) => form.tags.splice(index, 1)

const addKeyword = () => form.meta_keywords.push('')
const removeKeyword = (index: number) => form.meta_keywords.splice(index, 1)

const validateForm = () => {
  errors.value = {}
  
  if (!form.name) errors.value.name = 'Product name is required'
  if (!form.category_id) errors.value.category_id = 'Category is required'
  if (!form.price) errors.value.price = 'Price is required'
  else if (parseFloat(form.price) < 0) errors.value.price = 'Price must be positive'
  
  if (form.compare_at_price && parseFloat(form.compare_at_price) <= parseFloat(form.price)) {
    errors.value.compare_at_price = 'Compare price must be higher than regular price'
  }
  
  return Object.keys(errors.value).length === 0
}

const cleanFormData = () => {
  // Remove empty strings from arrays
  const cleanedForm = { ...form }
  cleanedForm.preview_images = form.preview_images.filter(img => img.trim())
  cleanedForm.file_formats = form.file_formats.filter(format => format.trim())
  cleanedForm.software_required = form.software_required.filter(software => software.trim())
  cleanedForm.tags = form.tags.filter(tag => tag.trim())
  cleanedForm.meta_keywords = form.meta_keywords.filter(keyword => keyword.trim())
  
  return cleanedForm
}

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