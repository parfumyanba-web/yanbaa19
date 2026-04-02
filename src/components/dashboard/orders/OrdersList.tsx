'use client'

import React, { useEffect } from 'react'
import { Package, Calendar, CreditCard } from 'lucide-react'
import { useRealtimeStore } from '@/store/useRealtimeStore'

interface Order {
  id: string
  user_id: string
  status: string
  total_price: number
  paid_amount: number
  created_at: string
}

export const OrdersList = ({ initialOrders }: { initialOrders: Order[] }) => {
  const { orders, setOrders } = useRealtimeStore()

  useEffect(() => {
    if (initialOrders) setOrders(initialOrders)
  }, [initialOrders, setOrders])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-amber-400 bg-amber-400'
      case 'confirmed': return 'text-blue-400 bg-blue-400'
      case 'shipped': return 'text-purple-400 bg-purple-400'
      case 'delivered': return 'text-green-400 bg-green-400'
      default: return 'text-white/20 bg-white/20'
    }
  }

  const getProgressWidth = (status: string) => {
    switch (status) {
      case 'pending': return '25%'
      case 'confirmed': return '50%'
      case 'shipped': return '75%'
      case 'delivered': return '100%'
      default: return '10%'
    }
  }

  return (
    <div className="space-y-6">
      {orders && orders.length > 0 ? (
        orders.map((order) => (
          <div key={order.id} className="glass-card hover:border-gold/30 transition-all overflow-hidden border border-white/5 bg-white/2">
            <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-2">
                 <p className="text-[10px] uppercase text-white/30 tracking-widest ">Order Reference</p>
                 <p className="font-bold text-gold">#{order.id.slice(0, 8)}</p>
                 <div className="flex items-center gap-2 text-white/40 text-xs">
                   <Calendar size={12} /> {new Date(order.created_at).toLocaleDateString()}
                 </div>
              </div>

              <div className="space-y-2">
                 <p className="text-[10px] uppercase text-white/30 tracking-widest ">Status</p>
                 <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)} shadow-[0_0_8px_currentColor]`} />
                    <span className="text-xs uppercase font-bold text-white/80 tracking-wider">
                       {order.status}
                    </span>
                 </div>
                 <p className="text-[10px] text-white/30 uppercase">Estimated Delivery: 2-3 Days</p>
              </div>

              <div className="space-y-2">
                 <p className="text-[10px] uppercase text-white/30 tracking-widest ">Accounting</p>
                 <div className="flex items-center gap-2 text-white/80 font-bold">
                   <CreditCard size={14} className="text-gold" />
                   {order.total_price} DZD
                 </div>
                 <p className="text-[10px] text-green-400 uppercase tracking-tighter">Paid: {order.paid_amount} DZD</p>
              </div>

              <div className="flex items-center justify-end">
                 <button className="px-6 py-3 rounded-lg border border-gold/50 text-gold text-xs font-bold uppercase tracking-widest hover:bg-gold hover:text-black transition-all">
                    View Details
                 </button>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-1 bg-white/5 w-full">
               <div 
                 className="h-full gold-gradient shadow-[0_0_10px_rgba(212,175,55,0.5)] transition-all duration-1000"
                 style={{ width: getProgressWidth(order.status) }}
               />
            </div>
          </div>
        ))
      ) : (
        <div className="py-20 text-center glass-card">
          <Package size={48} className="mx-auto text-white/10 mb-4" />
          <p className="text-white/20 uppercase tracking-[0.2em]">No orders placed yet</p>
          <button className="text-gold text-xs font-bold uppercase mt-4 hover:underline">Start Shopping</button>
        </div>
      )}
    </div>
  )
}
