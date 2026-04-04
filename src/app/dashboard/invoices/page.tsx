'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { InvoicesList } from '@/components/dashboard/invoices/InvoicesList'
import { useLanguage } from '@/context/LanguageContext'

const ClientInvoices = () => {
  const { t } = useLanguage()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadInvoices() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data } = await supabase
        .from('orders')
        .select('*, invoices(*)')
        .eq('user_id', user?.id)
        .not('invoices', 'is', null)
        .order('created_at', { ascending: false })

      setOrders(data || [])
      setLoading(false)

      // Real-time subscription
      const channel = supabase
        .channel('client-invoices-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'invoices'
          },
          () => {
            // Re-fetch complex query on change to keep it simple and accurate
            loadInvoices()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
    loadInvoices()
  }, [])

  if (loading) return <div className="p-8 text-center text-gold animate-pulse uppercase tracking-[0.3em] text-sm">{t('loading')}</div>

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold font-arabic gold-text-gradient">{t('invoices_title')}</h1>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mt-2">{t('invoices_subtitle')}</p>
      </header>

      <InvoicesList initialOrders={orders as any} />
    </div>
  )
}

export default ClientInvoices
