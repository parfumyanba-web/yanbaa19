import React from 'react'
import { Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AdminOrdersList } from '@/components/admin/orders/AdminOrdersList'

const AdminOrders = async () => {
  const supabase = await createClient()
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
           {/* Export handled inside AdminOrdersList for filtered data access */}
        </div>
      </header>

      <AdminOrdersList initialOrders={(orders || []) as any} />
    </div>
  )
}

export default AdminOrders
