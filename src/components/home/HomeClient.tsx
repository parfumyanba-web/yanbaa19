'use client'

import HeroCanvas from '@/components/home/HeroCanvas'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useLanguage } from '@/context/LanguageContext'
import { Product } from '@/lib/services/catalog'
import ProductCard from '@/components/store/ProductCard'

export default function HomeClient({ 
  featuredProducts, 
  newArrivals 
}: { 
  featuredProducts: Product[]
  newArrivals: Product[]
}) {
  const { t } = useLanguage()
  
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroCanvas />
      
      {/* Featured Products */}
      <section className="relative z-10 py-20 md:py-32 px-4 md:px-8 bg-[#121212]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-6xl font-arabic gold-text-gradient">
              {t('luxury_collection')}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-x-8 md:gap-y-12">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] glass-card animate-pulse bg-white/5 rounded-3xl" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="relative z-10 py-20 md:py-32 px-4 md:px-8 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
             <div className="space-y-2">
                <span className="text-gold text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold">{t('new_arrivals')}</span>
                <h2 className="text-3xl md:text-5xl font-arabic text-white">العطور الجديدة</h2>
             </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-x-8 md:gap-y-12">
            {newArrivals.length > 0 ? (
              newArrivals.map((p) => <ProductCard key={p.id} product={p} />)
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] glass-card animate-pulse bg-white/5 rounded-3xl" />
              ))
            )}
          </div>
        </div>
      </section>
      
      {/* Quality Section */}
      <section className="relative z-10 py-20 md:py-32 px-4 md:px-8 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-3xl md:text-6xl font-arabic gold-text-gradient">
              {t('quality_title')}
            </h2>
            <p className="text-base md:text-lg text-white/60 leading-relaxed font-light">
              {t('quality_desc')}
            </p>
            <div className="flex gap-4">
              <button className="gold-gradient w-full sm:w-auto px-8 py-4 rounded-full text-black font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2">
                {t('explore_collection')}
              </button>
            </div>
          </div>
          <div className="glass-card aspect-square relative overflow-hidden group rounded-3xl border border-white/5">
              <div className="absolute inset-0 bg-gold/5 mix-blend-overlay group-hover:bg-gold/10 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-1/2 h-px bg-gold/20 rotate-45" />
                 <div className="w-1/2 h-px bg-gold/20 -rotate-45" />
              </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
