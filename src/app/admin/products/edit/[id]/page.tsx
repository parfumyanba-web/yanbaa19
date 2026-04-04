import React from 'react'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()
  
  const { data: product } = await supabase
    .from('products')
    .select('*, product_categories(*), product_tags(tag_id, tags(name)), product_collections(*)')
    .eq('id', params.id)
    .single()

  if (!product) notFound()

  const { data: brands } = await supabase.from('brands').select('*')
  const { data: categories } = await supabase.from('categories').select('*')
  const { data: collections } = await supabase.from('collections').select('*')

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <Link href="/admin/products" className="flex items-center gap-2 text-white/40 hover:text-gold transition-colors text-xs uppercase tracking-widest mb-4">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
        <h1 className="text-3xl font-bold text-white/90">Edit Product</h1>
        <p className="text-white/40 text-sm">Update details for "{product.name}"</p>
      </header>

      <ProductForm 
        initialData={product}
        brands={brands || []} 
        categories={categories || []} 
        collections={collections || []}
      />
    </div>
  )
}
