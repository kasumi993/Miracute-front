import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '@/types/database'

export default defineEventHandler(async (event) => {
  console.log('Admin CSV import API called')

  const supabase = serverSupabaseServiceRole<Database>(event)
  const user = await serverSupabaseUser(event)
  const body = await readBody(event)

  console.log('Admin CSV import API: user =', user?.id)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }

  // Check if user is admin
  const { data: userProfile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userProfile?.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required'
    })
  }

  // Validate required fields
  if (!body.csvData || !body.productId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'CSV data and product ID are required'
    })
  }

  try {
    // Parse CSV data (expecting rows with: user_email, rating, title, comment, is_verified_purchase)
    const lines = body.csvData.split('\n').filter((line: string) => line.trim())
    const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase())

    // Validate headers
    const requiredHeaders = ['user_email', 'rating']
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))

    if (missingHeaders.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Missing required headers: ${missingHeaders.join(', ')}`
      })
    }

    const results = {
      total: 0,
      imported: 0,
      skipped: 0,
      errors: [] as string[]
    }

    // Process each data row
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v: string) => v.trim().replace(/"/g, ''))

      if (values.length < headers.length) {
        results.errors.push(`Row ${i + 1}: Invalid CSV format`)
        continue
      }

      results.total++

      try {
        const rowData: any = {}
        headers.forEach((header, index) => {
          rowData[header] = values[index]
        })

        // Validate required fields
        if (!rowData.user_email || !rowData.rating) {
          results.errors.push(`Row ${i + 1}: Missing required fields`)
          continue
        }

        const rating = parseInt(rowData.rating)
        if (isNaN(rating) || rating < 1 || rating > 5) {
          results.errors.push(`Row ${i + 1}: Invalid rating (must be 1-5)`)
          continue
        }

        // Check if user exists
        let userId = null
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', rowData.user_email.toLowerCase())
          .single()

        if (existingUser) {
          userId = existingUser.id
        } else {
          // Create a basic user profile for the email
          const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
              email: rowData.user_email.toLowerCase(),
              role: 'customer'
            })
            .select('id')
            .single()

          if (userError) {
            results.errors.push(`Row ${i + 1}: Failed to create user - ${userError.message}`)
            continue
          }

          userId = newUser.id
        }

        // Check if review already exists
        const { data: existingReview } = await supabase
          .from('product_reviews')
          .select('id')
          .eq('product_id', body.productId)
          .eq('user_id', userId)
          .single()

        if (existingReview) {
          results.skipped++
          continue
        }

        // Create the review with 6-hour edit window
        const now = new Date()
        const editDeadline = new Date(now.getTime() + (6 * 60 * 60 * 1000))

        const { error: reviewError } = await supabase
          .from('product_reviews')
          .insert({
            product_id: body.productId,
            user_id: userId,
            rating,
            title: rowData.title || null,
            comment: rowData.comment || null,
            is_verified_purchase: rowData.is_verified_purchase === 'true' || false,
            is_approved: true,
            is_anonymous: false,
            is_editable: true,
            edit_deadline: editDeadline.toISOString()
          })

        if (reviewError) {
          results.errors.push(`Row ${i + 1}: Failed to create review - ${reviewError.message}`)
          continue
        }

        results.imported++

      } catch (error: any) {
        results.errors.push(`Row ${i + 1}: ${error.message}`)
      }
    }

    return {
      success: true,
      message: `Import completed: ${results.imported} imported, ${results.skipped} skipped, ${results.errors.length} errors`,
      results
    }

  } catch (error: any) {
    console.error('Error in CSV import:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to import CSV data'
    })
  }
})
