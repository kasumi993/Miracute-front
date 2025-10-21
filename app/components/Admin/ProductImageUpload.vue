<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <h2 class="text-xl font-semibold text-gray-900 mb-6">Product Media</h2>
    <p class="text-gray-600 mb-4">Upload images and an optional video to showcase your template. Drag and drop images to reorder - the first image will be used as the main thumbnail.</p>

    <!-- Images and Video Section -->
    <div class="mb-4">
      <h3 class="text-lg font-medium text-gray-900 mb-3">Product Media</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
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
          @click.prevent.stop="openPreview(image, $event, 'image')"
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

        <!-- Video Slot -->
        <div class="relative group bg-gray-50 rounded-lg border-2 border-dashed border-gray-200  hover:border-brand-brown overflow-hidden" style="aspect-ratio: 4/3">
          <!-- Video Preview -->
          <div v-if="videoUrl" class="relative w-full h-full cursor-pointer" @click.prevent.stop="openPreview(videoUrl, $event, 'video')">
            <video
              :src="videoUrl"
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              preload="metadata"
              muted
            >
              Your browser does not support the video tag.
            </video>

            <!-- Play Overlay -->
            <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition-all">
              <div class="bg-white bg-opacity-90 rounded-full p-3 hover:bg-opacity-100 transition-all">
                <Icon name="heroicons:play" class="w-6 h-6 text-gray-800" />
              </div>
            </div>

            <!-- Delete Button -->
            <button
              type="button"
              @click.prevent.stop="removeVideoWithConfirmation"
              class="absolute top-2 right-2 z-10 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
              title="Remove video"
            >
              <Icon name="heroicons:x-mark" class="w-4 h-4" />
            </button>

            <!-- Video Badge -->
            <div class="absolute top-3 left-3">
              <span class="bg-purple-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
                <Icon name="heroicons:play" class="w-3 h-3 mr-1" />
                Video
              </span>
            </div>
          </div>

          <!-- Video Upload Placeholder -->
          <div
            v-else
            class="flex flex-col items-center justify-center cursor-pointer hover:border-brand-brown hover:bg-gray-100 transition-colors"
            @click="triggerVideoInput"
            @drop="onVideosDrop"
            @dragover.prevent
            @dragenter.prevent
          >
            <Icon name="heroicons:play" class="w-12 h-12 text-gray-400 mb-3" />
            <p class="text-sm text-gray-500 text-center px-4 mb-1 font-medium">
              Add video
            </p>
            <p class="text-xs text-gray-400 text-center px-4">
              MP4, WebM (max 50MB)
            </p>
          </div>
        </div>

        <!-- Upload Placeholder -->
        <div class="relative bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 hover:border-brand-brown hover:bg-gray-100 transition-colors cursor-pointer flex flex-col items-center justify-center"
          v-if="images.length < maxImages"
          style="aspect-ratio: 4/3"
          @click="triggerImageInput"
          @drop="onImagesDrop"
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
      </div>

      <!-- Hidden File Inputs -->
      <input
        ref="imageInputRef"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif,image/avif,video/mp4,video/webm,video/ogg"
        class="hidden"
        @change="onImageSelect"
      />

      <input
        ref="videoInputRef"
        type="file"
        accept="video/mp4,video/webm,video/ogg"
        class="hidden"
        @change="onVideoSelect"
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
      <p class="text-sm text-gray-600 mt-1">Uploading images... {{ Math.round(uploadProgress) }}%</p>
    </div>
    
    <!-- Upload Guidelines -->
    <div class="text-sm text-gray-500 space-y-1">
      <p class="font-medium text-gray-700">Media Guidelines:</p>
      <p>• Maximum 10 images + 1 video</p>
      <p>• Images: JPG, PNG, WebP, SVG, GIF, AVIF (max 10MB each)</p>
      <p>• Video: MP4, WebM, OGG (max 50MB, under 2 minutes recommended)</p>
      <p>• Drag and drop to reorder images • Click to preview • First image is the main thumbnail</p>
      <p>• Upload videos and images together - they'll be automatically sorted</p>
    </div>
    
    <!-- Media Preview Modal -->
    <Teleport to="body">
      <div v-if="previewImage || previewVideo" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" @click="closePreview">
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
            v-if="previewType === 'image' && previewImage"
            :src="previewImage"
            alt="Image preview"
            class="w-full h-full object-contain rounded-lg bg-gray-100"
            @click.stop
          />

          <!-- Preview Video -->
          <video
            v-if="previewType === 'video' && previewVideo"
            :src="previewVideo"
            class="w-full h-full object-contain rounded-lg bg-gray-100"
            controls
            autoplay
            @click.stop
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <UIConfirmationModal
      :is-open="showDeleteModal"
      :title="deleteModalTitle"
      :message="deleteModalMessage"
      confirm-text="Delete"
      cancel-text="Cancel"
      variant="danger"
      @confirm="deleteType === 'image' ? confirmRemoveImage() : confirmRemoveVideo()"
      @cancel="cancelDelete"
      @close="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  images: string[]
  videoUrl?: string
  maxImages?: number
  isUploading?: boolean
  uploadProgress?: number
}

interface Emits {
  (e: 'update:images', images: string[]): void
  (e: 'update:video', videoUrl: string | null): void
  (e: 'upload-images', files: FileList): void
  (e: 'upload-video', files: FileList): void
}

const props = withDefaults(defineProps<Props>(), {
  maxImages: 10,
  isUploading: false,
  uploadProgress: 0
})

const emit = defineEmits<Emits>()

