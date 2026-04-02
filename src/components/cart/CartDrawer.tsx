'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import Image from 'next/image'

const CartDrawer = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { items, removeItem, totalPrice } = useCartStore()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#121212] border-l border-white/10 z-[101] flex flex-col"
            dir="ltr" // Force LTR for the drawer layout consistency
          >
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3 text-gold">
                <ShoppingBag size={24} />
                <h2 className="text-xl font-bold uppercase tracking-widest">Your Cart</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-4">
                  <ShoppingBag size={64} strokeWidth={1} />
                  <p className="text-lg">Your cart is empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.id}-${item.quantity_label}`} className="flex gap-4 group">
                    <div className="relative w-20 h-24 bg-neutral-900 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-white/90">{item.name}</h4>
                        <button 
                          onClick={() => removeItem(item.id, item.quantity_label)}
                          className="text-white/20 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-xs text-gold font-bold uppercase">{item.quantity_label}</p>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-white/40 text-sm">Qty: {item.quantity_count}</span>
                        <span className="text-white font-bold">{item.price * item.quantity_count} DZD</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 space-y-6">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-white/50">Total</span>
                  <span className="text-gold font-bold text-2xl">{totalPrice()} DZD</span>
                </div>
                <button className="w-full gold-gradient py-4 rounded-xl text-black font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer
