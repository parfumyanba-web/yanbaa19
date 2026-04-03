'use client'

import React from 'react'
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { useLanguage } from '@/context/LanguageContext'
import LuxuryButton from '@/components/ui/LuxuryButton'
import { useRouter } from 'next/navigation'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
  const { items, removeItem, updateQuantity } = useCartStore()
  const { t, direction } = useLanguage()
  const router = useRouter()

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity_count), 0)

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity duration-500 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed top-0 bottom-0 ${direction === 'rtl' ? 'left-0 border-r' : 'right-0 border-l'} w-full sm:max-w-md bg-[#0a0a0a] border-white/5 z-[101] shadow-2xl transition-transform duration-700 ease-out flex flex-col ${
        isOpen ? 'translate-x-0' : (direction === 'rtl' ? '-translate-x-full' : 'translate-x-full')
      }`}>
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-black/20 backdrop-blur-md text-white">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold">
              <ShoppingBag size={18} className="md:w-[20px] md:h-[20px]" />
            </div>
            <h2 className="text-lg md:text-xl font-bold font-arabic">{t('your_cart')}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-30 text-center px-10 text-white">
              <ShoppingBag size={64} strokeWidth={1} />
              <p className="text-sm uppercase tracking-[0.3em] font-light">{t('cart_empty')}</p>
              <button 
                onClick={onClose}
                className="text-gold text-[10px] font-bold uppercase tracking-widest hover:underline"
              >
                {t('continue_shopping')}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.id}-${item.quantity_label}`} className="glass-card p-4 flex gap-4 animate-fade-in group text-white">
                <div className="w-20 h-20 bg-white/5 rounded-xl overflow-hidden border border-white/5 shrink-0 flex items-center justify-center">
                   {item.image ? (
                     <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                   ) : (
                     <ShoppingBag size={24} className="text-white/10" />
                   )}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-white/90 line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest">{item.quantity_label}</p>
                    </div>
                    <button onClick={() => removeItem(item.id, item.quantity_label)} className="text-white/20 hover:text-red-400 transition-colors p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-gold font-bold">{(item.price).toLocaleString()} {t('price_dzd')}</p>
                  
                  <div className="flex items-center gap-4 pt-2">
                    <div className="flex items-center bg-white/5 rounded-lg border border-white/10">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity_label, Math.max(1, item.quantity_count - 1))}
                        className="p-1.5 hover:text-gold transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity_count}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity_label, item.quantity_count + 1)}
                        className="p-1.5 hover:text-gold transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="text-[10px] text-white/30 uppercase tracking-tighter">
                       {item.quantity_count} {t('items_count')}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 md:p-8 border-t border-white/10 bg-black/40 backdrop-blur-xl space-y-4 md:space-y-6 text-white">
            <div className="flex justify-between items-center text-white/40 uppercase tracking-widest text-[10px] md:text-xs">
              <span>{t('subtotal')}</span>
              <span className="text-base md:text-lg font-bold text-white tracking-widest">
                {subtotal.toLocaleString()} {t('price_dzd')}
              </span>
            </div>
            
            <LuxuryButton 
              onClick={() => {
                onClose()
                router.push('/checkout')
              }}
              className="w-full py-4 md:py-5 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 group text-xs md:text-sm font-bold tracking-[0.2em]"
            >
              {t('checkout')}
              <ArrowRight size={18} className={`group-hover:translate-x-1 transition-transform ${direction === 'rtl' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </LuxuryButton>
            
            <p className="text-[9px] text-white/20 text-center uppercase tracking-[0.3em]">
               Yanba B2B Secure Checkout
            </p>
          </div>
        )}
      </div>
    </>
  )
}

export default CartDrawer
