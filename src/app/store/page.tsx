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

  useEffect(() => {
    async function loadData() {
      const [p, b] = await Promise.all([
        getProductsClient(),
        getBrandsClient()
      ])
      setProducts(p)
      setBrands(b)
      setLoading(false)
    }
    loadData()
  }, [])

  return (
    <main className="min-h-screen pt-32 bg-[#121212]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <header className="mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-arabic gold-text-gradient">{t('luxury_collection')}</h1>
          <p className="text-white/40 uppercase tracking-[0.2em] text-sm">{t('store_subtitle')}</p>
        </header>

        {/* Filters Placeholder */}
        <div className="flex flex-wrap gap-4 mb-12">
          <button className="px-6 py-2 rounded-full border border-gold text-gold text-sm font-medium hover:bg-gold hover:text-black transition-all">
            {t('filter_all')}
          </button>
          {brands.map((brand: any) => (
            <button key={brand.id} className="px-6 py-2 rounded-full border border-white/10 text-white/50 text-sm font-medium hover:border-gold hover:text-gold transition-all">
              {brand.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
          {loading ? (
             Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] glass-card animate-pulse bg-white/5 rounded-3xl" />
            ))
          ) : products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="md:col-span-4 text-center py-20 bg-white/[0.02] border border-white/5 rounded-[2rem]">
              <p className="text-white/20 text-xl font-arabic">{t('empty_store')}</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
