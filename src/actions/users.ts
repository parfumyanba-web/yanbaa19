'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function freezeUser(userId: string, active: boolean) {
  const supabase = createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: active })
    .eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = createClient()
  
  // Note: deleting from auth.users requires service_role key or specific RPC
  // Since we are using createClient() from server.ts which uses anon key,
  // we might need an RPC to handle user deletion if RLS doesn't allow it.
  // For now, let's attempt to delete from profiles (which might trigger auth delete if cascading)
  // or use a flag.
  const { error } = await supabase.from('profiles').delete().eq('id', userId)

  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function resetPassword(userId: string) {
  const supabase = createClient()
  // Trigger a password reset email
  const { data: userProfile } = await supabase.from('profiles').select('phone').eq('id', userId).single()
  
  if (userProfile?.phone) {
    const email = `${userProfile.phone}@yanba.com`
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    })
    
    if (error) return { error: error.message }
    return { success: true }
  }

  return { error: 'User phone not found.' }
}

export async function getUsers() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching users:', error)
    return []
  }

  return data
}
