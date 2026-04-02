import React from 'react'
import { getProducts, getBrands } from '@/lib/services/catalog'
import ProductCard from '@/components/store/ProductCard'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default async function StorePage() {
  const [products, brands] = await Promise.all([
    getProducts(),
    getBrands()
  ])

  return (
    <main className="min-h-screen pt-32 bg-[#121212]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <header className="mb-16 space-y-4">
          <h1 className="text-4xl md:text-6xl font-arabic gold-text-gradient">متجرنا الفاخر</h1>
          <p className="text-white/40 uppercase tracking-[0.2em] text-sm">Elite Wholesale Catalog</p>
        </header>

        {/* Filters Placeholder */}
        <div className="flex flex-wrap gap-4 mb-12">
          <button className="px-6 py-2 rounded-full border border-gold text-gold text-sm font-medium hover:bg-gold hover:text-black transition-all">
            All Products
          </button>
          {brands.map((brand: any) => (
            <button key={brand.id} className="px-6 py-2 rounded-full border border-white/10 text-white/50 text-sm font-medium hover:border-gold hover:text-gold transition-all">
              {brand.name}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            // Placeholder/Empty State with some fancy styling
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] glass-card animate-pulse bg-white/5" />
            ))
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
