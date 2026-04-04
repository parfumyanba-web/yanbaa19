'use client'

import React, { useState, useEffect } from 'react'
import { ShoppingBag, ChevronRight, Package, Loader2, ArrowRight, CheckCircle2, Settings } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import InvoiceView from '@/components/invoice/InvoiceView'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'

const StatCard = ({ label, value, icon, highlight }: any) => (
  <div className={`glass-card p-6 flex items-center gap-6 rounded-[2rem] border transition-all ${highlight ? 'border-gold/20 bg-gold/5' : 'border-white/5'}`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-gold bg-gold/10`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] uppercase text-white/40 tracking-[0.2em] font-bold mb-1">{label}</p>
      <p className="text-2xl font-bold text-white/90 tracking-tight">{value}</p>
    </div>
  </div>
)

const RecentOrderRow = ({ id, date, status, total, invoice, onViewInvoice }: any) => {
  const { t } = useLanguage()
  const statusColors: any = {
    pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    confirmed: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    shipped: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    delivered: "text-green-400 bg-green-400/10 border-green-400/20"
  }
  
  return (
    <div className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-4 rounded-2xl transition-all border border-transparent hover:border-white/5">
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center font-bold text-white/20 group-hover:text-gold transition-all">
          <Package size={20} />
        </div>
        <div>
          <p className="font-bold text-white/80 group-hover:text-white transition-colors">{id}</p>
          <p className="text-[10px] text-white/30 uppercase tracking-tighter">{date}</p>
        </div>
      </div>
      <div className="text-right flex items-center gap-6 sm:gap-10">
         {invoice && (
           <button 
             onClick={(e) => {
               e.stopPropagation()
               onViewInvoice()
             }}
             className="px-3 py-1.5 bg-gold/10 border border-gold/20 rounded-lg text-gold hover:bg-gold/20 transition-all text-[9px] uppercase tracking-widest font-bold"
           >
             {t('view_invoice')}
           </button>
         )}
          <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] border ${statusColors[status] || 'text-white/40 bg-white/5'}`}>
            {t(status)}
          </span>
         <p className="font-bold text-white/90 text-sm hidden sm:block">{total}</p>
         <ChevronRight size={18} className="text-white/10 group-hover:text-gold transition-colors" />
      </div>
    </div>
  )
}

export const DashboardContent = ({ profile, activeOrdersCount: initialActive, totalPurchases: initialTotal, recentOrders: initialRecent }: any) => {
  const { t, direction } = useLanguage()
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [invoiceOrder, setInvoiceOrder] = useState<any>(null)

  const [activeOrdersCount, setActiveOrdersCount] = useState(initialActive)
  const [totalPurchases, setTotalPurchases] = useState(initialTotal)
  const [recentOrders, setRecentOrders] = useState(initialRecent)

  useEffect(() => {
    if (!profile?.id) return
    const supabase = createClient()
    const channel = supabase.channel('dashboard-metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${profile.id}` }, async () => {
         // Reload metrics on any change to orders
         const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', profile.id).not('status', 'in', '("delivered","cancelled")')
         setActiveOrdersCount(count)
         
         const { data: purchaseData } = await supabase.from('orders').select('total_price').eq('user_id', profile.id).eq('status', 'delivered')
         const total = purchaseData?.reduce((acc: number, curr: any) => acc + (Number(curr.total_price) || 0), 0) || 0
         setTotalPurchases(total)
         
         const { data: recent } = await supabase.from('orders').select('*, invoices(*), order_items(*, products(name))').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(5)
         setRecentOrders(recent || [])
      })
      .subscribe()
      
    return () => { supabase.removeChannel(channel) }
  }, [profile?.id])

  const handleViewInvoice = (order: any) => {
    setInvoiceOrder(order)
    setSelectedInvoice(order.invoices[0])
  }

  return (
    <div className="space-y-8 animate-fade-in px-4 sm:px-0 relative">
      {selectedInvoice && invoiceOrder && (
        <InvoiceView 
          invoice={selectedInvoice} 
          order={invoiceOrder} 
          onClose={() => {
            setSelectedInvoice(null)
            setInvoiceOrder(null)
          }} 
        />
      )}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
        <div className="flex-1">
           <h1 className="text-3xl font-bold font-arabic gold-text-gradient">{t('welcome_back')}, {profile?.full_name}</h1>
           <div className="flex items-center gap-4 mt-2">
             <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] opacity-50">{t('partner_portal_overview')}</p>
             <Link href="/dashboard/settings" title="Settings" className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-gold/10 hover:text-gold transition-colors text-white/40 hover:border-gold/20">
               <Settings size={14} />
             </Link>
           </div>
        </div>
        
        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right flex flex-col items-end">
             <p className="text-gold font-bold">{profile?.store_name}</p>
             <p className="text-[10px] text-white/30 uppercase">{profile?.wilaya}, {profile?.commune}</p>
          </div>
          <NotificationCenter userId={profile?.id} />
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard 
          label={t('active_orders')} 
          value={activeOrdersCount || 0} 
          icon={<Package size={20} />} 
        />
        <StatCard 
          label={t('total_purchases')} 
          value={`${totalPurchases.toLocaleString()} DZD`} 
          icon={<ShoppingBag size={20} />} 
        />
        <StatCard 
          label={t('refill_status')} 
          value={activeOrdersCount && activeOrdersCount > 0 ? t('in_process') : t('available')} 
          icon={activeOrdersCount && activeOrdersCount > 0 ? <Loader2 size={20} className="animate-spin text-gold" /> : <CheckCircle2 size={20} className="text-gold" />} 
          highlight
        />
      </div>

      {/* Recent Orders History */}
      <div className="glass-card p-8 rounded-[2.5rem] border border-white/5">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold font-arabic">{t('order_history')}</h3>
          <Link href="/dashboard/orders" className="text-gold text-[10px] font-bold uppercase tracking-[0.2em] hover:underline flex items-center gap-2">
            {t('view_details')} <ArrowRight size={14} className={direction === 'rtl' ? 'rotate-180' : ''} />
          </Link>
        </div>
        <div className="space-y-4">
            {recentOrders?.map((order: any) => (
              <RecentOrderRow 
                key={order.id}
                id={`#ORD-${order.id.slice(0, 4).toUpperCase()}`} 
                date={new Date(order.created_at).toLocaleDateString()} 
                status={order.status} 
                total={`${Number(order.total_price).toLocaleString()} DZD`} 
                invoice={order.invoices?.[0]}
                onViewInvoice={() => handleViewInvoice(order)}
              />
            ))}
           {(!recentOrders || recentOrders.length === 0) && (
             <div className="text-center py-12 opacity-20 space-y-4">
               <ShoppingBag size={48} strokeWidth={1} className="mx-auto" />
               <p className="text-sm uppercase tracking-widest">{t('no_order_history_found') || t('no_orders_found')}</p>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}
