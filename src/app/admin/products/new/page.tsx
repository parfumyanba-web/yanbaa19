import React from 'react'
import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: brands } = await supabase.from('brands').select('*')
  const { data: categories } = await supabase.from('categories').select('*')
  const { data: collections } = await supabase.from('collections').select('*')

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <Link href="/admin/products" className="flex items-center gap-2 text-white/40 hover:text-gold transition-colors text-xs uppercase tracking-widest mb-4">
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
        <h1 className="text-3xl font-bold text-white/90">Add New Product</h1>
        <p className="text-white/40 text-sm">Create a new listing in your premium fragrance collection</p>
      </header>

      <ProductForm 
        brands={brands || []} 
        categories={categories || []} 
        collections={collections || []}
      />
    </div>
  )
}
