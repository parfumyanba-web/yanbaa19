'use client'

import React from 'react'
import { OrdersList } from '@/components/dashboard/orders/OrdersList'
import { useLanguage } from '@/context/LanguageContext'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const ClientOrders = () => {
  const { t } = useLanguage()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name)), invoices(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      setOrders(data || [])
      setLoading(false)

      // Real-time subscription for order updates
      const channel = supabase
        .channel('client-orders-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${user?.id}`,
          },
          (payload: any) => {
            if (payload.eventType === 'INSERT') {
              setOrders(prev => [payload.new as any, ...prev])
            } else if (payload.eventType === 'UPDATE') {
              setOrders(prev => prev.map(o => o.id === (payload.new as any).id ? payload.new as any : o))
            } else if (payload.eventType === 'DELETE') {
              setOrders(prev => prev.filter(o => o.id !== (payload.old as any).id))
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
    loadOrders()
  }, [])

  if (loading) return <div className="p-8 text-center text-gold animate-pulse uppercase tracking-[0.3em] text-sm">{t('loading')}</div>

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold font-arabic gold-text-gradient">{t('order_history_title')}</h1>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mt-2">{t('order_history_subtitle')}</p>
      </header>

      <OrdersList initialOrders={orders as any} />
    </div>
  )
}

export default ClientOrders
