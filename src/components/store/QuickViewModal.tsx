'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag, Info } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useCartStore } from '@/store/useCartStore'
import { Product } from '@/types/catalog'

interface QuickViewModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

const WEIGTH_OPTIONS = ['100g', '250g', '500g', '1kg']

const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
  const { t } = useLanguage()
  const addItem = useCartStore((state) => state.addItem)
  const [selectedWeight, setSelectedWeight] = useState('100g')
  const [quantity, setQuantity] = useState(1)

  if (!product) return null

  const resolveImage = (url?: string) => {
    if (!url || url.trim() === '') return 'https://images.unsplash.com/photo-1541643600914-7836d3969197?auto=format&fit=crop&q=80&w=800'
    if (url.startsWith('http')) return url
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    return supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/products/${url}` : url
  }

  const imageUrl = resolveImage(product.image_url)

  const handleAddToCart = () => {
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: product.price_dzd * (WEIGTH_OPTIONS.indexOf(selectedWeight) + 1), // Simplistic multiplier for demo, usually prices vary per weight
      image: imageUrl,
      quantity_label: selectedWeight,
      quantity_count: quantity
    })
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Product Image Section */}
            <div className="w-full md:w-1/2 aspect-square relative bg-neutral-900">
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
            </div>

            {/* Product Info Section */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center space-y-8 overflow-y-auto max-h-[60vh] md:max-h-none">
              <div className="space-y-2">
                <span className="text-gold text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">
                  {product.brands?.name || 'Yanba Collection'}
                </span>
                <h2 className="text-3xl md:text-5xl font-arabic gold-text-gradient leading-tight">
                  {product.name}
                </h2>
              </div>

              <p className="text-white/40 text-sm md:text-base font-light leading-relaxed">
                {product.description || t('quality_desc')}
              </p>

              {/* Weight Selection - B2B Focus */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Info size={14} className="text-gold/60" />
                  <span className="text-white/60 text-xs font-medium uppercase tracking-wider">{t('select_weight')}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {WEIGTH_OPTIONS.map((weight) => (
                    <button
                      key={weight}
                      onClick={() => setSelectedWeight(weight)}
                      className={`px-6 py-3 rounded-full text-xs font-bold transition-all duration-300 border ${
                        selectedWeight === weight
                          ? 'gold-gradient text-black border-transparent shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                          : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'
                      }`}
                    >
                      {weight}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity and Action */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 pt-4">
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-white/40 hover:text-gold transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center text-white font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 text-white/40 hover:text-gold transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-white">
                      {(product.price_dzd * quantity).toLocaleString()}
                    </span>
                    <span className="text-gold text-[10px] font-bold tracking-widest">{t('price_dzd')}</span>
                  </div>
                  <p className="text-[10px] text-white/20 uppercase tracking-widest">{t('excluding_tax') || 'Excl. Taxes'}</p>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="gold-gradient px-8 py-5 rounded-2xl text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:scale-[1.02] active:scale-95 transition-transform"
                >
                  <ShoppingBag size={20} />
                  {t('add_to_cart')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default QuickViewModal
