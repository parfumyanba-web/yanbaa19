import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { InvoicesList } from '@/components/dashboard/invoices/InvoicesList'

const ClientInvoices = async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: orders } = await supabase
    .from('orders')
    .select('*, invoices(*)')
    .eq('user_id', user?.id)
    .not('invoices', 'is', null)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white/90">Invoices & Documents</h1>
        <p className="text-white/40 text-sm">Download and manage your billing history</p>
      </header>

      <InvoicesList initialOrders={(orders || []) as any} />
    </div>
  )
}

export default ClientInvoices
