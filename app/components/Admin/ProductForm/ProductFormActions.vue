<template>
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
        @click="$emit('save-draft')"
        :loading="isDraftLoading"
      >
        Save as Draft
      </Button>

      <Button
        type="submit"
        :loading="isLoading"
        :disabled="!isFormValid"
      >
        {{ isEditing ? 'Update Product' : 'Create Product' }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isLoading: boolean
  isDraftLoading: boolean
  isFormValid: boolean
  isEditing: boolean
}

defineProps<Props>()
defineEmits<{
  cancel: []
  'save-draft': []
}>()
</script>