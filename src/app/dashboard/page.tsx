import React from 'react'
import { ShoppingBag, ChevronRight, Package, Loader2 } from 'lucide-react'
import { getUserProfile } from '@/lib/auth/utils'

const DashboardOverview = async () => {
  const profile = await getUserProfile()

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold font-arabic gold-text-gradient">أهلاً بك، {profile?.full_name}</h1>
           <p className="text-white/40 text-sm uppercase tracking-widest mt-1">Partner Portal Overview</p>
        </div>
        <div className="text-right hidden sm:block">
           <p className="text-gold font-bold">{profile?.store_name}</p>
           <p className="text-[10px] text-white/30 uppercase">{profile?.wilaya}, {profile?.commune}</p>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
            <Package size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase text-white/40 tracking-wider">Active Orders</p>
            <p className="text-xl font-bold">03</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
            <ShoppingBag size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase text-white/40 tracking-wider">Total Purchases</p>
            <p className="text-xl font-bold">124,500 DZD</p>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4 border-gold/20 bg-gold/5">
          <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center text-gold">
            <Loader2 size={24} className="animate-spin" />
          </div>
          <div>
            <p className="text-[10px] uppercase text-white/40 tracking-wider">Next Refill</p>
            <p className="text-xl font-bold">Confirmed</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-8">
        <h3 className="text-xl font-bold mb-8">Recent Orders</h3>
        <div className="space-y-6">
           <RecentOrderRow id="#ORD-7291" date="2026-04-01" status="pending" total="45,000 DZD" />
           <RecentOrderRow id="#ORD-7290" date="2026-03-28" status="confirmed" total="120,500 DZD" />
           <RecentOrderRow id="#ORD-7289" date="2026-03-15" status="delivered" total="89,000 DZD" />
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
