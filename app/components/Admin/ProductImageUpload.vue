<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <h2 class="text-xl font-semibold text-gray-900 mb-6">Product Images</h2>
    <p class="text-gray-600 mb-4">Upload up to 10 high-quality images that showcase your template. Drag and drop to reorder - the first image will be used as the main thumbnail.</p>
    
    <!-- Image Upload Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
      <!-- Existing Images -->
      <div
        v-for="(image, index) in images"
        :key="`image-${index}`"
        class="relative group bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 overflow-hidden"
        style="aspect-ratio: 4/3"
        draggable="true"
        @dragstart="onDragStart($event, index)"
        @dragover="onDragOver"
        @drop="onDrop($event, index)"
      >
        <img
          :src="image"
          :alt="`Product image ${index + 1}`"
          class="w-full h-full object-cover hover:scale-105 transition-transform duration-200 cursor-pointer"
          @click.prevent.stop="openPreview(image, $event)"
        />
        
        <!-- Delete Button -->
        <button
          type="button"
          @click.prevent.stop="removeImage(index, $event)"
          class="absolute top-2 right-2 z-10 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
          title="Remove image"
        >
          <Icon name="heroicons:x-mark" class="w-4 h-4" />
        </button>
        
        <!-- Main Image Badge -->
        <div v-if="index === 0" class="absolute top-3 left-3">
          <span class="bg-brand-brown text-white text-xs px-2 py-1 rounded-full">
            Main
          </span>
        </div>
        
        <!-- Drag Handle -->
        <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Icon name="heroicons:bars-3" class="w-5 h-5 text-white bg-black/50 rounded p-1" />
        </div>
      </div>
      
      <!-- Upload Placeholder -->
      <div
        v-if="images.length < maxImages"
        class="relative bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-brand-brown hover:bg-gray-100 transition-colors cursor-pointer flex flex-col items-center justify-center"
        style="aspect-ratio: 4/3"
        @click="triggerFileInput"
        @drop="onFilesDrop"
        @dragover.prevent
        @dragenter.prevent
      >
        <Icon name="heroicons:plus" class="w-12 h-12 text-gray-400 mb-3" />
        <p class="text-sm text-gray-500 text-center px-4 mb-1 font-medium">
          {{ images.length === 0 ? 'Add main image' : 'Add image' }}
        </p>
        <p class="text-xs text-gray-400 text-center px-4">
          Drag & drop or click
        </p>
      </div>
      
      <!-- Hidden File Input -->
      <input
        ref="fileInputRef"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif,image/avif,video/mp4,video/webm,video/ogg"
        class="hidden"
        @change="onFileSelect"
      />
    </div>
    
    <!-- Upload Progress -->
    <div v-if="isUploading" class="mb-4">
      <div class="bg-gray-200 rounded-full h-2">
        <div
          class="bg-brand-brown h-2 rounded-full transition-all duration-300"
          :style="{ width: `${uploadProgress}%` }"
        ></div>
      </div>
      <p class="text-sm text-gray-600 mt-1">Uploading images... {{ uploadProgress }}%</p>
    </div>
    
    <!-- Upload Guidelines -->
    <div class="text-sm text-gray-500 space-y-1">
      <p>• Maximum 10 images or videos</p>
      <p>• Recommended size: 1200x800 pixels or larger</p>
      <p>• Formats: JPG, PNG, WebP, SVG, GIF, AVIF, MP4, WebM, OGG (max 10MB each)</p>
      <p>• Drag and drop to reorder • Click to preview • First image is the main thumbnail • Images saved in display order</p>
    </div>
    
    <!-- Image Preview Modal -->
    <Teleport to="body">
      <div v-if="previewImage" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" @click="closePreview">
        <div class="relative w-[800px] h-[600px] p-6" @click.stop>
          <!-- Close Button -->
          <button
            @click.stop="closePreview"
            class="absolute top-2 right-2 z-10 bg-white/90 text-gray-700 p-2 rounded-full hover:bg-white transition-colors"
          >
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
          
          <!-- Preview Image -->
          <img
            :src="previewImage"
            alt="Image preview"
            class="w-full h-full object-contain rounded-lg bg-gray-100"
            @click.stop
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
interface Props {
  images: string[]
  maxImages?: number
  isUploading?: boolean
  uploadProgress?: number
}

interface Emits {
  (e: 'update:images', images: string[]): void
  (e: 'upload-images', files: FileList): void
}

const props = withDefaults(defineProps<Props>(), {
  maxImages: 10,
  isUploading: false,
  uploadProgress: 0
})

const emit = defineEmits<Emits>()

const fileInputRef = ref<HTMLInputElement>()
const previewImage = ref<string | null>(null)
const draggedIndex = ref<number | null>(null)

// Allowed file types for validation
const allowedTypes = [
  'image/jpeg',
  'image/png', 
  'image/webp',
  'image/svg+xml',
  'image/gif',
  'image/avif',
  'video/mp4',
  'video/webm',
  'video/ogg'
]

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const onFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleFiles(target.files)
  }
}

// Image preview functions
const openPreview = (imageUrl: string, event?: Event) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
  }
  previewImage.value = imageUrl
}

const closePreview = () => {
  previewImage.value = null
}

// Drag and drop for reordering
const onDragStart = (event: DragEvent, index: number) => {
  draggedIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/html', '')
  }
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDrop = (event: DragEvent, targetIndex: number) => {
  event.preventDefault()
  if (draggedIndex.value !== null && draggedIndex.value !== targetIndex) {
    const newImages = [...props.images]
    const draggedImage = newImages.splice(draggedIndex.value, 1)[0]
    newImages.splice(targetIndex, 0, draggedImage)
    emit('update:images', newImages)
  }
  draggedIndex.value = null
}

// File drop for upload
const onFilesDrop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer?.files) {
    handleFiles(event.dataTransfer.files)
  }
}

const handleFiles = (files: FileList) => {
  const remainingSlots = props.maxImages - props.images.length
  if (remainingSlots <= 0) {
    useToast().warning(`Maximum ${props.maxImages} images allowed`)
    return
  }
  
  const filesToUpload = Array.from(files).slice(0, remainingSlots)
  
  // Validate files
  const validFiles = filesToUpload.filter(file => {
    if (!allowedTypes.includes(file.type)) {
      useToast().error(`${file.name} has an unsupported file type`)
      return false
    }
    if (file.size > 10 * 1024 * 1024) {
      useToast().error(`${file.name} is too large (max 10MB)`)
      return false
    }
    return true
  })
  
  if (validFiles.length > 0) {
    const fileList = new DataTransfer()
    validFiles.forEach(file => fileList.items.add(file))
    emit('upload-images', fileList.files)
  }
}

const removeImage = (index: number, event?: Event) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
  }
  const newImages = [...props.images]
  newImages.splice(index, 1)
  emit('update:images', newImages)
}

</script>