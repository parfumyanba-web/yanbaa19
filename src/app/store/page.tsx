'use client'

import React, { useEffect, useState } from 'react'
import { getProductsClient, getBrandsClient } from '@/lib/services/catalog.client'
import { Product, Brand } from '@/lib/services/catalog'
import ProductCard from '@/components/store/ProductCard'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useLanguage } from '@/context/LanguageContext'

export default function StorePage() {
  const { t } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null)

  const loadData = async (brandId: string | null = null) => {
    setLoading(true)
    const [p, b] = await Promise.all([
      getProductsClient(brandId ? { brandId } : undefined),
      getBrandsClient()
    ])
    setProducts(p)
    setBrands(b)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleBrandFilter = (id: string | null) => {
    setSelectedBrandId(id)
    loadData(id)
  }

  return (
    <main className="min-h-screen pt-32 bg-[#121212]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <header className="mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-arabic gold-text-gradient">{t('luxury_collection')}</h1>
          <p className="text-white/40 uppercase tracking-[0.2em] text-sm">{t('store_subtitle')}</p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-12">
          <button 
            onClick={() => handleBrandFilter(null)}
            className={`px-6 py-2 rounded-full border transition-all text-sm font-medium ${
              selectedBrandId === null 
                ? 'border-gold text-gold bg-gold/10' 
                : 'border-white/10 text-white/50 hover:border-gold/50'
            }`}
          >
            {t('filter_all')}
          </button>
          {brands.map((brand) => (
            <button 
              key={brand.id} 
              onClick={() => handleBrandFilter(brand.id)}
              className={`px-6 py-2 rounded-full border transition-all text-sm font-medium ${
                selectedBrandId === brand.id 
                  ? 'border-gold text-gold bg-gold/10' 
                  : 'border-white/10 text-white/50 hover:border-gold/50'
              }`}
            >
              {brand.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12 min-h-[400px]">
          {loading ? (
             Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] glass-card animate-pulse bg-white/5 rounded-[2rem] border border-white/5" />
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full text-center py-32 bg-white/[0.02] border border-white/5 rounded-[3rem]">
              <p className="text-white/20 text-xl font-arabic">{t('empty_store')}</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
