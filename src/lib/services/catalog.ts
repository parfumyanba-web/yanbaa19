import { createClient } from '@/lib/supabase/server'

export interface Brand {
  id: number
  name: string
  image_url?: string
}

export interface Product {
  id: number
  name: string
  description: string
  price_dzd: number
  image_url: string
  brand_id?: number
  brands?: { name: string }
}

export async function getProducts(filters?: { categoryId?: number; brandId?: number }) {
  const supabase = await createClient()
  
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

export async function getBrands() {
  const supabase = await createClient()
  const { data } = await supabase.from('brands').select('*')
  return data || []
}
