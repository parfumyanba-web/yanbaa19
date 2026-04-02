import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const phone = formData.get('phone') as string
  const password = formData.get('password') as string
  const supabase = createClient()

  // Internal mapping of phone to email-like format for Supabase Auth
  const email = `${phone}@yanba.com`

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

  const supabase = createClient()
  const email = `${phone}@yanba.com`

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
      }
    }
  })

  if (error) return { error: error.message }

  if (data.user) {
    // Create profile in public.profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        full_name: fullName,
        phone: phone,
        store_name: storeName,
        wilaya: wilaya,
        commune: commune,
        address: address,
        role: 'client',
        is_active: true
      })

    if (profileError) return { error: profileError.message }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

import { revalidatePath } from 'next/cache'
