'use client'

import React, { useEffect, useState } from 'react'
import { TrendingUp, ShoppingCart, Users, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

const AdminOverview = () => {
  const { t } = useLanguage()
  const [metrics, setMetrics] = useState<any>({
    revenue: 0,
    orders: 0,
    partners: 0,
    inventory: 0
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      
      // 1. Revenue
      const { data: rev } = await supabase.from('orders').select('paid_amount')
      const totalRev = rev?.reduce((acc: number, curr: any) => acc + (Number(curr.paid_amount) || 0), 0) || 0

      // 2. Orders
      const { count: ord } = await supabase.from('orders').select('*', { count: 'exact', head: true }).not('status', 'in', '("delivered","cancelled")')

      // 3. Partners
      const { count: prt } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client')

      // 4. Inventory
      const { data: inv } = await supabase.from('inventory').select('quantity_in_grams')
      const totalInv = (inv?.reduce((acc: number, curr: any) => acc + (curr.quantity_in_grams || 0), 0) || 0) / 1000

      // 5. Recent
      const { data: rec } = await supabase.from('orders').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(5)

      // 6. Products
      const { data: prd } = await supabase.from('products').select('*, brands(name), inventory(quantity_in_grams)').limit(3)

      setMetrics({ revenue: totalRev, orders: ord, partners: prt, inventory: totalInv })
      setRecentOrders(rec || [])
      setTopProducts(prd || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div className="h-96 flex items-center justify-center text-gold underline font-bold animate-pulse uppercase tracking-widest">{t('loading')}</div>

  return (
    <div className="space-y-10 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white/90 font-arabic">{t('admin_dashboard')}</h1>
        <p className="text-white/40 text-[10px] uppercase tracking-widest mt-1 opacity-50">{t('dashboard_overview')}</p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('total_amount')} value={`${metrics.revenue.toLocaleString()} DZD`} change="+0%" icon={<DollarSign className="text-gold" />} />
        <StatCard title={t('order_status')} value={metrics.orders || 0} change="+0%" icon={<ShoppingCart className="text-gold" />} />
        <StatCard title={t('partner_portal')} value={metrics.partners || 0} change="+0%" icon={<Users className="text-gold" />} />
        <StatCard title="Inventory" value={`${metrics.inventory.toFixed(1)} Kg`} change="+0%" icon={<TrendingUp className="text-gold" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-bold">{t('no_orders')}</h3>
             <Link href="/admin/orders" className="text-gold text-xs uppercase tracking-widest hover:underline">{t('view_details')}</Link>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="text-white/30 text-[10px] uppercase tracking-widest border-b border-white/5">
                   <th className="pb-4 font-normal">{t('order_ref')}</th>
                   <th className="pb-4 font-normal">{t('full_name')}</th>
                   <th className="pb-4 font-normal">{t('total_amount')}</th>
                   <th className="pb-4 font-normal">{t('order_status')}</th>
                 </tr>
               </thead>
               <tbody className="text-sm">
                 {recentOrders.map((order: any) => (
                   <OrderRow 
                     key={order.id} 
                     id={`#${order.id.slice(0, 8)}`} 
                     name={order.profiles?.full_name || '...'} 
                     amount={`${Number(order.total_price).toLocaleString()} DZD`} 
                     status={order.status} 
                   />
                 ))}
               </tbody>
             </table>
           </div>
        </div>

        <div className="glass-card p-8">
           <h3 className="text-xl font-bold mb-8">Stock</h3>
           <div className="space-y-6">
              {topProducts.map((item: any) => (
                <TopProduct 
                  key={item.id}
                  name={item.name} 
                  category={item.brands?.name || '...'} 
                  units={`${((item.inventory?.[0]?.quantity_in_grams || 0) / 1000).toFixed(1)}kg`} 
                />
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ title, value, change, icon }: any) => (
  <div className="glass-card p-6 space-y-4">
    <div className="flex justify-between items-center">
      <div className="p-3 bg-gold/10 rounded-xl">{icon}</div>
      <span className={`text-xs font-bold flex items-center ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
        {change} {change.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      </span>
    </div>
    <div>
      <p className="text-white/40 text-xs uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-bold mt-1 tracking-tight text-white/90">{value}</p>
    </div>
  </div>
)

const OrderRow = ({ id, name, amount, status }: any) => {
  const statusColors: any = {
    pending: "text-amber-400 bg-amber-400/10",
    confirmed: "text-blue-400 bg-blue-400/10",
    shipped: "text-purple-400 bg-purple-400/10",
    delivered: "text-green-400 bg-green-400/10"
  }
  
  return (
    <tr className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors group">
      <td className="py-4 font-medium text-white/60">{id}</td>
      <td className="py-4 text-white/80">{name}</td>
      <td className="py-4 font-bold text-gold">{amount}</td>
      <td className="py-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[status] || 'text-white/40 bg-white/5'}`}>
          {status}
        </span>
      </td>
    </tr>
  )
}

const TopProduct = ({ name, category, units }: any) => (
  <div className="flex items-center gap-4 group">
    <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center font-bold text-gold group-hover:border-gold/50 transition-colors">
      {name[0]}
    </div>
    <div className="flex-1">
      <p className="text-sm font-bold text-white/90">{name}</p>
      <p className="text-[10px] uppercase text-white/30">{category}</p>
    </div>
    <p className="text-gold font-bold text-sm tracking-tight">{units}</p>
  </div>
)

export default AdminOverview
