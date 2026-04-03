import { createClient } from '@/lib/supabase/server'

export interface Brand {
  id: string
  name: string
  image_url?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price_dzd: number
  image_url: string
  brand_id?: string
  brands?: { name: string }
  product_tags?: { tags: { name: string } }[]
}

export interface ProductFilters {
  categoryId?: string
  brandId?: string
  tag?: string
  limit?: number
}

export async function getProducts(filters?: ProductFilters) {
  const supabase = await createClient()
  
  let query = supabase
    .from('products')
    .select('*, brands(name), product_tags(tags(name))')

  if (filters?.brandId) {
    query = query.eq('brand_id', filters.brandId)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  let results = data as any[]
  
  // Transform or filter by tag if needed
  if (filters?.tag) {
    results = results.filter(p => 
      p.product_tags?.some((pt: any) => pt.tags?.name === filters.tag)
    )
  }

  return results as Product[]
}

export async function getBrands() {
  const supabase = await createClient()
  const { data } = await supabase.from('brands').select('*')
  return data || []
}
