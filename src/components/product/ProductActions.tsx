'use client'

import React, { useState } from 'react'
import { Plus, Minus, ShoppingBag, ShieldCheck, Truck, RotateCcw } from 'lucide-react'
import LuxuryButton from '@/components/ui/LuxuryButton'
import { useCartStore } from '@/store/useCartStore'
import { useLanguage } from '@/context/LanguageContext'
import { Product } from '@/types/catalog'

interface ProductActionsProps {
  product: Product
  resolveImage: (url?: string) => string
}

const ProductActions = ({ product, resolveImage }: ProductActionsProps) => {
  const { t } = useLanguage()
  const addItem = useCartStore((state) => state.addItem)
  
  const [quantityCount, setQuantityCount] = useState(1)
  const [selectedSize, setSelectedSize] = useState('100g')
  
  const sizes = ['100g', '500g', '1kg', '10kg']

  const handleAddToCart = () => {
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: product.price_dzd,
      image: resolveImage(product.image_url),
      quantity_label: selectedSize,
      quantity_count: quantityCount
    })
  }

  return (
    <div className="space-y-10">
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
  )
}

export default ProductActions
