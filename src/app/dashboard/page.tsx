import React from 'react'
import { ShoppingBag, ChevronRight, Package, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const DashboardOverview = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 2. Fetch Stats
  const { count: activeOrdersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .not('status', 'in', '("delivered","cancelled")')

  const { data: purchaseData } = await supabase
    .from('orders')
    .select('total_price')
    .eq('user_id', user.id)
    .eq('status', 'delivered')

  const totalPurchases = purchaseData?.reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0) || 0

  // 3. Fetch Recent Orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8 animate-fade-in px-4 sm:px-0">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold font-arabic gold-text-gradient">أهلاً بك، {profile?.full_name}</h1>
           <p className="text-white/40 text-sm uppercase tracking-widest mt-1">Partner Portal Overview</p>
        </div>
        <div className="text-right flex flex-col items-end">
           <p className="text-gold font-bold">{profile?.store_name}</p>
           <p className="text-[10px] text-white/30 uppercase">{profile?.wilaya}, {profile?.commune}</p>
        </div>
      </header>

      {/* Quick Stats (Real Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
            <Package size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase text-white/40 tracking-wider">Active Orders</p>
            <p className="text-xl font-bold">{activeOrdersCount || 0}</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase text-white/40 tracking-wider">Total Purchases</p>
            <p className="text-xl font-bold">{totalPurchases.toLocaleString()} DZD</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4 border-gold/20 bg-gold/5">
          <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center text-gold">
            <Loader2 size={24} className={activeOrdersCount && activeOrdersCount > 0 ? "animate-spin" : ""} />
          </div>
          <div>
            <p className="text-[10px] uppercase text-white/40 tracking-wider">Refill Status</p>
            <p className="text-xl font-bold">{activeOrdersCount && activeOrdersCount > 0 ? "In Process" : "Available"}</p>
          </div>
        </div>
      </div>

      {/* Recent Orders History (Real Data) */}
      <div className="glass-card p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold">Recent Orders</h3>
          <Link href="/dashboard/orders" className="text-gold text-xs uppercase tracking-widest hover:underline">View All</Link>
        </div>
        <div className="space-y-6">
           {recentOrders?.map((order: any) => (
             <RecentOrderRow 
               key={order.id}
               id={`#ORD-${order.id.slice(0, 4).toUpperCase()}`} 
               date={new Date(order.created_at).toLocaleDateString()} 
               status={order.status} 
               total={`${Number(order.total_price).toLocaleString()} DZD`} 
             />
           ))}
           {(!recentOrders || recentOrders.length === 0) && (
             <p className="text-white/20 italic text-center py-8">No order history found</p>
           )}
        </div>
      </div>
    </div>
  )
}

const RecentOrderRow = ({ id, date, status, total }: any) => {
  const statusColors: any = {
    pending: "text-amber-400",
    confirmed: "text-blue-400",
    shipped: "text-purple-400",
    delivered: "text-green-400"
  }
  
  return (
    <div className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-4 rounded-xl transition-all border border-transparent hover:border-white/5">
      <div className="flex items-center gap-6">
        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center font-bold text-white/20 group-hover:text-gold transition-colors">
          #{id.slice(-4)}
        </div>
        <div>
          <p className="font-bold text-white/80">{id}</p>
          <p className="text-[10px] text-white/30 uppercase">{date}</p>
        </div>
      </div>
      <div className="text-right flex items-center gap-8">
         <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${statusColors[status]}`}>{status}</span>
         <p className="font-bold text-white/90">{total}</p>
         <ChevronRight size={18} className="text-white/20 group-hover:text-gold transition-colors" />
      </div>
    </div>
  )
}

export default DashboardOverview
