import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseServiceRole<Database>(event)

  // First, get the category IDs to use in products
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug')

  if (catError || !categories) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch categories for sample products',
      data: catError
    })
  }

  // Map category slugs to IDs
  const categoryMap: Record<string, string> = {}
  categories.forEach(cat => {
    categoryMap[cat.slug] = cat.id
  })

  const sampleProducts = [
    {
      name: 'Elegant Wedding Invitation Suite',
      slug: 'elegant-wedding-invitation-suite',
      description: 'A beautiful and elegant wedding invitation suite perfect for modern couples. Includes invitation, RSVP card, and details card with romantic typography and minimalist design.',
      short_description: 'Modern elegant wedding invitation suite with romantic typography',
      price: 29.99,
      category_id: categoryMap['wedding-templates'],
      tags: ['wedding', 'invitation', 'elegant', 'modern', 'romantic'],
      software_required: ['Canva', 'Photoshop'],
      difficulty_level: 'beginner',
      file_size: '15 MB',
      file_formats: ['PSD', 'CANVA', 'PDF'],
      preview_images: [
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400',
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400'
      ],
      download_files: ['invitation-suite.zip'],
      is_featured: true,
      is_active: true,
      view_count: 245,
      download_count: 23
    },
    {
      name: 'Professional Business Card Design',
      slug: 'professional-business-card-design',
      description: 'Clean and professional business card design perfect for consultants, coaches, and entrepreneurs. Features modern typography and customizable colors.',
      short_description: 'Clean professional business card with modern typography',
      price: 19.99,
      category_id: categoryMap['business-templates'],
      tags: ['business', 'card', 'professional', 'modern', 'clean'],
      software_required: ['Canva', 'Illustrator'],
      difficulty_level: 'beginner',
      file_size: '8 MB',
      file_formats: ['AI', 'CANVA', 'PDF'],
      preview_images: [
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400',
        'https://images.unsplash.com/photo-1618044619888-009e412ff12a?w=400'
      ],
      download_files: ['business-card.zip'],
      is_featured: true,
      is_active: true,
      view_count: 189,
      download_count: 31,
    },
    {
      name: 'Calming Therapist Website Template',
      slug: 'calming-therapist-website-template',
      description: 'A soothing and professional website template designed specifically for therapists and counselors. Features calming colors and user-friendly layout.',
      short_description: 'Soothing professional website template for therapists',
      price: 49.99,
      category_id: categoryMap['therapist-templates'],
      tags: ['therapist', 'website', 'calm', 'professional', 'healing'],
      software_required: ['Figma', 'HTML/CSS'],
      difficulty_level: 'intermediate',
      file_size: '25 MB',
      file_formats: ['FIGMA', 'HTML', 'CSS'],
      preview_images: [
        'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400'
      ],
      download_files: ['therapist-template.zip'],
      is_featured: false,
      is_active: true,
      view_count: 156,
      download_count: 18,
    },
    {
      name: 'Creative Portfolio Showcase',
      slug: 'creative-portfolio-showcase',
      description: 'A stunning portfolio template perfect for artists, designers, and creative professionals. Features modern grid layout and smooth animations.',
      short_description: 'Stunning portfolio template with modern grid layout',
      price: 39.99,
      category_id: categoryMap['portfolio-templates'],
      tags: ['portfolio', 'creative', 'modern', 'showcase', 'grid'],
      software_required: ['Figma', 'Adobe XD'],
      difficulty_level: 'intermediate',
      file_size: '32 MB',
      file_formats: ['FIGMA', 'XD', 'SKETCH'],
      preview_images: [
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
        'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400'
      ],
      download_files: ['portfolio-template.zip'],
      is_featured: true,
      is_active: true,
      view_count: 298,
      download_count: 45,
    },
    {
      name: 'Social Media Post Bundle',
      slug: 'social-media-post-bundle',
      description: 'Complete social media post bundle with 20+ designs for Instagram, Facebook, and Pinterest. All templates work with Canva free version.',
      short_description: '20+ social media post designs for Instagram, Facebook & Pinterest',
      price: 24.99,
      category_id: categoryMap['canva-templates'],
      tags: ['social media', 'instagram', 'facebook', 'pinterest', 'bundle'],
      software_required: ['Canva'],
      difficulty_level: 'beginner',
      file_size: '45 MB',
      file_formats: ['CANVA'],
      preview_images: [
        'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
        'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400'
      ],
      download_files: ['social-media-bundle.zip'],
      is_featured: false,
      is_active: true,
      view_count: 412,
      download_count: 67,
    },
    {
      name: 'Minimalist Wedding Website',
      slug: 'minimalist-wedding-website',
      description: 'Clean and minimalist wedding website template with all essential pages: home, story, gallery, RSVP, and registry. Perfect for modern couples.',
      short_description: 'Clean minimalist wedding website with essential pages',
      price: 59.99,
      category_id: categoryMap['wedding-templates'],
      tags: ['wedding', 'website', 'minimalist', 'clean', 'modern'],
      software_required: ['Figma', 'HTML/CSS'],
      difficulty_level: 'intermediate',
      file_size: '38 MB',
      file_formats: ['FIGMA', 'HTML', 'CSS'],
      preview_images: [
        'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400',
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400'
      ],
      download_files: ['wedding-website.zip'],
      is_featured: true,
      is_active: true,
      view_count: 324,
      download_count: 29,
    }
  ]

  try {
    const { data, error } = await supabase
      .from('products')
      .insert(sampleProducts)
      .select()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create sample products',
        data: error
      })
    }

    return {
      success: true,
      data,
      message: 'Sample products created successfully'
    }

  } catch (error: any) {
    console.error('Error creating sample products:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create sample products',
      data: error
    })
  }
})