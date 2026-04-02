import React from 'react'
import { Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AdminOrdersList } from '@/components/admin/orders/AdminOrdersList'

const AdminOrders = async () => {
  const supabase = createClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('*, profiles(full_name, store_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white/90">Orders Management</h1>
          <p className="text-white/40 text-sm">Monitor and process B2B partner orders</p>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white/50 hover:border-gold transition-all">
             <Download size={18} /> Export Excel
           </button>
        </div>
      </header>

      <AdminOrdersList initialOrders={(orders || []) as any} />
    </div>
  )
}

export default AdminOrders
