'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePlatformSettings(key: string, value: any) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('settings')
    .upsert({
      key,
      value,
      updated_at: new Date().toISOString()
    })

  if (error) return { error: error.message }

  revalidatePath('/admin/settings')
  return { success: true }
}

export async function getSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('settings').select('*')

  if (error) {
    console.error('Error fetching settings:', error)
    return {}
  }

  return data.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value
    return acc
  }, {})
}
