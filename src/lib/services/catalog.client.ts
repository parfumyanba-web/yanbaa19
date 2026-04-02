import { createClient } from '@/lib/supabase/client'
import { Product, Brand } from './catalog'

export async function getProductsClient(filters?: { categoryId?: number; brandId?: number }) {
  const supabase = createClient()
  
  let query = supabase
    .from('products')
    .select('*, brands(name)')

  if (filters?.brandId) {
    query = query.eq('brand_id', filters.brandId)
  }

  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data as Product[]
}

export async function getBrandsClient() {
  const supabase = createClient()
  const { data } = await supabase.from('brands').select('*')
  return data as Brand[] || []
}
