<template>
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
    <div v-if="props.product.download_files?.length" class="mt-6">
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <div class="flex items-center">
          <Icon name="heroicons:document-check" class="w-8 h-8 text-green-600 mr-3" />
          <div class="flex-1">
            <p class="font-medium text-green-800">File uploaded successfully!</p>
            <button
              @click="previewFile"
              class="text-sm text-green-600 hover:text-green-800 hover:underline cursor-pointer"
            >
              {{ uploadedFileName }}
            </button>
            <p class="text-xs text-green-500 mt-1" v-if="uploadedFileSize > 0">Size: {{ formatFileSize(uploadedFileSize) }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              type="button"
              @click="previewFile"
              class="text-green-600 hover:text-green-800 p-1"
              title="Preview file"
            >
              <Icon name="heroicons:eye" class="w-5 h-5" />
            </button>
            <button
              type="button"
              @click="removeUploadedFile"
              class="text-red-600 hover:text-red-800 p-1"
              title="Remove file"
            >
              <Icon name="heroicons:trash" class="w-5 h-5" />
            </button>
          </div>
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

    <!-- File Preview Modal -->
    <FilePreviewModal
      :is-open="showPreviewModal"
      :file-url="previewUrl"
      :file-name="uploadedFileName"
      @close="showPreviewModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import FilePreviewModal from './FilePreviewModal.vue'

interface Props {
  product: any
  isUploading: boolean
  uploadProgress: number
  uploadedFileName: string
  uploadedFileSize: number
}

interface Emits {
  (e: 'update:product', value: any): void
  (e: 'upload-file', file: File): void
  (e: 'remove-file'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Modal state
const showPreviewModal = ref(false)
const previewUrl = ref('')

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('upload-file', file)
  }
  // Reset file input
  target.value = ''
}

const removeUploadedFile = () => {
  emit('remove-file')
}

const previewFile = async () => {
  if (!props.product.download_files?.length) return
  
  try {
    // Get the file path from product data
    const filePath = props.product.download_files[0]
    
    // Use Supabase client to get the public URL
    const supabase = useSupabaseClient()
    const { data } = supabase.storage
      .from('Miracute-templates')
      .getPublicUrl(filePath)
    
    if (data?.publicUrl) {
      // Set preview URL and show modal
      previewUrl.value = data.publicUrl
      showPreviewModal.value = true
    } else {
      // Fallback: try to construct the URL manually or show an error
      useToast().error('Unable to preview file')
    }
  } catch (error) {
    console.error('Error previewing file:', error)
    useToast().error('Failed to preview file')
  }
}
</script>