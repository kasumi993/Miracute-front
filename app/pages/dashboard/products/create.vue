<template>
  <div class="min-h-screen bg-neutral-50 py-8">
    <div class="container-custom">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center space-x-4 mb-4">
          <NuxtLink to="/dashboard/products" 
                    class="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <Icon name="heroicons:arrow-left" class="w-5 h-5 mr-2" />
            Back to Products
          </NuxtLink>
        </div>
        <h1 class="text-3xl font-heading font-medium text-gray-900">Create New Template</h1>
        <p class="text-gray-600 mt-2">Add a new digital template to your marketplace</p>
      </div>

      <form @submit.prevent="saveProduct" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic Information -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            <!-- Product Name -->
            <div class="mb-6">
              <label for="name" class="form-label">Template Title *</label>
              <input
                id="name"
                v-model="product.name"
                type="text"
                required
                class="form-input"
                placeholder="e.g., Modern Instagram Story Templates Pack"
              />
              <p class="mt-1 text-sm text-gray-500">
                Include what it is, what it's for, and style keywords buyers might search for
              </p>
            </div>

            <!-- Template Type -->
            <div class="mb-6">
              <label for="templateType" class="form-label">Template Type *</label>
              <select
                id="templateType"
                v-model="product.templateType"
                required
                class="form-input"
              >
                <option value="canva">Canva Template</option>
                <option value="photoshop">Photoshop Template (PSD)</option>
                <option value="figma">Figma Template</option>
                <option value="wordpress">WordPress Theme</option>
                <option value="squarespace">Squarespace Template</option>
                <option value="notion">Notion Template</option>
                <option value="powerpoint">PowerPoint Template</option>
                <option value="google-slides">Google Slides Template</option>
                <option value="illustrator">Illustrator Template (AI)</option>
                <option value="indesign">InDesign Template</option>
                <option value="other">Other</option>
              </select>
            </div>

            <!-- Category -->
            <div class="mb-6">
              <label for="category" class="form-label">Category *</label>
              <select
                id="category"
                v-model="product.category_id"
                required
                class="form-input"
              >
                <option value="">Select a category</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <!-- Short Description -->
            <div class="mb-6">
              <label for="shortDescription" class="form-label">Short Description *</label>
              <textarea
                id="shortDescription"
                v-model="product.short_description"
                required
                rows="2"
                class="form-input"
                maxlength="160"
                placeholder="Brief description that appears in listings (160 characters max)"
              />
              <div class="mt-1 text-sm text-gray-500 text-right">
                {{ product.short_description?.length || 0 }}/160
              </div>
            </div>

            <!-- Full Description -->
            <div class="mb-6">
              <label for="description" class="form-label">Full Description *</label>
              <textarea
                id="description"
                v-model="product.description"
                required
                rows="8"
                class="form-input"
                placeholder="Detailed description of what buyers will get, how to use it, what's included, etc."
              />
              <p class="mt-1 text-sm text-gray-500">
                Explain what's included, how to customize, software requirements, etc.
              </p>
            </div>

            <!-- Tags -->
            <div class="mb-6">
              <label for="tags" class="form-label">Tags</label>
              <input
                id="tags"
                v-model="tagsInput"
                type="text"
                class="form-input"
                placeholder="social media, instagram, modern, minimalist (separated by commas)"
              />
              <p class="mt-1 text-sm text-gray-500">
                Add keywords buyers might search for (separated by commas)
              </p>
            </div>
          </div>

          <!-- Digital Files -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Digital Download File *</h2>
            
            <div class="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50">
              <Icon name="heroicons:document-arrow-down" class="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 class="text-lg font-medium text-gray-900 mb-2">Upload Template Access PDF</h3>
              <p class="text-gray-600 mb-4">
                Upload the PDF file that buyers will download. This should contain the template link and access instructions.
              </p>
              <input
                type="file"
                accept=".pdf"
                @change="handleFileUpload"
                class="hidden"
                ref="fileInput"
              />
              <button
                type="button"
                @click="$refs.fileInput.click()"
                :disabled="isUploading"
                class="btn-primary"
              >
                <span v-if="!isUploading">Choose PDF File</span>
                <span v-else class="flex items-center">
                  <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </span>
              </button>
              <p class="text-sm text-gray-500 mt-2">
                PDF files only, maximum 10MB
              </p>
            </div>

            <!-- Uploaded File Display -->
            <div v-if="product.download_files?.length" class="mt-6">
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-center">
                  <Icon name="heroicons:document-check" class="w-8 h-8 text-green-600 mr-3" />
                  <div class="flex-1">
                    <p class="font-medium text-green-800">File uploaded successfully!</p>
                    <p class="text-sm text-green-600">{{ uploadedFileName }}</p>
                    <p class="text-xs text-green-500 mt-1">Size: {{ formatFileSize(uploadedFileSize) }}</p>
                  </div>
                  <button
                    type="button"
                    @click="removeUploadedFile"
                    class="text-red-600 hover:text-red-800"
                  >
                    <Icon name="heroicons:trash" class="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Upload Progress -->
            <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-4">
              <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>Uploading...</span>
                <span>{{ uploadProgress }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: uploadProgress + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Technical Details -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Technical Details</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- File Formats -->
              <div>
                <label for="fileFormats" class="form-label">File Formats Included *</label>
                <input
                  id="fileFormats"
                  v-model="fileFormatsInput"
                  type="text"
                  required
                  class="form-input"
                  placeholder="PSD, PNG, JPG (separated by commas)"
                />
              </div>

              <!-- File Size -->
              <div>
                <label for="fileSize" class="form-label">Total File Size</label>
                <input
                  id="fileSize"
                  v-model="product.file_size"
                  type="text"
                  class="form-input"
                  placeholder="e.g., 15.2 MB"
                />
              </div>

              <!-- Dimensions -->
              <div>
                <label for="dimensions" class="form-label">Dimensions</label>
                <input
                  id="dimensions"
                  v-model="product.dimensions"
                  type="text"
                  class="form-input"
                  placeholder="e.g., 1080x1080px (Instagram Post)"
                />
              </div>

              <!-- Software Required -->
              <div>
                <label for="softwareRequired" class="form-label">Software Required</label>
                <input
                  id="softwareRequired"
                  v-model="softwareRequiredInput"
                  type="text"
                  class="form-input"
                  placeholder="Canva, Photoshop CC 2020+ (separated by commas)"
                />
              </div>

              <!-- Difficulty Level -->
              <div>
                <label for="difficultyLevel" class="form-label">Difficulty Level</label>
                <select
                  id="difficultyLevel"
                  v-model="product.difficulty_level"
                  class="form-input"
                >
                  <option value="">Select difficulty</option>
                  <option value="Beginner">Beginner - No experience needed</option>
                  <option value="Intermediate">Intermediate - Some experience helpful</option>
                  <option value="Advanced">Advanced - Experienced users</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1 space-y-6">
          <!-- Pricing -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
            
            <div class="mb-4">
              <label for="price" class="form-label">Price *</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  id="price"
                  v-model="product.price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  class="form-input pl-8"
                  placeholder="9.99"
                />
              </div>
            </div>

            <div class="mb-4">
              <label for="compareAtPrice" class="form-label">Compare at price (optional)</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  id="compareAtPrice"
                  v-model="product.compare_at_price"
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-input pl-8"
                  placeholder="19.99"
                />
              </div>
              <p class="mt-1 text-sm text-gray-500">
                Original price to show savings
              </p>
            </div>
          </div>

          <!-- Visibility & Status -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Visibility</h3>
            
            <div class="space-y-4">
              <label class="flex items-center">
                <input
                  v-model="product.is_active"
                  type="checkbox"
                  class="form-checkbox"
                />
                <span class="ml-2 text-sm font-medium text-gray-700">
                  Product is active and visible to customers
                </span>
              </label>

              <label class="flex items-center">
                <input
                  v-model="product.is_featured"
                  type="checkbox"
                  class="form-checkbox"
                />
                <span class="ml-2 text-sm font-medium text-gray-700">
                  Feature this product (shows in featured section)
                </span>
              </label>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div class="space-y-3">
              <button
                type="submit"
                :disabled="isLoading"
                class="btn-primary w-full"
              >
                <span v-if="!isLoading">Create Template</span>
                <span v-else class="flex items-center justify-center">
                  <Icon name="heroicons:arrow-path" class="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </span>
              </button>

              <button
                type="button"
                @click="saveDraft"
                :disabled="isLoading"
                class="btn-secondary w-full"
              >
                Save as Draft
              </button>

              <NuxtLink
                to="/dashboard/products"
                class="btn-outline w-full block text-center"
              >
                Cancel
              </NuxtLink>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
// Middleware
definePageMeta({
  middleware: 'admin',
  layout: 'admin'
})

// SEO
useSeoMeta({
  title: 'Create Template | Dashboard',
  description: 'Create a new digital template for your marketplace',
  robots: 'noindex, nofollow'
})

// Composables
const supabase = useSupabaseClient()
const router = useRouter()

// State
const isLoading = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadedFileName = ref('')
const uploadedFileSize = ref(0)
const categories = ref([])
const tagsInput = ref('')
const fileFormatsInput = ref('')
const softwareRequiredInput = ref('')

const product = ref({
  name: '',
  slug: '',
  description: '',
  short_description: '',
  price: '',
  compare_at_price: '',
  category_id: '',
  templateType: 'canva', // Default to Canva
  preview_images: [],
  download_files: [],
  file_size: '',
  file_formats: [],
  tags: [],
  difficulty_level: '',
  software_required: [],
  dimensions: '',
  is_active: true,
  is_featured: false,
  seo_title: '',
  seo_description: '',
  meta_keywords: []
})

// Methods
const loadCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    categories.value = data || []
  } catch (error) {
    console.error('Error loading categories:', error)
    useToast().error('Failed to load categories')
  }
}

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file type
  if (file.type !== 'application/pdf') {
    useToast().error('Please select a PDF file')
    return
  }

  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    useToast().error('File size must be less than 10MB')
    return
  }

  isUploading.value = true
  uploadProgress.value = 0

  try {
    // Generate unique filename with product slug (when available) or timestamp
    const timestamp = Date.now()
    const sanitizedProductName = product.value.name ? generateSlug(product.value.name) : 'untitled'
    const fileName = `${sanitizedProductName}-${timestamp}.pdf`

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('Miracute-templates')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Store the file path in product
    product.value.download_files = [data.path]
    uploadedFileName.value = file.name
    uploadedFileSize.value = file.size
    uploadProgress.value = 100

    useToast().success('File uploaded successfully!')
  } catch (error) {
    console.error('Error uploading file:', error)
    useToast().error('Failed to upload file. Please try again.')
  } finally {
    isUploading.value = false
    // Reset file input
    event.target.value = ''
  }
}

