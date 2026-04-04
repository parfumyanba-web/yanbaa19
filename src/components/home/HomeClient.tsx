'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, Variants } from 'framer-motion'
import HeroCanvas from '@/components/home/HeroCanvas'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useLanguage } from '@/context/LanguageContext'
import { Product } from '@/types/catalog'
import ProductCard from '@/components/store/ProductCard'
import QuickViewModal from '@/components/store/QuickViewModal'

export default function HomeClient({ 
  featuredProducts, 
  newArrivals 
}: { 
  featuredProducts: Product[]
  newArrivals: Product[]
}) {
  const { t } = useLanguage()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)

  const openQuickView = (product: Product) => {
    setSelectedProduct(product)
    setIsQuickViewOpen(true)
  }

  const fadeInVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  }

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <HeroCanvas />
      
      {/* Featured Products */}
      <section className="relative z-10 py-24 md:py-40 px-4 md:px-8 bg-[#121212]">
        <div className="max-w-7xl mx-auto space-y-20">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInVariants}
            className="text-center space-y-6"
          >
            <span className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.5em]">{t('luxury_collection')}</span>
            <h2 className="text-4xl md:text-7xl font-arabic gold-text-gradient">
              {t('premium_selection') || 'مختاراتنا المتميزة'}
            </h2>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12"
          >
            {featuredProducts.length > 0 ? (
              featuredProducts.map((p) => (
                <motion.div key={p.id} variants={fadeInVariants}>
                  <ProductCard product={p} onQuickView={openQuickView} />
                </motion.div>
              ))
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] glass-card animate-pulse bg-white/5 rounded-3xl" />
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* Quality Section - Updated with New Visual */}
      <section className="relative z-10 py-24 md:py-48 px-4 md:px-8 bg-black overflow-hidden">
        {/* Subtle Ambient Background Light */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInVariants}
            className="space-y-10"
          >
            <div className="space-y-4">
              <span className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">{t('quality_title')}</span>
              <h2 className="text-4xl md:text-7xl font-arabic gold-text-gradient leading-tight">
                 أرقى المكونات <br/> لأفخم التجارة
              </h2>
            </div>
            <p className="text-lg md:text-xl text-white/50 leading-relaxed font-light max-w-xl">
              {t('quality_desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button className="gold-gradient px-10 py-5 rounded-2xl text-black font-black uppercase tracking-widest hover:scale-[1.03] transition-transform shadow-[0_20px_50px_rgba(212,175,55,0.2)]">
                {t('explore_collection')}
              </button>
              <button className="bg-white/5 border border-white/10 px-10 py-5 rounded-2xl text-white font-bold hover:bg-white/10 transition-colors">
                {t('contact_us')}
              </button>
            </div>
          </motion.div>

          {/* New Premium Image Overlay Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gold/10 blur-2xl rounded-[3rem] opacity-30" />
            <div className="glass-card aspect-square relative overflow-hidden rounded-[3rem] border border-white/10 shadow-2xl">
              <Image
                src="/quality-visual.png"
                alt="Oriental Fragrance Ingredients"
                fill
                className="object-cover scale-105 hover:scale-110 transition-transform duration-[2s]"
              />
              {/* Luxury Detail: Animated Scan Line */}
              <motion.div 
                animate={{ y: ["0%", "400%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-100%] left-0 right-0 h-[20%] bg-gradient-to-b from-transparent via-gold/10 to-transparent pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-40" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="relative z-10 py-24 md:py-40 px-4 md:px-8 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto space-y-20">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInVariants}
            className="flex flex-col md:flex-row justify-between items-end gap-8"
          >
             <div className="space-y-4">
                <span className="text-gold text-[10px] md:text-xs uppercase tracking-[0.5em] font-black">{t('new_arrivals')}</span>
                <h2 className="text-4xl md:text-7xl font-arabic text-white">العطور الجديدة</h2>
             </div>
             <button className="text-gold text-xs font-bold uppercase tracking-[0.3em] hover:text-white transition-colors border-b border-gold/30 pb-2">
               {t('view_all')}
             </button>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12"
          >
            {newArrivals.length > 0 ? (
              newArrivals.map((p) => (
                <motion.div key={p.id} variants={fadeInVariants}>
                  <ProductCard product={p} onQuickView={openQuickView} />
                </motion.div>
              ))
            ) : (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] glass-card animate-pulse bg-white/5 rounded-3xl" />
              ))
            )}
          </motion.div>
        </div>
      </section>

      {/* Quick View Modal Container */}
      <QuickViewModal 
        product={selectedProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />

      <Footer />
    </main>
  )
}
