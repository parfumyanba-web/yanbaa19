'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function generateInvoice(orderId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoices')
    .insert({
      order_id: orderId,
      status: 'issued'
    })
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath('/admin/orders')
  return { success: true, data }
}

export async function getInvoices() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select('*, orders(*, profiles(full_name, store_name))')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invoices:', error)
    return []
  }

  return data
}
