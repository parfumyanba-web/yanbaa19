'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct } from '@/actions/products'
import LuxuryButton from '@/components/ui/LuxuryButton'
import { X, Upload, Plus } from 'lucide-react'

interface ProductFormProps {
  initialData?: any
  brands: any[]
  categories: any[]
}

export default function ProductForm({ initialData, brands, categories }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      const result = initialData 
        ? await updateProduct(initialData.id, formData)
        : await createProduct(formData)

      if (result.error) {
        setError(result.error)
      } else {
        router.push('/admin/products')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Basic Info */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-bold">Basic Information</h3>
            
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Product Name</label>
              <input 
                name="name"
                defaultValue={initialData?.name}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-gold/50 transition-colors"
                placeholder="Ex: Santal Imperial"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Description</label>
              <textarea 
                name="description"
                defaultValue={initialData?.description}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-gold/50 transition-colors resize-none"
                placeholder="Describe the fragrance notes..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Default Price (DZD)</label>
              <input 
                name="price_dzd"
                type="number"
                defaultValue={initialData?.price_dzd}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-gold/50 transition-colors"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-bold">Image</h3>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Image URL</label>
              <div className="flex gap-2">
                <input 
                  name="image_url"
                  defaultValue={initialData?.image_url}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-gold/50 transition-colors"
                  placeholder="https://..."
                />
                <button type="button" className="p-3 bg-white/5 border border-white/10 rounded-xl hover:text-gold transition-colors">
                  <Upload size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Taxonomy */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-lg font-bold">Organization</h3>
            
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Brand</label>
              <select 
                name="brand_id" 
                defaultValue={initialData?.brand_id}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-gold/50 transition-colors appearance-none"
              >
                <option value="">Select Brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Categories</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(c => (
                  <label key={c.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="category_ids" 
                      value={c.id} 
                      defaultChecked={initialData?.product_categories?.some((pc: any) => pc.category_id === c.id)}
                      className="w-4 h-4 rounded border-white/10 bg-white/5 text-gold focus:ring-gold/50"
                    />
                    <span className="text-sm text-white/60 group-hover:text-white transition-colors">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Tags (Comma separated)</label>
              <input 
                name="tags"
                defaultValue={initialData?.product_tags?.map((t: any) => t.tag).join(', ')}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-gold/50 transition-colors"
                placeholder="luxury, oriental, summer..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t border-white/5 pt-8">
        <LuxuryButton 
          variant="ghost" 
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </LuxuryButton>
        <LuxuryButton 
          type="submit" 
          className="px-12"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Product' : 'Create Product'}
        </LuxuryButton>
      </div>
    </form>
  )
}
