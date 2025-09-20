interface Product {
  id?: string
  name: string
  slug?: string
  category_id: string
  price: string
  compare_at_price?: string
  short_description?: string
  description?: string
  status: 'draft' | 'active' | 'archived'
  thumbnail_url?: string
  preview_images: string[]
  download_url?: string
  file_formats: string[]
  software_required: string[]
  tags: string[]
  difficulty_level?: string
  file_size?: string
  dimensions?: string
  seo_title?: string
  seo_description?: string
  meta_keywords: string[]
  is_featured: boolean
  is_digital: boolean
}

export const useProductForm = (initialProduct?: Product | null) => {
  const form = reactive<Product>({
    name: '',
    category_id: '',
    price: '',
    compare_at_price: '',
    short_description: '',
    description: '',
    status: 'draft',
    thumbnail_url: '',
    preview_images: [''],
    download_url: '',
    file_formats: [''],
    software_required: [''],
    tags: [''],
    difficulty_level: '',
    file_size: '',
    dimensions: '',
    seo_title: '',
    seo_description: '',
    meta_keywords: [''],
    is_featured: false,
    is_digital: true
  })

  const errors = ref<Record<string, string>>({})
  const isLoading = ref(false)
  const isDraftLoading = ref(false)

  // Initialize form with product data
  if (initialProduct) {
    Object.assign(form, {
      ...initialProduct,
      preview_images: initialProduct.preview_images?.length ? initialProduct.preview_images : [''],
      file_formats: initialProduct.file_formats?.length ? initialProduct.file_formats : [''],
      software_required: initialProduct.software_required?.length ? initialProduct.software_required : [''],
      tags: initialProduct.tags?.length ? initialProduct.tags : [''],
      meta_keywords: initialProduct.meta_keywords?.length ? initialProduct.meta_keywords : ['']
    })
  }

  // Computed
  const isFormValid = computed(() => {
    return form.name && form.category_id && form.price && parseFloat(form.price) >= 0
  })

  // Auto-generate slug from name
  watch(() => form.name, (newName) => {
    if (!initialProduct && newName) {
      form.slug = newName.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')
    }
  })

  const validateForm = () => {
    errors.value = {}

    if (!form.name) {
      errors.value.name = 'Product name is required'
    }
    if (!form.category_id) {
      errors.value.category_id = 'Category is required'
    }
    if (!form.price) {
      errors.value.price = 'Price is required'
    } else if (parseFloat(form.price) < 0) {
      errors.value.price = 'Price must be positive'
    }

    if (form.compare_at_price && parseFloat(form.compare_at_price) <= parseFloat(form.price)) {
      errors.value.compare_at_price = 'Compare price must be higher than regular price'
    }

    return Object.keys(errors.value).length === 0
  }

  const cleanFormData = () => {
    const cleanedForm = { ...form }
    cleanedForm.preview_images = form.preview_images.filter(img => img.trim())
    cleanedForm.file_formats = form.file_formats.filter(format => format.trim())
    cleanedForm.software_required = form.software_required.filter(software => software.trim())
    cleanedForm.tags = form.tags.filter(tag => tag.trim())
    cleanedForm.meta_keywords = form.meta_keywords.filter(keyword => keyword.trim())

    return cleanedForm
  }

  return {
    form,
    errors,
    isLoading,
    isDraftLoading,
    isFormValid,
    validateForm,
    cleanFormData
  }
}
