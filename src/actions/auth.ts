'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * Registers a new user with phone and password.
 * Internally maps phone to a dummy email for Supabase Auth consistency.
 */
export async function registerUser(formData: FormData) {
  const phone = formData.get('phone') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const storeName = formData.get('store_name') as string | null
  const address = formData.get('address') as string | null
  const wilaya = formData.get('wilaya') as string | null
  const commune = formData.get('commune') as string | null

  if (!phone || !password || !fullName) {
    return { error: 'Phone, password, and full name are required.' }
  }

  const supabase = createClient()
  const email = `${phone}@yanba.com`

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
      },
    },
  })

  if (error) return { error: error.message }

  if (data.user) {
    // Create profile in public.profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        full_name: fullName,
        phone: phone,
        store_name: storeName,
        address: address,
        wilaya: wilaya,
        commune: commune,
        role: 'client',
        is_active: true,
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return { error: 'Failed to create user profile.' }
    }
  }

  return { success: true }
}

/**
 * Logs in a user using phone and password.
 */
export async function loginUser(formData: FormData) {
  const phone = formData.get('phone') as string
  const password = formData.get('password') as string

  if (!phone || !password) {
    return { error: 'Phone and password are required.' }
  }

  const supabase = createClient()
  const email = `${phone}@yanba.com`

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Invalid phone or password.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

/**
 * Logs out the current user.
 */
export async function logoutUser() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
