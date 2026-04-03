'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getProductById } from '@/lib/services/catalog'
import { Product } from '@/types/catalog'
import { useCartStore } from '@/store/useCartStore'
import { useLanguage } from '@/context/LanguageContext'
import { ShoppingBag, ArrowLeft, Star, ShieldCheck, Truck, RotateCcw, Plus, Minus } from 'lucide-react'
import LuxuryButton from '@/components/ui/LuxuryButton'

const ProductDetailsPage = () => {
  const { id } = useParams()
  const router = useRouter()
  const { t, direction } = useLanguage()
  const addItem = useCartStore((state) => state.addItem)
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantityCount, setQuantityCount] = useState(1)
  const [selectedSize, setSelectedSize] = useState('100g')
  
  const sizes = ['100g', '500g', '1kg', '10kg']

  useEffect(() => {
    async function loadProduct() {
      if (!id) return
      setLoading(true)
      const data = await getProductById(id as string)
      setProduct(data)
      setLoading(false)
    }
    loadProduct()
  }, [id])

  const resolveImage = (url?: string) => {
    if (!url || url.trim() === '') return 'https://images.unsplash.com/photo-1541643600914-7836d3969197?auto=format&fit=crop&q=80&w=1200'
    if (url.startsWith('http')) return url
    if (url.startsWith('/')) return url
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    return `${supabaseUrl}/storage/v1/object/public/products/${url}`
  }

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: product.price_dzd,
      image: resolveImage(product.image_url),
      quantity_label: selectedSize,
      quantity_count: quantityCount
    })
  }

  if (loading) {
     return (
       <main className="min-h-screen bg-[#0a0a0a] pt-32">
         <Navbar />
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 animate-pulse">
            <div className="aspect-[4/5] bg-white/5 rounded-[3rem]" />
            <div className="space-y-8 py-10">
               <div className="h-4 w-24 bg-white/5 rounded-full" />
               <div className="h-16 w-full bg-white/5 rounded-3xl" />
               <div className="h-32 w-full bg-white/5 rounded-3xl" />
               <div className="h-20 w-1/2 bg-white/5 rounded-3xl" />
            </div>
         </div>
       </main>
     )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold text-white/90">Product Not Found</h2>
          <LuxuryButton onClick={() => router.push('/store')}>Back to Store</LuxuryButton>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] font-alexandria">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        {/* Breadcrumb / Back */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/40 hover:text-gold transition-colors mb-12 text-sm uppercase tracking-widest group"
        >
          <ArrowLeft size={16} className={`transform group-hover:-translate-x-1 transition-transform ${direction === 'rtl' ? 'rotate-180' : ''}`} />
          {t('back_to_home')}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Left: Image Gallery */}
          <div className="lg:col-span-7 sticky top-32">
            <div className="aspect-[4/5] relative rounded-[3rem] overflow-hidden border border-white/5 bg-neutral-900 shadow-2xl group">
               <Image 
                 src={resolveImage(product.image_url)}
                 alt={product.name}
                 fill
                 className="object-cover transition-transform duration-1000 group-hover:scale-105"
                 priority
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               
               {/* Tags Overlay */}
               <div className="absolute top-8 right-8 flex flex-col gap-3">
                 {product.product_tags?.map((pt: any, i: number) => (
                   <span key={i} className="bg-black/60 backdrop-blur-xl border border-white/10 text-white px-4 py-2 rounded-full text-xs font-arabic">
                     {pt.tags?.name}
                   </span>
                 ))}
               </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="lg:col-span-5 space-y-10 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-gold/10 border border-gold/20 text-gold text-[10px] font-black uppercase tracking-widest rounded-lg">
                  {product.brands?.name || t('new_arrivals')}
                </span>
                <div className="flex gap-1 text-gold/40">
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" />
                  <Star size={12} fill="currentColor" className="opacity-30" />
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-arabic text-white leading-tight">
                {product.name}
              </h1>
            </div>

            <div className="flex items-baseline gap-4">
               <span className="text-5xl font-bold gold-text-gradient">
                 {product.price_dzd.toLocaleString()}
               </span>
               <span className="text-white/40 text-lg uppercase tracking-widest">{t('price_dzd')}</span>
            </div>

            <p className="text-white/50 leading-relaxed text-lg font-light">
               {product.description || t('quality_desc')}
            </p>

            <div className="h-px bg-white/5" />

            {/* Selectors */}
            <div className="space-y-8">
               <div className="space-y-4">
                  <span className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Select Quantity</span>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-3 rounded-2xl border text-sm transition-all ${
                          selectedSize === size 
                            ? 'bg-gold border-gold text-black font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)]' 
                            : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="flex items-center gap-8">
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Count</span>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1">
                       <button 
                         onClick={() => setQuantityCount(Math.max(1, quantityCount - 1))}
                         className="p-3 hover:bg-white/10 rounded-xl transition-colors text-white/40 hover:text-white"
                       >
                         <Minus size={18} />
                       </button>
                       <span className="w-12 text-center text-white font-bold text-lg">{quantityCount}</span>
                       <button 
                         onClick={() => setQuantityCount(quantityCount + 1)}
                         className="p-3 hover:bg-white/10 rounded-xl transition-colors text-white/40 hover:text-white"
                       >
                         <Plus size={18} />
                       </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 pt-6">
                    <LuxuryButton 
                      onClick={handleAddToCart}
                      className="w-full py-5 text-lg group/btn"
                    >
                      <span className="flex items-center justify-center gap-3">
                        <ShoppingBag size={20} className="group-hover/btn:scale-110 transition-transform" />
                        {t('add_to_cart')}
                      </span>
                    </LuxuryButton>
                  </div>
               </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-10 border-t border-white/5">
               <div className="flex flex-col items-center gap-3 text-center group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gold/40 group-hover:text-gold transition-colors border border-white/5 group-hover:border-gold/20">
                     <ShieldCheck size={24} />
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-white/30">100% Authentic</span>
               </div>
               <div className="flex flex-col items-center gap-3 text-center group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gold/40 group-hover:text-gold transition-colors border border-white/5 group-hover:border-gold/20">
                     <Truck size={24} />
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-white/30">Fast Delivery</span>
               </div>
               <div className="flex flex-col items-center gap-3 text-center group">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gold/40 group-hover:text-gold transition-colors border border-white/5 group-hover:border-gold/20">
                     <RotateCcw size={24} />
                  </div>
                  <span className="text-[9px] uppercase tracking-widest text-white/30">Easy Exchange</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

export default ProductDetailsPage
