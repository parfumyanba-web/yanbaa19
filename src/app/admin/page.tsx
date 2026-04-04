'use client'

import React, { useEffect, useState } from 'react'
import { TrendingUp, ShoppingCart, Users, DollarSign, ArrowUpRight, ArrowDownRight, Package, CheckCircle2, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { updateOrderStatus, updateOrderPayment } from '@/actions/orders'
import { generateInvoice, updateInvoicePayment } from '@/actions/invoices'
import InvoiceView from '@/components/invoice/InvoiceView'
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard'
import ActivityFeed from '@/components/admin/ActivityFeed'

const AdminOverview = () => {
  const { t } = useLanguage()
  const [user, setUser] = useState<any>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [invoiceOrder, setInvoiceOrder] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>({
    revenue: 0,
    orders: 0,
    partners: 0,
    inventory: 0
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [allOrders, setAllOrders] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const supabase = createClient()
    
    const { data: { user: authUser }, error: userError } = await supabase.auth.getUser()
    if (userError || !authUser) {
      console.error('Auth error:', userError)
      return
    }
    setUser(authUser)

    try {
      // 1. Metrics & Data for Analytics
      const { data: allOrd, error: ordsErr } = await supabase.from('orders').select('*, profiles(full_name), invoices(*)').order('created_at', { ascending: false })
      if (ordsErr) throw ordsErr

      const totalRev = allOrd?.reduce((acc: number, curr: any) => acc + (Number(curr.paid_amount) || 0), 0) || 0

      // 2. Active Orders Count (pending, confirmed, shipped)
      const activeOrds = allOrd?.filter((o: any) => !['delivered', 'cancelled'].includes(o.status)) || []
      const ordCount = activeOrds.length

      // 3. Partners
      const { count: prtCount, error: prtErr } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client')
      if (prtErr) throw prtErr

      // 4. Inventory Volume
      const { data: inv, error: invErr } = await supabase.from('inventory').select('quantity_in_grams')
      if (invErr) throw invErr
      const totalInv = (inv?.reduce((acc: number, curr: any) => acc + (curr.quantity_in_grams || 0), 0) || 0) / 1000

      // 5. Recent Activity Feed
      const { data: act, error: actErr } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(6)
      if (actErr) throw actErr

      // 6. Top/Low Stock Products
      const { data: prd, error: prdErr } = await supabase.from('products').select('*, brands(name), inventory(quantity_in_grams)').order('created_at', { ascending: false }).limit(4)
      if (prdErr) throw prdErr

      setMetrics({ revenue: totalRev, orders: ordCount, partners: prtCount, inventory: totalInv })
      setAllOrders(allOrd || [])
      setRecentOrders(allOrd?.slice(0, 6) || [])
      setActivities(act || [])
      setTopProducts(prd || [])
    } catch (err: any) {
      console.error('[Admin Dashboard] Fetch Error:', err.message)
      // We don't alert here to avoid spamming, but we ensure loading is false
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateInvoice = async (orderId: string) => {
    const res = await generateInvoice(orderId)
    if (res.success) {
      alert(t('invoice_success'))
      fetchData()
    } else {
      alert(res.error)
    }
  }

  const handleViewInvoice = (order: any) => {
    setInvoiceOrder(order)
    setSelectedInvoice(order.invoices[0])
  }

  useEffect(() => {
    fetchData()
    const supabase = createClient()
    const channel = supabase.channel('admin-dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchData())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleStatusUpdate = async (id: string, currentStatus: string) => {
    const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
    const nextIndex = (statuses.indexOf(currentStatus) + 1) % statuses.length
    const nextStatus = statuses[nextIndex]
    
    const res = await updateOrderStatus(id, nextStatus)
    if (res.success) fetchData()
  }

  const handlePaymentUpdate = async (id: string, fullAmount: number, invoiceId?: string) => {
    const amountStr = prompt(t('enter_paid_amount'), fullAmount.toString())
    if (amountStr !== null) {
      const amount = parseFloat(amountStr)
      if (!isNaN(amount)) {
        if (invoiceId) {
          await updateInvoicePayment(invoiceId, amount)
        } else {
          await updateOrderPayment(id, amount)
        }
        fetchData()
      }
    }
  }

  if (loading) return <div className="h-96 flex items-center justify-center text-gold underline font-bold animate-pulse uppercase tracking-[0.3em] font-arabic">{t('loading')}</div>

  return (
    <div className="space-y-12 animate-fade-in relative">
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
      <header>
        <h1 className="text-4xl font-bold text-white/90 font-arabic gold-text-gradient">{t('admin_dashboard')}</h1>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mt-2 opacity-50">{t('dashboard_overview')}</p>
      </header>


      {/* 1. Main Analytics & Activity Section */}
      <div className="space-y-12">
        <AnalyticsDashboard orderData={allOrders} revenueData={allOrders} />
        
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
          <div className="xl:col-span-3">
             <ActivityFeed activities={activities} />
          </div>
          <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 h-fit text-center space-y-6">
             <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center text-gold mx-auto animate-pulse">
                <Bell size={24} />
             </div>
              <div>
                <h4 className="text-lg font-bold">{t('smart_alerts')}</h4>
                <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2 leading-relaxed">{t('notifications_sync')}</p>
             </div>
          </div>
        </div>
      </div>

      {/* 2. Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={t('revenue')} value={`${metrics.revenue.toLocaleString()} DZD`} change="+5.2%" icon={<DollarSign size={20} />} />
        <StatCard title={t('order_status')} value={metrics.orders || 0} change="+12%" icon={<ShoppingCart size={20} />} />
        <StatCard title={t('active_partners')} value={metrics.partners || 0} change="+2" icon={<Users size={20} />} />
        <StatCard title={t('total_inventory')} value={`${metrics.inventory.toFixed(1)} Kg`} change="-0.4%" icon={<TrendingUp size={20} />} />
      </div>

      {/* 3. Detailed Management Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 glass-card p-8 rounded-[2.5rem] border border-white/5">
           <div className="flex items-center justify-between mb-10">
             <h3 className="text-2xl font-bold font-arabic tracking-tight border-l-4 border-gold pl-4 uppercase">{t('recent_transactions')}</h3>
             <Link href="/admin/orders" className="bg-white/5 px-6 py-2 rounded-xl text-gold text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center gap-2">
               {t('view_details')} <ArrowUpRight size={14} />
             </Link>
           </div>
           
           <div className="space-y-4">
              {recentOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5 group">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center font-bold text-white/20 group-hover:text-gold transition-all">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-white/90">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-[10px] text-white/30 uppercase tracking-tighter">{order.profiles?.full_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                      <p className="font-bold text-gold text-sm">{Number(order.total_price).toLocaleString()} DZD</p>
                    </div>
                    
                    {order.invoices && order.invoices.length > 0 ? (
                      <button 
                        onClick={() => handleViewInvoice(order)}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/40 hover:text-gold transition-colors text-[9px] uppercase tracking-widest font-bold"
                      >
                        {t('view_invoice')}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleGenerateInvoice(order.id)}
                        className="px-3 py-1.5 bg-gold/10 border border-gold/20 rounded-lg text-gold hover:bg-gold/20 transition-all text-[9px] uppercase tracking-widest font-bold"
                      >
                        {t('generate_invoice')}
                      </button>
                    )}

                    <button 
                      onClick={() => handleStatusUpdate(order.id, order.status)}
                      className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-[0.1em] border transition-all ${getStatusStyle(order.status)}`}
                    >
                      {t(order.status)}
                    </button>
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 h-fit">
           <h3 className="text-2xl font-bold font-arabic tracking-tight border-l-4 border-gold pl-4 uppercase mb-10">{t('stock')}</h3>
           <div className="space-y-8">
              {topProducts.map((item: any) => (
                <TopProduct 
                  key={item.id}
                  name={item.name} 
                  category={item.brands?.name || '...'} 
                  units={`${((item.inventory?.[0]?.quantity_in_grams || 0) / 1000).toFixed(1)}kg`} 
                  isLow={(item.inventory?.[0]?.quantity_in_grams || 0) < 5000}
                  t={t}
                />
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}

const getStatusStyle = (status: string) => {
  switch(status) {
    case 'pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    case 'confirmed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    case 'shipped': return 'text-purple-400 bg-purple-400/10 border-purple-400/20'
    case 'delivered': return 'text-green-400 bg-green-400/10 border-green-400/20'
    default: return 'text-white/40 bg-white/5 border-white/10'
  }
}

const StatCard = ({ title, value, change, icon }: any) => (
  <div className="glass-card p-8 space-y-6 rounded-[2.5rem] border border-white/5 group hover:border-gold/20 transition-all">
    <div className="flex justify-between items-center">
      <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className={`text-[10px] font-bold flex items-center gap-1 ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
        {change} {change.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      </span>
    </div>
    <div>
      <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold mb-1">{title}</p>
      <p className="text-3xl font-bold tracking-tight text-white/90">{value}</p>
    </div>
  </div>
)

const TopProduct = ({ name, category, units, isLow }: any) => {
  const { t } = useLanguage()
  return (
    <div className="flex items-center gap-6 group">
    <div className={`w-14 h-14 bg-white/5 rounded-2xl border flex items-center justify-center font-bold transition-all ${isLow ? 'border-red-500/20 text-red-500' : 'border-white/10 text-gold group-hover:border-gold/30'}`}>
      {name[0]}
    </div>
    <div className="flex-1">
      <p className="text-sm font-bold text-white/90 line-clamp-1">{name}</p>
      <p className="text-[10px] uppercase text-white/30 tracking-widest">{category}</p>
    </div>
    <div className="text-right">
      <p className={`font-bold text-sm tracking-tight ${isLow ? 'text-red-400' : 'text-gold'}`}>{units}</p>
      {isLow && <p className="text-[8px] text-red-500/60 uppercase font-black tracking-tighter">{t('low_stock_label')}</p>}
    </div>
  </div>
  )
}

export default AdminOverview
