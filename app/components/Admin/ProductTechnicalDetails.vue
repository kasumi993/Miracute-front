<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <h2 class="text-xl font-semibold text-gray-900 mb-6">Technical Details</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- File Formats -->
      <div>
        <label for="fileFormats" class="form-label">File Formats Included *</label>
        <input
          id="fileFormats"
          :value="fileFormatsInput"
          @input="updateFileFormatsInput(($event.target as HTMLInputElement).value)"
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
          :value="product.file_size"
          @input="updateProduct('file_size', ($event.target as HTMLInputElement).value)"
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
          :value="product.dimensions"
          @input="updateProduct('dimensions', ($event.target as HTMLInputElement).value)"
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
          :value="softwareRequiredInput"
          @input="updateSoftwareRequiredInput(($event.target as HTMLInputElement).value)"
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
          :value="product.difficulty_level"
          @change="updateProduct('difficulty_level', ($event.target as HTMLSelectElement).value)"
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
</template>

<script setup lang="ts">
interface Props {
  product: any
  fileFormatsInput: string
  softwareRequiredInput: string
}

interface Emits {
  (e: 'update:product', value: any): void
  (e: 'update:fileFormatsInput', value: string): void
  (e: 'update:softwareRequiredInput', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Helper functions to update specific fields
const updateProduct = (field: string, value: any) => {
  const updatedProduct = { ...props.product, [field]: value }
  emit('update:product', updatedProduct)
}

const updateFileFormatsInput = (value: string) => {
  emit('update:fileFormatsInput', value)
}

const updateSoftwareRequiredInput = (value: string) => {
  emit('update:softwareRequiredInput', value)
}
</script>