'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const identifier = formData.get('identifier') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const isEmail = identifier.includes('@')
  const email = isEmail ? identifier : `${identifier}@yanba.com`

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) return { error: error.message }

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

  const { data, error } = await supabase.auth.signInWithPassword({
    email: identifier,
    password,
  })

  if (error) {
    console.error(`[Admin Login Error] Auth Failure: ${error.message}`)
    return { error: error.message }
  }

  // Role Verification from JWT metadata (NOT profiles table - avoids RLS recursion here)
  const appRole = data.user.app_metadata?.role
  const userRole = data.user.user_metadata?.role
  const isAdmin = appRole === 'admin' || userRole === 'admin'

  if (!isAdmin) {
    console.warn(`[Admin Login Error] Unauthorized Role. AppRole: ${appRole}, UserRole: ${userRole}`)
    await supabase.auth.signOut()
    return { error: 'Unauthorized access. Administrators only.' }
  }

  console.log(`[Admin Login Success] User ${data.user.email} authenticated.`)
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
