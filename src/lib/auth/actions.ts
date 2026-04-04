'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function signIn(formData: FormData) {
  const identifier = formData.get('identifier') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const isEmail = identifier.includes('@')
  const email = isEmail ? identifier : `${identifier}@yanba.com`

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return { error: error.message }
  
  // Log Activity (Fast: uses data already in memory)
  if (data.user) {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'localhost'
    
    await supabase.from('activity_logs').insert({
      user_id: data.user.id,
      action: 'LOGIN',
      description: 'User logged in to partner portal',
      ip_address: ip
    })
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function adminSignIn(formData: FormData) {
  const identifier = formData.get('identifier') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  console.log(`[Admin Login Attempt] Email: ${identifier}`)

  // Admins MUST use email
  if (!identifier.includes('@')) {
    return { error: 'Admin access requires a valid email address.' }
  }

  console.log(`[Admin SignIn] 1. Auth attempt for ${identifier}`);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifier,
    password,
  })

  if (error) {
    console.error(`[Admin SignIn] 2. Auth Failure: ${error.message}`)
    return { error: error.message }
  }

  // Role Verification (Level 1: JWT metadata)
  const appRole = data.user.app_metadata?.role
  const userRole = data.user.user_metadata?.role
  const isMetadataAdmin = appRole === 'admin' || userRole === 'admin'
  
  console.log(`[Admin SignIn] 3. Metadata check: appRole=${appRole}, userRole=${userRole}`)

  if (!isMetadataAdmin) {
    console.warn(`[Admin SignIn] 4. Unauthorized Metadata. Signing out.`)
    await supabase.auth.signOut()
    return { error: 'Unauthorized access. Administrators only.' }
  }

  // Role Verification (Level 2: Isolated admin_profiles table)
  console.log(`[Admin SignIn] 5. Querying admin_profiles for ID: ${data.user.id}`)
  const { data: adminProfile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('id, is_active')
    .eq('id', data.user.id)
    .single()

  if (profileError || !adminProfile || !adminProfile.is_active) {
    console.error(`[Admin SignIn] 6. Admin Profile Not Found/Inactive. Error: ${profileError?.message}`)
    await supabase.auth.signOut()
    return { error: 'Unauthorized access. Access restricted to verified administrators.' }
  }

  console.log(`[Admin SignIn] 7. Success! Redirecting to /admin`)

  console.log(`[Admin Login Success] Admin ${data.user.email} authenticated.`)
  
  // Log Admin Activity
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'localhost'
  await supabase.from('activity_logs').insert({
    user_id: data.user.id,
    action: 'ADMIN_LOGIN',
    description: 'Administrator logged in to portal',
    ip_address: ip
  })

  revalidatePath('/', 'layout')
  redirect('/admin')
}

export async function adminSignUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const token = formData.get('token') as string

  // 1. Validate Secret Token
  if (token !== process.env.ADMIN_REGISTRATION_TOKEN) {
    return { error: 'Invalid security token. Administrator registration denied.' }
  }

  const supabase = await createClient()

  // 2. Sign up with Metadata & App Metadata (Role)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'admin',
        phone: 'ADMIN', // Placeholder for profiles table
        store_name: 'Yanba Admin',
        address: 'HQ',
        wilaya: 'Alger',
        commune: 'Alger'
      }
    }
  })

  if (error) return { error: error.message }

  // 3. Force update role in profiles table (since trigger might not handle it)
  if (data.user) {
    await supabase
      .from('profiles')
      .update({ role: 'admin', is_active: true })
      .eq('id', data.user.id)
  }

  // 4. Auto-sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (signInError) return { success: true, message: 'Admin account created. Please log in.' }

  revalidatePath('/', 'layout')
  redirect('/admin')
}

export async function signUp(formData: FormData) {
  const phone = formData.get('phone') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const storeName = formData.get('store_name') as string
  const wilaya = formData.get('wilaya') as string
  const commune = formData.get('commune') as string
  const address = formData.get('address') as string

  const supabase = await createClient()
  const email = `${phone}@yanba.com`

  // 1. Sign up with Metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
        store_name: storeName,
        wilaya: wilaya,
        commune: commune,
        address: address,
        role: 'client'
      }
    }
  })

  if (error) return { error: error.message }

  // 2. Automatically sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (signInError) {
    return { success: true, message: 'Account created, please log in.' }
  }

  // Log Activity
  if (data.user) {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'localhost'
    
    await supabase.from('activity_logs').insert({
      user_id: data.user.id,
      action: 'SIGNUP',
      description: 'New account created and logged in',
      ip_address: ip
    })
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  
  // Get user before signing out to determine redirect path
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin'
  
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  
  // Redirect to respective login page
  if (isAdmin) {
    redirect('/admin-login')
  } else {
    redirect('/login')
  }
}

// Alias for components that expect 'adminLogout'
export async function adminLogout() {
  return await signOut()
}

// Alias for components that expect 'logoutUser'
export async function logoutUser() {
  return await signOut()
}

import { revalidatePath } from 'next/cache'
