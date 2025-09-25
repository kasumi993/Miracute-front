import { requireAdminAuthentication } from '../../../utils/auth'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  // Use service role to bypass RLS
  const { supabase } = await requireAdminAuthentication(event)

  const sampleCategories = [
    {
      name: 'Wedding Templates',
      slug: 'wedding-templates',
      description: 'Beautiful wedding website templates for your special day. Complete packages with invitation designs, RSVP pages, and more.',
      sort_order: 1,
      is_active: true
    },
    {
      name: 'Business Templates',
      slug: 'business-templates',
      description: 'Professional website templates for businesses, startups, and entrepreneurs. Perfect for coaches, consultants, and service providers.',
      sort_order: 2,
      is_active: true
    },
    {
      name: 'Therapist Templates',
      slug: 'therapist-templates',
      description: 'Calming and professional website templates designed specifically for therapists, counselors, and wellness professionals.',
      sort_order: 3,
      is_active: true
    },
    {
      name: 'Portfolio Templates',
      slug: 'portfolio-templates',
      description: 'Creative portfolio templates for artists, designers, photographers, and creative professionals to showcase their work.',
      sort_order: 4,
      is_active: true
    },
    {
      name: 'Canva Templates',
      slug: 'canva-templates',
      description: 'Ready-to-use Canva templates that work with the free version. Easy to customize and download instantly.',
      sort_order: 5,
      is_active: true
    }
  ]

  try {
    const { data, error } = await supabase
      .from('categories')
      .insert(sampleCategories)
      .select()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create sample categories',
        data: error
      })
    }

    return {
      success: true,
      data,
      message: 'Sample categories created successfully'
    }

  } catch (error: any) {
    console.error('Error creating sample categories:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create sample categories',
      data: error
    })
  }
})
