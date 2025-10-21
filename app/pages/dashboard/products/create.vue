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
        <h1 class="text-3xl font-heading font-medium text-gray-900">{{ isEditing ? 'Edit Template' : 'Create New Template' }}</h1>
        <p class="text-gray-600 mt-2">{{ isEditing ? 'Update your digital template' : 'Add a new digital template to your marketplace' }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="isInitialLoading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <Icon name="heroicons:arrow-path" class="w-8 h-8 animate-spin mx-auto mb-4 text-brand-brown" />
          <p class="text-gray-600">Loading product data...</p>
        </div>
      </div>


      <form v-if="!isInitialLoading" @submit.prevent="saveProduct" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic Information Component -->
          <ProductBasicInfo
            :product="product"
            :categories="categories"
            :template-types="templateTypes"
            :tags-input="tagsInput"
            @update:product="product = $event"
            @update:tags-input="tagsInput = $event"
          />

          <!-- Product Images -->
          <AdminProductImageUpload
            :images="product.preview_images || []"
            :video-url="product.video_url"
            :is-uploading="isUploading"
            :upload-progress="uploadProgress"
            @update:images="updateProductImages"
            @update:video="updateProductVideo"
            @upload-images="handleImageUpload"
            @upload-video="handleVideoUpload"
          />

          <!-- File Upload Component -->
          <ProductFileUpload
            :product="product"
            :is-uploading="isUploading"
            :upload-progress="uploadProgress"
            :uploaded-file-name="uploadedFileName"
            :uploaded-file-size="uploadedFileSize"
            @update:product="product = $event"
            @upload-file="handleFileUpload"
            @remove-file="removeUploadedFile"
          />

          <!-- Technical Details Component -->
          <ProductTechnicalDetails
            :product="product"
            :file-formats-input="fileFormatsInput"
            :software-required-input="softwareRequiredInput"
            @update:product="product = $event"
            @update:file-formats-input="fileFormatsInput = $event"
            @update:software-required-input="softwareRequiredInput = $event"
          />
        </div>

        <!-- Sidebar -->
        <div class="lg:col-span-1">
          <ProductPricingVisibility
            :product="product"
            :is-loading="isLoading"
            :is-editing="isEditing"
            @update:product="product = $event"
            @save-draft="saveDraft"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
// Component imports
import ProductBasicInfo from '~/components/Admin/ProductBasicInfo.vue'
import ProductFileUpload from '~/components/Admin/ProductFileUpload.vue'
import ProductTechnicalDetails from '~/components/Admin/ProductTechnicalDetails.vue'
import ProductPricingVisibility from '~/components/Admin/ProductPricingVisibility.vue'

// Service imports
import { AdminService, ProductService } from '~/services'

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
const route = useRoute()

// State
const isLoading = ref(false)
const isUploading = ref(false)
const isInitialLoading = ref(false)
const uploadProgress = ref(0)
const uploadedFileName = ref('')
const uploadedFileSize = ref(0)
const categories = ref([])
const templateTypes = ref([])
const tagsInput = ref('')
const fileFormatsInput = ref('')
const softwareRequiredInput = ref('')

// Edit mode
const isEditing = ref(false)
const editProductId = ref(null)

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
  video_url: null,
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
    const response = await AdminService.getCategories()
    categories.value = response.data.filter(cat => cat.is_active) || []
  } catch (error) {
    console.error('Error loading categories:', error)
    useToast().error('Failed to load categories')
  }
}

const loadTemplateTypes = async () => {
  try {
    const response = await AdminService.getTemplateTypes()
    templateTypes.value = response.data || []
  } catch (error) {
    console.error('Error loading template types:', error)
    useToast().error('Failed to load template types')
  }
}

