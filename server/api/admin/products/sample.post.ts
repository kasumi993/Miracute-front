import { validateAdminAccess } from '../../../utils/adminAuth'
import type { Database } from '~/types/database'

export default defineEventHandler(async (event) => {
  const { supabase } = await validateAdminAccess(event)

  // Parse query to see if we should clear existing data
  const query = getQuery(event)
  const clearExisting = query.clear === 'true'

  // Clear existing products if requested
  if (clearExisting) {
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteError) {
      console.log('Warning: Could not clear existing products:', deleteError)
    }
  }

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

  // Generate more products for pagination testing
  const templateNames = [
    'Modern Business Card Collection', 'Instagram Story Templates Pack', 'Wedding Invitation Suite',
    'Professional Resume Template', 'Social Media Quote Templates', 'Minimalist Logo Design Kit',
    'E-commerce Banner Bundle', 'Newsletter Email Templates', 'Real Estate Flyer Pack',
    'Food Menu Design Templates', 'Fitness Poster Collection', 'Travel Brochure Templates',
    'Corporate Presentation Pack', 'Birthday Invitation Set', 'Holiday Greeting Cards',
    'Blog Graphics Bundle', 'Podcast Cover Templates', 'YouTube Thumbnail Pack',
    'Pinterest Pin Templates', 'Facebook Ad Templates', 'LinkedIn Banner Set',
    'Conference Poster Templates', 'Fashion Lookbook Design', 'Photography Price List',
    'Spa Treatment Menu', 'Coffee Shop Branding Kit', 'Tech Startup Pitch Deck',
    'Wellness Workshop Flyer', 'Children Birthday Invites', 'Graduation Announcement Pack',
    'Mother\'s Day Cards Bundle', 'Father\'s Day Gift Tags', 'Christmas Party Invites',
    'New Year Social Posts', 'Valentine\'s Day Templates', 'Easter Greeting Cards',
    'Summer Sale Banners', 'Back to School Pack', 'Halloween Costume Contest',
    'Thanksgiving Dinner Menu', 'Black Friday Sale Kit', 'Cyber Monday Banners',
    'Winter Holiday Cards', 'Spring Cleaning Flyers', 'Beach Party Invitations',
    'Baby Shower Templates', 'Bridal Shower Pack', 'Retirement Party Kit',
    'Housewarming Invites', 'Art Gallery Exhibition', 'Music Festival Poster',
    'Book Club Meeting Flyer', 'Yoga Class Schedule', 'Cooking Class Menu',
    'Garden Party Invitations', 'Wine Tasting Event', 'Charity Fundraiser Kit',
    'School Fundraiser Pack', 'Community Event Flyer', 'Local Business Promo',
    'Health Fair Banner', 'Job Fair Poster', 'Career Workshop Flyer'
  ]

  const categoryKeys = Object.keys(categoryMap)
  const templateTypes = ['canva', 'photoshop', 'figma', 'illustrator']
  const difficulties = ['beginner', 'intermediate', 'advanced']
  const unsplashImages = [
    'https://images.unsplash.com/photo-1618044619888-009e412ff12a?w=400',
    'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400',
    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400',
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
    'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400'
  ]

  const sampleProducts = templateNames.map((name, index) => {
    const randomCategory = categoryKeys[Math.floor(Math.random() * categoryKeys.length)]
    const price = (Math.random() * 50 + 15).toFixed(2) // Between $15-65
    const isActive = Math.random() > 0.1 // 90% active
    const isFeatured = Math.random() > 0.7 // 30% featured
    const templateType = templateTypes[Math.floor(Math.random() * templateTypes.length)]
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]

    return {
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      description: `Professional ${name.toLowerCase()} perfect for businesses and individuals. Features modern design and easy customization. Includes multiple variations and color schemes.`,
      short_description: `Professional ${name.toLowerCase().substring(0, 50)}...`,
      price: parseFloat(price),
      compare_at_price: Math.random() > 0.5 ? parseFloat((parseFloat(price) * 1.5).toFixed(2)) : null,
      category_id: categoryMap[randomCategory],
      template_type: templateType,
      tags: [`${templateType}`, 'professional', 'modern', 'customizable'],
      software_required: templateType === 'canva' ? ['Canva'] : ['Canva', 'Photoshop'],
      difficulty_level: difficulty,
      file_size: `${Math.floor(Math.random() * 40 + 5)} MB`,
      file_formats: templateType === 'canva' ? ['CANVA'] : ['PSD', 'AI', 'PDF'],
      preview_images: [
        unsplashImages[Math.floor(Math.random() * unsplashImages.length)],
        unsplashImages[Math.floor(Math.random() * unsplashImages.length)]
      ],
      download_files: [`${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.zip`],
      is_featured: isFeatured,
      is_active: isActive,
      view_count: Math.floor(Math.random() * 500),
      download_count: Math.floor(Math.random() * 50),
      stock_quantity: null
    }
  })

  // Add the original high-quality samples
  const premiumSamples = [
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
      download_count: 31
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
      download_count: 18
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
      download_count: 45
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
      download_count: 67
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
      download_count: 29
    }
  ]

  // Combine generated products with premium samples
  const allProducts = [...sampleProducts, ...premiumSamples]

  try {
    const { data, error } = await supabase
      .from('products')
      .insert(allProducts)
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
      message: `${allProducts.length} sample products created successfully`
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
