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
            :tags-input="tagsInput"
            @update:product="product = $event"
            @update:tags-input="tagsInput = $event"
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

const loadProduct = async (productId) => {
  isInitialLoading.value = true
  
  try {
    const response = await $fetch(`/api/admin/products/${productId}`)

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
      templateType: data.templateType || 'canva',
      preview_images: data.preview_images || [],
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
    
    let data, error
    
    if (isEditing.value) {
      // Update existing product
      const updateData = { ...product.value }
      delete updateData.id // Remove ID from update data
      
      ({ data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', editProductId.value)
        .select()
        .single())
        
      if (error) throw error
      useToast().success('Template updated successfully!')
    } else {
      // Create new product
      ({ data, error } = await supabase
        .from('products')
        .insert([product.value])
        .select()
        .single())
        
      if (error) throw error
      useToast().success('Template created successfully!')
    }

    await router.push(`/dashboard/products`)
  } catch (error) {
    console.error('Error saving product:', error)
    useToast().error(`Failed to ${isEditing.value ? 'update' : 'create'} template. Please try again.`)
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
  try {
    // Always load categories first
    await loadCategories()
    
    // Check if we're editing an existing product
    const editId = route.query.edit
    if (editId) {
      isEditing.value = true
      editProductId.value = editId
      await loadProduct(editId)
    }
  } catch (error) {
    console.error('Error during initialization:', error)
    useToast().error('Failed to initialize page')
  }
})

// Watch for name changes to suggest SEO title
watch(() => product.value.name, (newName) => {
  if (!product.value.seo_title) {
    product.value.seo_title = newName
  }
})

// Watch for route changes (in case user navigates from create to edit or vice versa)
watch(() => route.query.edit, async (editId) => {
  if (editId && editId !== editProductId.value) {
    console.log('Route changed to edit product:', editId)
    isEditing.value = true
    editProductId.value = editId
    await loadProduct(editId)
  } else if (!editId && isEditing.value) {
    console.log('Route changed to create mode')
    isEditing.value = false
    editProductId.value = null
    // Reset form to empty state
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
