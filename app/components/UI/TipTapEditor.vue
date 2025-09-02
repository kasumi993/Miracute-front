<template>
  <div>
    <label v-if="label" class="form-label">{{ label }}</label>
    
    <div v-if="editor" class="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-brand-brown focus-within:border-brand-brown">
      <!-- Toolbar -->
      <div class="flex items-center space-x-1 px-3 py-2 bg-gray-50 border-b border-gray-200">
        <!-- Bold -->
        <button
          type="button"
          @click="editor.chain().focus().toggleBold().run()"
          :class="[
            'px-3 py-2 rounded font-bold text-sm hover:bg-gray-200 transition-colors',
            editor.isActive('bold') ? 'bg-gray-200 text-brand-brown' : 'text-gray-600'
          ]"
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        
        <!-- Italic -->
        <button
          type="button"
          @click="editor.chain().focus().toggleItalic().run()"
          :class="[
            'px-3 py-2 rounded italic text-sm hover:bg-gray-200 transition-colors',
            editor.isActive('italic') ? 'bg-gray-200 text-brand-brown' : 'text-gray-600'
          ]"
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        
        <!-- Underline -->
        <button
          type="button"
          @click="editor.chain().focus().toggleStrike().run()"
          :class="[
            'px-3 py-2 rounded line-through text-sm hover:bg-gray-200 transition-colors',
            editor.isActive('strike') ? 'bg-gray-200 text-brand-brown' : 'text-gray-600'
          ]"
          title="Strikethrough"
        >
          S
        </button>
        
        <div class="w-px h-6 bg-gray-300 mx-2"></div>
        
        <!-- Bullet List -->
        <button
          type="button"
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="[
            'p-2 rounded hover:bg-gray-200 transition-colors',
            editor.isActive('bulletList') ? 'bg-gray-200 text-brand-brown' : 'text-gray-600'
          ]"
          title="Bullet List"
        >
          <Icon name="heroicons:list-bullet" class="w-4 h-4" />
        </button>
        
        <!-- Numbered List -->
        <button
          type="button"
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="[
            'p-2 rounded hover:bg-gray-200 transition-colors',
            editor.isActive('orderedList') ? 'bg-gray-200 text-brand-brown' : 'text-gray-600'
          ]"
          title="Numbered List"
        >
          <Icon name="heroicons:numbered-list" class="w-4 h-4" />
        </button>
      </div>
      
      <!-- Editor -->
      <EditorContent 
        :editor="editor" 
        :class="[
          'w-full min-h-[200px] p-4 focus:outline-none',
          editorClass
        ]"
      />
    </div>
    
    <p v-if="helpText" class="mt-1 text-sm text-gray-500">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  helpText?: string
  editorClass?: string
  required?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Start writing...'
})

const emit = defineEmits<Emits>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
  ],
  editorProps: {
    attributes: {
      class: 'w-full focus:outline-none',
      style: 'direction: ltr; text-align: left;'
    }
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (editor.value && editor.value.getHTML() !== newValue) {
    editor.value.commands.setContent(newValue, false)
  }
})

// Cleanup
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<style>
/* TipTap specific styles */
.ProseMirror {
  outline: none !important;
  border: none !important;
  direction: ltr;
  text-align: left;
  width: 100%;
  min-height: 200px;
  padding: 0;
  margin: 0;
}

.ProseMirror:focus {
  outline: none !important;
  border: none !important;
  box-shadow: none !important;
}

.ProseMirror p.is-editor-empty:first-child::before {
  color: #9CA3AF;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.ProseMirror ul,
.ProseMirror ol {
  margin-left: 1rem;
  padding-left: 0;
}

.ProseMirror ul {
  list-style-type: disc;
}

.ProseMirror ol {
  list-style-type: decimal;
}

.ProseMirror strong {
  font-weight: bold;
}

.ProseMirror em {
  font-style: italic;
}

.ProseMirror s {
  text-decoration: line-through;
}

/* Remove any default prose styles that might limit width */
.ProseMirror p,
.ProseMirror ul,
.ProseMirror ol,
.ProseMirror h1,
.ProseMirror h2,
.ProseMirror h3 {
  max-width: none !important;
  width: 100%;
}
</style>