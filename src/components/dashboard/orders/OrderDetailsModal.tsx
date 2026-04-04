'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { X, Package, Calendar, MapPin, CreditCard, ShoppingBag, Truck } from 'lucide-react'

interface OrderDetailsModalProps {
  order: any
  onClose: () => void
}

export const OrderDetailsModal = ({ order, onClose }: OrderDetailsModalProps) => {
  const { t, direction } = useLanguage()

  if (!order) return null

  const statusColors: any = {
    pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    confirmed: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    shipped: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    delivered: "text-green-400 bg-green-400/10 border-green-400/20",
    cancelled: "text-red-400 bg-red-400/10 border-red-400/20"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Package size={18} />
      case 'confirmed': return <Package size={18} />
      case 'shipped': return <Truck size={18} />
      case 'delivered': return <ShoppingBag size={18} />
      default: return <Package size={18} />
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[#1a1a1a] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl animate-scale-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold border border-gold/20">
              <Package size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-arabic text-white/90">
                {t('order_ref')}: #ORD-{order.id.slice(0, 8).toUpperCase()}
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-white/40 flex items-center gap-2 mt-1">
                <Calendar size={12} /> {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-full hover:bg-white/10 border border-white/5 transition-all">
            <X size={20} className="text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          {/* Status Bar */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
             <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${statusColors[order.status]}`}>
                   {getStatusIcon(order.status)}
                </div>
                <div>
                   <p className="text-[10px] uppercase tracking-tighter text-white/40">{t('order_status')}</p>
                   <p className={`text-sm font-bold uppercase tracking-widest ${statusColors[order.status]?.split(' ')[0]}`}>
                      {t(order.status)}
                   </p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-[10px] uppercase tracking-tighter text-white/40">{t('total_amount')}</p>
                <p className="text-lg font-bold text-gold">{Number(order.total_price).toLocaleString()} DZD</p>
             </div>
          </div>

          {/* Account Details if context exists? No, just order items */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold flex items-center gap-2">
              <ShoppingBag size={14} /> {t('products')}
            </h4>
            <div className="space-y-3">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-white/2 rounded-xl border border-white/5 group hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-white/20 group-hover:text-gold transition-colors">
                      <Package size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white/80">{item.products?.name || t('product')}</p>
                      <p className="text-[10px] text-white/30 uppercase">{item.quantity_label} x {item.quantity_count}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white/90">{(Number(item.price_at_time) * item.quantity_count).toLocaleString()} DZD</p>
                  </div>
                </div>
              ))}
              {(!order.order_items || order.order_items.length === 0) && (
                <p className="text-center py-6 text-white/20 italic text-sm">{t('no_items_found')}</p>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="space-y-4">
            <h4 className="text-[10px] uppercase tracking-[0.2em] text-gold font-bold flex items-center gap-2">
              <CreditCard size={14} /> {t('accounting')}
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/2 rounded-xl border border-white/5">
                <p className="text-[10px] text-white/30 uppercase mb-1">{t('paid_amount')}</p>
                <p className="text-sm font-bold text-green-400">{Number(order.paid_amount || 0).toLocaleString()} DZD</p>
              </div>
              <div className="p-4 bg-white/2 rounded-xl border border-white/5">
                <p className="text-[10px] text-white/30 uppercase mb-1">{t('remaining_amount')}</p>
                <p className="text-sm font-bold text-red-400">{(Number(order.total_price) - Number(order.paid_amount || 0)).toLocaleString()} DZD</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-8 bg-white/2 border-t border-white/5 flex gap-4">
           <button 
             onClick={onClose}
             className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/70 font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all"
           >
             {t('back')}
           </button>
        </div>
      </div>
    </div>
  )
}
