'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateStock(productId: number, quantityInGrams: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('inventory')
    .update({ quantity_in_grams: quantityInGrams, last_updated: new Date().toISOString() })
    .eq('product_id', productId)

  if (error) return { error: error.message }

  revalidatePath('/admin/inventory')
  revalidatePath('/admin/products')
  return { success: true }
}

export async function restock(productId: number, addQuantityGrams: number) {
  const supabase = await createClient()
  
  // Get current stock
  const { data: current, error: fetchError } = await supabase
    .from('inventory')
    .select('quantity_in_grams')
    .eq('product_id', productId)
    .single()

  if (fetchError) return { error: fetchError.message }

  const newQuantity = (current?.quantity_in_grams || 0) + addQuantityGrams

  const { error } = await supabase
    .from('inventory')
    .update({ quantity_in_grams: newQuantity, last_updated: new Date().toISOString() })
    .eq('product_id', productId)

  if (error) return { error: error.message }

  revalidatePath('/admin/inventory')
  return { success: true }
}

export async function getInventory() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inventory')
    .select('*, products(name, image_url, brands(name))')
    .order('last_updated', { ascending: false })

  if (error) {
    console.error('Error fetching inventory:', error)
    return []
  }

  return data
}
