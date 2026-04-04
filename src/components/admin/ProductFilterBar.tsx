'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface ProductFilterBarProps {
  brands: any[]
  categories: any[]
}

export default function ProductFilterBar({ brands, categories }: ProductFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [name, setName] = useState(searchParams.get('name') || '')
  const [brandId, setBrandId] = useState(searchParams.get('brandId') || '')
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '')

  useEffect(() => {
    const params = new URLSearchParams()
    if (name) params.set('name', name)
    if (brandId) params.set('brandId', brandId)
    if (categoryId) params.set('categoryId', categoryId)
    
    const query = params.toString()
    router.push(`/admin/products${query ? `?${query}` : ''}`, { scroll: false })
  }, [name, brandId, categoryId, router])

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center glass-card p-4">
      <div className="w-full md:flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
        <input 
          type="text" 
          placeholder="Search products by name..." 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-10 py-3 outline-none focus:border-gold/50 transition-colors text-sm"
        />
        {name && (
          <button 
            onClick={() => setName('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>
      
      <div className="flex gap-4 w-full md:w-auto">
        <select 
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          className="flex-1 md:w-48 bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/50 outline-none hover:border-white/20 transition-colors cursor-pointer appearance-none"
        >
          <option value="">All Brands</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>

        <select 
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="flex-1 md:w-48 bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-sm text-white/50 outline-none hover:border-white/20 transition-colors cursor-pointer appearance-none"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
    </div>
  )
}
