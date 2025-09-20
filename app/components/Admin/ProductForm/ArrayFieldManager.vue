<template>
  <div>
    <label class="form-label">{{ label }}</label>
    <div class="space-y-2">
      <div v-for="(item, index) in modelValue" :key="index" class="flex space-x-2">
        <Input
          :model-value="item"
          @update:model-value="updateItem(index, $event)"
          :placeholder="placeholder"
          class="flex-1"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          @click="removeItem(index)"
        >
          <Icon name="heroicons:x-mark" class="w-4 h-4" />
        </Button>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        @click="addItem"
        class="w-full border-2 border-dashed border-gray-300 hover:border-gray-400"
      >
        <Icon name="heroicons:plus" class="w-4 h-4 mr-2" />
        {{ addButtonText }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string[]
  label: string
  placeholder: string
  addButtonText: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const updateItem = (index: number, value: string) => {
  const newArray = [...props.modelValue]
  newArray[index] = value
  emit('update:modelValue', newArray)
}

const addItem = () => {
  emit('update:modelValue', [...props.modelValue, ''])
}

const removeItem = (index: number) => {
  const newArray = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', newArray)
}
</script>