const loadProduct = async (productId) => {
  isInitialLoading.value = true
  
  try {
    const response = await AdminService.getProduct(productId)

    if (!response.success || !response.data) {
      throw new Error('Product not found or invalid response')
    }

    const data = response.data

    // Populate form with existing data
    product.value = {
      id: data.id,
      name: data.name || '',
      slug: data.slug || '',
      description: data.description || '',
      short_description: data.short_description || '',
      price: data.price || '',
      compare_at_price: data.compare_at_price || '',
      category_id: data.category_id || '',
      templateType: data.template_type || 'canva',
      preview_images: data.preview_images || [],
      video_url: data.video_url || null,
      download_files: data.download_files || [],
      file_size: data.file_size || '',
      file_formats: data.file_formats || [],
      tags: data.tags || [],
      difficulty_level: data.difficulty_level || '',
      software_required: data.software_required || [],
      dimensions: data.dimensions || '',
      is_active: data.is_active ?? true,
      is_featured: data.is_featured ?? false,
      seo_title: data.seo_title || '',
      seo_description: data.seo_description || '',
      meta_keywords: data.meta_keywords || []
    }

    // Populate input fields for arrays
    tagsInput.value = (data.tags || []).join(', ')
    fileFormatsInput.value = (data.file_formats || []).join(', ')
    softwareRequiredInput.value = (data.software_required || []).join(', ')

    // Set uploaded file info if file exists
    if (data.download_files?.length) {
      uploadedFileName.value = data.download_files[0].split('/').pop() || 'Unknown file'
      uploadedFileSize.value = 0 // We don't store original file size
    }

  } catch (error) {
    console.error('Error loading product:', error)
    useToast().error(`Failed to load product: ${error.message}`)
    // Don't redirect immediately, let user decide what to do
  } finally {
    isInitialLoading.value = false
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

const handleFileUpload = async (file) => {
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

// Image upload handler
const handleImageUpload = async (files) => {
  if (!files || files.length === 0) return

  const currentImages = product.value.preview_images || []
  const remainingSlots = 10 - currentImages.length
  
  if (remainingSlots <= 0) {
    useToast().warning('Maximum 10 images allowed')
    return
  }

  const filesToUpload = Array.from(files).slice(0, remainingSlots)

  try {
    isUploading.value = true
    uploadProgress.value = 0

    // Upload via AdminService with progress tracking
    const response = await AdminService.uploadImages(filesToUpload, (progress) => {
      uploadProgress.value = progress
    })

    // Update product with new images
    if (response.success && response.data) {
      const newImages = [...currentImages, ...response.data.urls]
      product.value.preview_images = newImages
      useToast().success(response.data.message || 'Images uploaded successfully')
    } else {
      throw new Error(response.error || 'Failed to upload images')
    }
    
  } catch (error) {
    console.error('Error uploading images:', error)
    useToast().error(error.data?.message || 'Failed to upload images. Please try again.')
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

// Update product images
const updateProductImages = (newImages) => {
  product.value.preview_images = newImages
}

// Update product video
const updateProductVideo = (videoUrl) => {
  product.value.video_url = videoUrl
}

// Video upload handler
const handleVideoUpload = async (files) => {
  if (!files || files.length === 0) return

  const file = files[0] // Only one video file

  try {
    isUploading.value = true
    uploadProgress.value = 0

    // Upload via AdminService with progress tracking
    const response = await AdminService.uploadImages([file], (progress) => {
      uploadProgress.value = progress
    })

    // Update product with video URL
    if (response.success && response.data) {
      product.value.video_url = response.data.urls[0]
      useToast().success('Video uploaded successfully')
    } else {
      throw new Error(response.error || 'Failed to upload video')
    }

  } catch (error) {
    console.error('Error uploading video:', error)
    useToast().error(error.data?.message || 'Failed to upload video. Please try again.')
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

const saveProduct = async () => {
  // Validate required fields
  if (!product.value.name || product.value.name.trim() === '') {
    useToast().error('Please enter a product name')
    return
  }

  if (!product.value.short_description || product.value.short_description.trim() === '') {
    useToast().error('Please enter a short description')
    return
  }

  if (!product.value.description || product.value.description.trim() === '') {
    useToast().error('Please enter a full description')
    return
  }

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
    
    // Convert and validate prices
    const price = parseFloat(product.value.price)
    if (isNaN(price) || price <= 0) {
      useToast().error('Please enter a valid price greater than 0')
      return
    }
    product.value.price = price
    
    // Handle compare_at_price (optional field)
    if (product.value.compare_at_price && product.value.compare_at_price.toString().trim() !== '') {
      const comparePrice = parseFloat(product.value.compare_at_price)
      if (isNaN(comparePrice) || comparePrice <= 0) {
        useToast().error('Please enter a valid compare price or leave it empty')
        return
      }
      product.value.compare_at_price = comparePrice
    } else {
      // Set to null for empty/invalid compare_at_price
      product.value.compare_at_price = null
    }
    
    // Prepare clean data object for database operations
    const cleanProductData = {
      name: product.value.name,
      slug: product.value.slug,
      description: product.value.description || null,
      short_description: product.value.short_description || null,
      price: product.value.price,
      compare_at_price: product.value.compare_at_price,
      category_id: product.value.category_id || null,
      template_type: product.value.templateType,
      preview_images: product.value.preview_images || null,
      video_url: product.value.video_url || null,
      download_files: product.value.download_files || null,
      file_size: product.value.file_size || null,
      file_formats: product.value.file_formats || null,
      tags: product.value.tags || null,
      difficulty_level: product.value.difficulty_level || null,
      software_required: product.value.software_required || null,
      dimensions: product.value.dimensions || null,
      is_active: product.value.is_active,
      is_featured: product.value.is_featured,
      seo_title: product.value.seo_title || null,
      seo_description: product.value.seo_description || null,
      meta_keywords: product.value.meta_keywords || null
    }
    
    if (isEditing.value) {
      const response = await AdminService.updateProduct(editProductId.value, cleanProductData)

      if (!response.success) throw new Error('Failed to update product')
      useToast().success('Template updated successfully!')
    } else {
      const response = await ProductService.createProduct(cleanProductData)

      if (!response.success) throw new Error('Failed to create product')
      useToast().success('Template created successfully!')
    }

    await router.push(`/dashboard/products`)
  } catch (error) {
    console.error('Error saving product:', error)
    let errorMessage = `Failed to ${isEditing.value ? 'update' : 'create'} template. Please try again.`
    
    if (error.statusCode) {
      switch (error.statusCode) {
        case 400:
          errorMessage = 'Invalid product data. Please check all required fields.'
          break
        case 401:
          errorMessage = 'You are not authorized to perform this action.'
          break
        case 403:
          errorMessage = 'Access denied. Admin privileges required.'
          break
        case 404:
          errorMessage = isEditing.value ? 'Product not found.' : 'Resource not found.'
          break
        case 409:
          errorMessage = 'A product with this name or slug already exists.'
          break
        case 422:
          errorMessage = 'Validation failed. Please check your input data.'
          break
        case 500:
          errorMessage = 'Server error occurred. Please try again later.'
          break
        default:
          errorMessage = `Server error (${error.statusCode}). Please try again.`
      }
    } else if (error.message) {
      if (error.message.includes('template_type')) {
        errorMessage = 'Invalid template type selected. Please choose a valid template type.'
      } else if (error.message.includes('category')) {
        errorMessage = 'Invalid category selected. Please choose a valid category.'
      } else if (error.message.includes('duplicate')) {
        errorMessage = 'A product with this name already exists. Please choose a different name.'
      } else if (error.message.includes('validation')) {
        errorMessage = 'Please check all required fields and try again.'
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      }
    }
    
    useToast().error(errorMessage)
  } finally {
    isLoading.value = false
  }
}

const saveDraft = async () => {
  product.value.is_active = false
  await saveProduct()
}

onMounted(async () => {
  try {
    const editId = route.query.edit
    if (editId) {
      isInitialLoading.value = true
      isEditing.value = true
      editProductId.value = editId
    }
    
    await Promise.all([
      loadCategories(),
      loadTemplateTypes()
    ])
    
    if (editId) {
      await loadProduct(editId)
    }
  } catch (error) {
    console.error('Error during initialization:', error)
    useToast().error('Failed to initialize page')
    isInitialLoading.value = false
  }
})

watch(() => product.value.name, (newName) => {
  if (!product.value.seo_title) {
    product.value.seo_title = newName
  }
})

watch(() => route.query.edit, async (editId) => {
  if (editId && editId !== editProductId.value) {
    isInitialLoading.value = true
    isEditing.value = true
    editProductId.value = editId
    await loadProduct(editId)
  } else if (!editId && isEditing.value) {
    isEditing.value = false
    editProductId.value = null
    isInitialLoading.value = false
    product.value = {
      name: '',
      slug: '',
      description: '',
      short_description: '',
      price: '',
      compare_at_price: '',
      category_id: '',
      templateType: 'canva',
      preview_images: [],
      video_url: null,
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
    }
    tagsInput.value = ''
    fileFormatsInput.value = ''
    softwareRequiredInput.value = ''
    uploadedFileName.value = ''
    uploadedFileSize.value = 0
  }
})
</script>
