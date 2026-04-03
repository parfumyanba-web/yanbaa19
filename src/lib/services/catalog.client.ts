import { createClient } from '@/lib/supabase/client'
import { Product, Brand } from './catalog'

export async function getProductsClient(filters?: { categoryId?: string; brandId?: string; tag?: string; limit?: number }) {
  const supabase = createClient()
  
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
  if (filters?.tag) {
    results = results.filter(p => 
      p.product_tags?.some((pt: any) => pt.tags?.name === filters.tag)
    )
  }

  return results as Product[]
}

export async function getBrandsClient() {
  const supabase = createClient()
  const { data } = await supabase.from('brands').select('*')
  return data as Brand[] || []
}