const removeUploadedFile = async () => {
  if (!product.value.download_files?.length) return

  try {
    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from('Miracute-templates')
      .remove([product.value.download_files[0]])

    if (error) throw error

    // Clear from product
    product.value.download_files = []
    uploadedFileName.value = ''
    uploadedFileSize.value = 0
    uploadProgress.value = 0

    useToast().success('File removed successfully')
  } catch (error) {
    console.error('Error removing file:', error)
    useToast().error('Failed to remove file')
  }
}

const saveProduct = async () => {
  // Validate required fields
  if (!product.value.download_files?.length) {
    useToast().error('Please upload a PDF file for the template download')
    return
  }

  isLoading.value = true
  
  try {
    // Process arrays
    product.value.tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean)
    product.value.file_formats = fileFormatsInput.value.split(',').map(format => format.trim()).filter(Boolean)
    product.value.software_required = softwareRequiredInput.value.split(',').map(software => software.trim()).filter(Boolean)
    
    // Generate slug
    product.value.slug = generateSlug(product.value.name)
    
    // Convert prices to numbers
    product.value.price = parseFloat(product.value.price)
    if (product.value.compare_at_price) {
      product.value.compare_at_price = parseFloat(product.value.compare_at_price)
    }
    
    const { data, error } = await supabase
      .from('products')
      .insert([product.value])
      .select()
      .single()

    if (error) throw error

    useToast().success('Template created successfully!')
    await router.push(`/dashboard/products`)
  } catch (error) {
    console.error('Error creating product:', error)
    useToast().error('Failed to create template. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const saveDraft = async () => {
  product.value.is_active = false
  await saveProduct()
}

// Initialize
onMounted(async () => {
  await loadCategories()
})

// Watch for name changes to suggest SEO title
watch(() => product.value.name, (newName) => {
  if (!product.value.seo_title) {
    product.value.seo_title = newName
  }
})
</script>
