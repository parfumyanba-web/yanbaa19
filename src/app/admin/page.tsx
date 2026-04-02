import React from 'react'
import { TrendingUp, ShoppingCart, Users, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

const AdminOverview = async () => {
  const supabase = await createClient()

  // 1. Fetch Revenue
  const { data: revenueData } = await supabase
    .from('orders')
    .select('paid_amount')

  const totalRevenue = revenueData?.reduce((acc, curr) => acc + (Number(curr.paid_amount) || 0), 0) || 0

  // 2. Fetch Active Orders
  const { count: activeOrdersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .not('status', 'in', '("delivered","cancelled")')

  // 3. Fetch Partners
  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'client')

  // 4. Fetch Inventory
  const { data: inventoryData } = await supabase
    .from('inventory')
    .select('quantity_in_grams')

  const totalInventoryGrams = inventoryData?.reduce((acc, curr) => acc + (curr.quantity_in_grams || 0), 0) || 0
  const totalInventoryKg = (totalInventoryGrams / 1000).toFixed(1)

  // 5. Fetch Recent Orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-white/90">Dashboard Overview</h1>
        <p className="text-white/40 text-sm">Real-time performance metrics from Supabase</p>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`${totalRevenue.toLocaleString()} DZD`} change="+0%" icon={<DollarSign className="text-gold" />} />
        <StatCard title="Active Orders" value={activeOrdersCount || 0} change="+0%" icon={<ShoppingCart className="text-gold" />} />
        <StatCard title="B2B Partners" value={userCount || 0} change="+0%" icon={<Users className="text-gold" />} />
        <StatCard title="Total Inventory" value={`${totalInventoryKg} Kg`} change="+0%" icon={<TrendingUp className="text-gold" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 glass-card p-8">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-bold">Recent Orders</h3>
             <button className="text-gold text-xs uppercase tracking-widest hover:underline">View All</button>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="text-white/30 text-[10px] uppercase tracking-widest border-b border-white/5">
                   <th className="pb-4 font-normal">Order ID</th>
                   <th className="pb-4 font-normal">Customer</th>
                   <th className="pb-4 font-normal">Amount</th>
                   <th className="pb-4 font-normal">Status</th>
                 </tr>
               </thead>
               <tbody className="text-sm">
                 {recentOrders?.map((order: any) => (
                   <OrderRow 
                     key={order.id} 
                     id={`#${order.id.slice(0, 8)}`} 
                     name={order.profiles?.full_name || 'Unknown'} 
                     amount={`${Number(order.total_price).toLocaleString()} DZD`} 
                     status={order.status} 
                   />
                 ))}
                 {(!recentOrders || recentOrders.length === 0) && (
                   <tr>
                     <td colSpan={4} className="py-8 text-center text-white/20 italic">No orders found</td>
                   </tr>
                 )}
               </tbody>
             </table>
           </div>
        </div>

        {/* Top Products (Placeholder for now) */}
        <div className="glass-card p-8">
           <h3 className="text-xl font-bold mb-8">Best Sellers</h3>
           <div className="space-y-6">
              <TopProduct name="Santal Imperial" category="Oriental" units="450kg" />
              <TopProduct name="Jasmin Doré" category="Floral" units="310kg" />
              <TopProduct name="Oud Noir" category="Woody" units="280kg" />
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
