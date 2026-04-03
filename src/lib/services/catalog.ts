import { createClient } from '@/lib/supabase/server'
import { Product, Brand, ProductFilters } from '@/types/catalog'

export type { Product, Brand, ProductFilters }

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

  const { data, error } = query as any
  
  const { data: finalData, error: finalError } = await query
  
  if (finalError) {
    console.error('Error fetching products:', finalError)
    return []
  }

  let results = finalData as any[]
  
  // Transform or filter by tag if needed
  if (filters?.tag) {
    results = results.filter(p => 
      p.product_tags?.some((pt: any) => pt.tags?.name === filters.tag)
    )
  }

  return results as Product[]
}

export async function getProductById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('products')
    .select('*, brands(name), product_tags(tags(name))')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching product:', error)
    return null
  }

  return data as Product
}

export async function getBrands() {
  const supabase = await createClient()
  const { data } = await supabase.from('brands').select('*')
  return data || []
}
