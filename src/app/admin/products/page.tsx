'use server'

import React from 'react'
import { Plus, Search, Edit2, Trash2, Tag, Box, Layers } from 'lucide-react'
import LuxuryButton from '@/components/ui/LuxuryButton'
import { createClient } from '@/lib/supabase/server'
import { deleteProduct, getProducts } from '@/actions/products'
import Link from 'next/link'
import DeleteProductButton from '@/components/admin/DeleteProductButton'
import ProductFilterBar from '@/components/admin/ProductFilterBar'
import { resolveProductImage } from '@/lib/utils/imageUtils'

interface AdminProductsProps {
  searchParams: {
    name?: string
    brandId?: string
    categoryId?: string
  }
}

const AdminProducts = async ({ searchParams }: AdminProductsProps) => {
  const products = await getProducts(searchParams)
  const supabase = await createClient()
  const { data: brands } = await supabase.from('brands').select('*')
  const { data: categories } = await supabase.from('categories').select('*')

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white/90">Catalog Management</h1>
          <p className="text-white/40 text-sm">Manage your inventory and product listings</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/products/new">
            <LuxuryButton className="flex items-center gap-2 px-8">
              <Plus size={18} /> New Product
            </LuxuryButton>
          </Link>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-gold/10 rounded-xl text-gold"><Box size={24} /></div>
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">Total Products</p>
            <p className="text-xl font-bold">{products.length}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><Layers size={24} /></div>
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">Categories</p>
            <p className="text-xl font-bold">{categories?.length || 0}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400"><Tag size={24} /></div>
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">Active Brands</p>
            <p className="text-xl font-bold">{brands?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <ProductFilterBar 
        brands={brands || []} 
        categories={categories || []} 
      />

      {/* Products Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-white/30 text-[10px] uppercase tracking-widest border-b border-white/5 bg-white/5">
              <th className="px-8 py-5 font-normal">Product</th>
              <th className="px-8 py-5 font-normal">Brand</th>
              <th className="px-8 py-5 font-normal">Categories</th>
              <th className="px-8 py-5 font-normal">Price</th>
              <th className="px-8 py-5 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {products.length > 0 ? (
              products.map((product: any) => (
                <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-white/10 overflow-hidden relative">
                        <img 
                          src={resolveProductImage(product.image_url)} 
                          alt={product.name} 
                          className="object-cover w-full h-full" 
                        />
                      </div>
                      <div>
                        <p className="font-bold text-white/90">{product.name}</p>
                        <div className="flex gap-1 mt-1">
                          {product.product_tags?.map((t: any) => (
                            <span key={t.tag} className="text-[8px] bg-white/5 text-white/40 px-1 rounded uppercase tracking-tighter">#{t.tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-white/50">{product.brands?.name || 'N/A'}</td>
                  <td className="px-8 py-5">
                    <div className="flex flex-wrap gap-2">
                      {product.product_categories?.map((pc: any) => (
                        <span key={pc.category_id} className="text-[10px] bg-gold/5 text-gold/70 px-2 py-0.5 rounded-full border border-gold/10">
                          {pc.categories?.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-5 font-bold text-gold">{Number(product.price_dzd).toLocaleString()} DZD</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                       <Link href={`/admin/products/edit/${product.id}`} className="p-2 text-white/30 hover:text-gold hover:bg-white/5 rounded-lg transition-all"><Edit2 size={16} /></Link>
                       <DeleteProductButton id={product.id} />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-white/20 uppercase tracking-widest italic">
                   No products found in catalog
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminProducts
