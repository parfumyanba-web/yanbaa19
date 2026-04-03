'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price_dzd = parseFloat(formData.get('price_dzd') as string)
  const image_url = formData.get('image_url') as string
  const brand_id = formData.get('brand_id') as string || null
  const categoryIds = formData.getAll('category_ids') as string[]
  const tags = formData.get('tags') ? (formData.get('tags') as string).split(',').map(t => t.trim()) : []

  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({
      name,
      description,
      price_dzd,
      image_url,
      brand_id
    })
    .select()
    .single()

  if (productError) return { error: productError.message }

  // Insert categories
  if (categoryIds.length > 0) {
    const categoryInserts = categoryIds.map(categoryId => ({
      product_id: product.id,
      category_id: categoryId
    }))
    await supabase.from('product_categories').insert(categoryInserts)
  }

  // Insert tags (lookup or create)
  if (tags.length > 0) {
    for (const tagName of tags) {
      // Get or create tag
      let { data: tag } = await supabase
        .from('tags')
        .select('id')
        .eq('name', tagName)
        .single()
      
      if (!tag) {
        const { data: newTag } = await supabase
          .from('tags')
          .insert({ name: tagName })
          .select('id')
          .single()
        tag = newTag
      }

      if (tag) {
        await supabase.from('product_tags').insert({
          product_id: product.id,
          tag_id: tag.id
        })
      }
    }
  }

  // Initialize inventory
  await supabase.from('inventory').insert({
    product_id: product.id,
    quantity_in_grams: 0
  })

  revalidatePath('/admin/products')
  return { success: true, product }
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price_dzd = parseFloat(formData.get('price_dzd') as string)
  const image_url = formData.get('image_url') as string
  const brand_id = formData.get('brand_id') as string || null

  const { error } = await supabase
    .from('products')
    .update({
      name,
      description,
      price_dzd,
      image_url,
      brand_id
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/products')
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/products')
  return { success: true }
}

export async function getProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, brands(name), product_categories(categories(name)), product_tags(tags(name))')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data
}

// Category CRUD
export async function createCategory(name: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').insert({ name }).select().single()
  if (error) return { error: error.message }
  revalidatePath('/admin/products')
  return { success: true, data }
}

// Brand CRUD
export async function createBrand(name: string, description?: string, image_url?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('brands').insert({ name, description, image_url }).select().single()
  if (error) return { error: error.message }
  revalidatePath('/admin/products')
  return { success: true, data }
}
