import { serverSupabaseServiceRole } from '#supabase/server'
import type { Database } from '~/app/types/database'

export default defineEventHandler(async (event) => {
  console.log('Create user profile API called')
  
  const supabase = serverSupabaseServiceRole<Database>(event)
  const body = await readBody(event)
  
  console.log('Request body:', body)
  
  if (!body.user_id || !body.email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID and email are required'
    })
  }
  
  // Check if the user is actually verified in auth.users
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(body.user_id)
  
  if (authError || !authUser.user) {
    console.error('Auth user not found:', authError)
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user ID'
    })
  }
  
  // Only create profile for users with verified emails
  if (!authUser.user.email_confirmed_at) {
    console.log('User email not verified yet, skipping profile creation')
    return {
      success: true,
      message: 'User email not verified yet, profile creation skipped',
      user_id: body.user_id
    }
  }
  
  try {
    // Check if user already exists in custom users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', body.user_id)
      .single()
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError)
      throw checkError
    }
    
    if (existingUser) {
      console.log('User already exists in custom table:', existingUser.id)
      return {
        success: true,
        message: 'User profile already exists',
        user_id: existingUser.id
      }
    }
    
    // Create user profile in custom table
    console.log('Creating new user profile for:', body.user_id)
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: body.user_id,
        email: body.email,
        first_name: body.first_name || null,
        last_name: body.last_name || null,
        avatar_url: body.avatar_url || null,
        role: 'customer',
        country: null
      })
      .select()
      .single()
    
    if (insertError) {
      console.error('Error creating user profile:', insertError)
      throw insertError
    }
    
    console.log('User profile created successfully:', newUser)
    
    return {
      success: true,
      message: 'User profile created successfully',
      user: newUser
    }
    
  } catch (error: any) {
    console.error('Error in create user profile API:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create user profile'
    })
  }
})