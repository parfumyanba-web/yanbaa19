'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct } from '@/actions/products'
import LuxuryButton from '@/components/ui/LuxuryButton'
import ImageUpload from './ImageUpload'
import { X, Upload, Plus, ImageIcon } from 'lucide-react'

interface ProductFormProps {
  initialData?: any
  brands: any[]
  categories: any[]
  collections: any[]
}

export default function ProductForm({ initialData, brands, categories, collections }: ProductFormProps) {
  const router = useRouter()
  // ... (keep state)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string>(initialData?.image_url || '')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // ... (keep existing handleSubmit logic)
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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl pb-20">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Basic Info & Visuals */}
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
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-gold/50 transition-colors resize-none text-sm"
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
            <div className="flex items-center justify-between">
               <h3 className="text-lg font-bold">Product Visual</h3>
               <ImageIcon size={18} className="text-gold/50" />
            </div>
            
            <input type="hidden" name="image_url" value={imageUrl} />
            
            <ImageUpload 
              defaultValue={initialData?.image_url}
              onImageUploaded={(url) => setImageUrl(url)}
              onImageRemoved={() => setImageUrl('')}
            />

            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Manual URL (Optional)</label>
              <input 
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-gold/50 transition-colors"
                placeholder="https://external-image-url.com/image.jpg"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Taxonomy (Brands, Categories, Collections, Tags) */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-6">
            <h3 className="text-lg font-bold border-b border-white/5 pb-4">Organization</h3>
            
            {/* Brands */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Brand</label>
              <select 
                name="brand_id" 
                defaultValue={initialData?.brand_id}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-gold/50 transition-colors appearance-none text-sm"
              >
                <option value="">Select Brand</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-widest text-white/40">Categories</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                {categories.map(c => (
                  <label key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="category_ids" 
                      value={c.id} 
                      defaultChecked={initialData?.product_categories?.some((pc: any) => pc.category_id === c.id)}
                      className="w-4 h-4 rounded border-white/10 bg-white/10 text-gold focus:ring-gold/50"
                    />
                    <span className="text-[11px] text-white/60 group-hover:text-white transition-colors truncate">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Collections (Groups) */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-widest text-gold font-bold">Groups / Collections (مجموعات)</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                {collections.map(col => (
                  <label key={col.id} className="flex items-center gap-2 p-2 rounded-lg bg-gold/5 border border-gold/10 hover:border-gold/30 transition-colors cursor-pointer group">
                    <input 
                      type="checkbox" 
                      name="collection_ids" 
                      value={col.id} 
                      defaultChecked={initialData?.product_collections?.some((pc: any) => pc.collection_id === col.id)}
                      className="w-4 h-4 rounded border-gold/20 bg-gold/10 text-gold focus:ring-gold/50"
                    />
                    <span className="text-[11px] text-gold/70 group-hover:text-gold transition-colors truncate">{col.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/40">Tags</label>
              <input 
                name="tags"
                defaultValue={initialData?.product_tags?.map((t: any) => t.tags?.name || t.tag).join(', ')}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-gold/50 transition-colors text-sm"
                placeholder="luxury, oriental, summer..."
              />
              <p className="text-[9px] text-white/20 italic">Comma-separated tags for smart filtering</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t border-white/5 pt-8">
        <LuxuryButton 
          variant="ghost" 
          onClick={() => router.back()}
          disabled={isLoading}
          className="px-8"
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
