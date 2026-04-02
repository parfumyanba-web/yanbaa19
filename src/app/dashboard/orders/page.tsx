import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { OrdersList } from '@/components/dashboard/orders/OrdersList'

const ClientOrders = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white/90">Order History</h1>
        <p className="text-white/40 text-sm">Track your shipments and order status</p>
      </header>

      <OrdersList initialOrders={(orders || []) as any} />
    </div>
  )
}

export default ClientOrders
