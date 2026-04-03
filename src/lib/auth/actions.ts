'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const identifier = formData.get('identifier') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  // Detect if it's an email (admin) or phone (client)
  const isEmail = identifier.includes('@')
  const email = isEmail ? identifier : `${identifier}@yanba.com`

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
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
      }
    }
  })

  if (error) return { error: error.message }

  // 2. Automatically sign in after sign up to remove "waiting for approval" barrier
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (signInError) {
    // If auto-signin fails for some reason, we still count sign up as success but don't redirect yet
    return { success: true, message: 'Account created, please log in.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

import { revalidatePath } from 'next/cache'