const imageInputRef = ref<HTMLInputElement>()
const videoInputRef = ref<HTMLInputElement>()
const previewImage = ref<string | null>(null)
const previewVideo = ref<string | null>(null)
const previewType = ref<'image' | 'video'>('image')
const draggedIndex = ref<number | null>(null)

// Delete confirmation modal state
const showDeleteModal = ref(false)
const deleteType = ref<'image' | 'video'>('image')
const deleteIndex = ref<number | null>(null)


// Image upload functions
const triggerImageInput = () => {
  imageInputRef.value?.click()
}

const onImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleImageFiles(target.files)
  }
}

// Video upload functions
const triggerVideoInput = () => {
  videoInputRef.value?.click()
}

const onVideoSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleVideoFiles(target.files)
  }
}


// Media preview functions
const openPreview = (mediaUrl: string, event?: Event, type: 'image' | 'video' = 'image') => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
  }
  previewType.value = type
  if (type === 'image') {
    previewImage.value = mediaUrl
  } else {
    previewVideo.value = mediaUrl
  }
}

const closePreview = () => {
  previewImage.value = null
  previewVideo.value = null
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
    if (draggedImage) {
      newImages.splice(targetIndex, 0, draggedImage)
      emit('update:images', newImages)
    }
  }
  draggedIndex.value = null
}

// File drop for upload

// Handle mixed image and video files
const handleImageFiles = (files: FileList) => {
  const filesToProcess = Array.from(files)
  const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif', 'image/avif']
  const videoTypes = ['video/mp4', 'video/webm', 'video/ogg']

  const imageFiles: File[] = []
  const videoFiles: File[] = []

  // Separate images and videos
  filesToProcess.forEach(file => {
    if (imageTypes.includes(file.type)) {
      imageFiles.push(file)
    } else if (videoTypes.includes(file.type)) {
      videoFiles.push(file)
    } else {
      useToast().error(`${file.name} is not a supported format`)
    }
  })

  // Handle video files (only one allowed)
  if (videoFiles.length > 0) {
    if (props.videoUrl) {
      useToast().warning('Only one video per product is allowed. Remove existing video first.')
    } else if (videoFiles.length > 1) {
      useToast().warning('Only one video can be uploaded. Using the first video file.')
      const firstVideo = videoFiles[0]
      if (firstVideo) {
        const videoFileList = new DataTransfer()
        videoFileList.items.add(firstVideo)
        handleVideoFiles(videoFileList.files)
      }
    } else {
      const firstVideo = videoFiles[0]
      if (firstVideo) {
        const fileList = new DataTransfer()
        fileList.items.add(firstVideo)
        handleVideoFiles(fileList.files)
      }
    }
  }

  // Handle image files
  if (imageFiles.length > 0) {
    const remainingSlots = props.maxImages - props.images.length
    if (remainingSlots <= 0) {
      useToast().warning(`Maximum ${props.maxImages} images allowed`)
      return
    }

    const validImageFiles = imageFiles.slice(0, remainingSlots).filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        useToast().error(`${file.name} is too large (max 10MB)`)
        return false
      }
      return true
    })

    if (validImageFiles.length > 0) {
      const fileList = new DataTransfer()
      validImageFiles.forEach(file => fileList.items.add(file))
      emit('upload-images', fileList.files)
    }
  }
}

const handleVideoFiles = (files: FileList) => {
  if (props.videoUrl) {
    useToast().warning('Only one video per product is allowed. Remove existing video first.')
    return
  }

  if (!files || files.length === 0) return

  const file = files[0] // Only take first video file
  if (!file) return

  const videoTypes = ['video/mp4', 'video/webm', 'video/ogg']

  if (!videoTypes.includes(file.type)) {
    useToast().error(`${file.name} is not a valid video format`)
    return
  }

  if (file.size > 50 * 1024 * 1024) {
    useToast().error(`${file.name} is too large (max 50MB)`)
    return
  }

  const fileList = new DataTransfer()
  fileList.items.add(file)
  emit('upload-video', fileList.files)
}

// Drag and drop handlers
const onImagesDrop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer?.files) {
    handleImageFiles(event.dataTransfer.files)
  }
}

const onVideosDrop = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer?.files) {
    handleVideoFiles(event.dataTransfer.files)
  }
}

const removeImage = (index: number, event?: Event) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
  }
  deleteType.value = 'image'
  deleteIndex.value = index
  showDeleteModal.value = true
}

const confirmRemoveImage = () => {
  if (deleteIndex.value !== null) {
    const newImages = [...props.images]
    newImages.splice(deleteIndex.value, 1)
    emit('update:images', newImages)
  }
  cancelDelete()
}

const removeVideoWithConfirmation = (event?: Event) => {
  if (event) {
    event.preventDefault()
    event.stopPropagation()
    event.stopImmediatePropagation()
  }
  deleteType.value = 'video'
  showDeleteModal.value = true
}

const confirmRemoveVideo = () => {
  emit('update:video', null)
  cancelDelete()
}

const cancelDelete = () => {
  showDeleteModal.value = false
  deleteType.value = 'image'
  deleteIndex.value = null
}

// Computed properties for modal content
const deleteModalTitle = computed(() => {
  return deleteType.value === 'image' ? 'Delete Image?' : 'Delete Video?'
})

const deleteModalMessage = computed(() => {
  if (deleteType.value === 'image') {
    return `Are you sure you want to delete this image? This action cannot be undone.`
  } else {
    return `Are you sure you want to delete this video? This action cannot be undone.`
  }
})

</script>