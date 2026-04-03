import React, { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getProductById } from '@/lib/services/catalog'
import { Star, ArrowLeft } from 'lucide-react'
import ProductActions from '@/components/product/ProductActions'
import { createClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ id: string }>
}

const ProductDetailsPage = async ({ params }: PageProps) => {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold text-white/90">Product Not Found</h2>
          <Link href="/store" className="inline-block px-8 py-4 bg-gold text-black font-bold rounded-2xl">
            Back to Store
          </Link>
        </div>
      </main>
    )
  }

  const resolveImage = (url?: string) => {
    if (!url || url.trim() === '') return 'https://images.unsplash.com/photo-1541643600914-7836d3969197?auto=format&fit=crop&q=80&w=1200'
    if (url.startsWith('http')) return url
    if (url.startsWith('/')) return url
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    return `${supabaseUrl}/storage/v1/object/public/products/${url}`
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] font-alexandria">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 pt-40 pb-20">
        <Link 
          href="/store"
          className="flex items-center gap-2 text-white/40 hover:text-gold transition-colors mb-12 text-sm uppercase tracking-widest group w-fit"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          Back to Store
        </Link>

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
                  {product.brands?.name || 'New Arrival'}
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
                 {product.price_dzd?.toLocaleString()}
               </span>
               <span className="text-white/40 text-lg uppercase tracking-widest">DZD</span>
            </div>

            <p className="text-white/50 leading-relaxed text-lg font-light">
               {product.description || 'Premium quality fragrance ingredient sourced with care.'}
            </p>

            <div className="h-px bg-white/5" />

            <ProductActions product={product} resolveImage={resolveImage} />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}

export default ProductDetailsPage
