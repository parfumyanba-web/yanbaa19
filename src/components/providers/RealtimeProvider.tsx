'use client'

import React, { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeStore } from '@/store/useRealtimeStore'
import { useToast } from './ToastProvider'
import { useRouter } from 'next/navigation'

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const supabase = createClient()
  const { addOrder, updateOrder, removeOrder, addInvoice, updateInvoice, setUserProfile, updateProfile } = useRealtimeStore()
  const { showToast } = useToast()
  const router = useRouter()

  useEffect(() => {
    let mounted = true
    const channels: any[] = []

    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (!user || !mounted) return

      // Get user role
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      const isAdmin = profile?.role === 'admin'

      // 1. Orders Subscription
      const ordersChannel = supabase
        .channel('public:orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders', filter: isAdmin ? undefined : `user_id=eq.${user.id}` },
          (payload: any) => {
            if (payload.eventType === 'INSERT') {
              addOrder(payload.new as any)
              if (isAdmin) showToast('New Order', `Order #${payload.new.id.slice(0, 8)} has been placed.`, 'info')
            } else if (payload.eventType === 'UPDATE') {
              updateOrder(payload.new as any)
              if (payload.new.status !== payload.old.status) {
                showToast('Order Update', `Order #${payload.new.id.slice(0, 8)} is now ${payload.new.status.toUpperCase()}.`, 'success')
              }
            }
            router.refresh()
          }
        )
        .subscribe()
      channels.push(ordersChannel)

      // 2. Invoices Subscription
      const invoicesChannel = supabase
        .channel('public:invoices')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'invoices', filter: isAdmin ? undefined : `user_id=eq.${user.id}` },
          (payload: any) => {
            if (payload.eventType === 'INSERT') {
              addInvoice(payload.new as any)
              if (!isAdmin) showToast('Invoice Issued', `A new invoice has been generated for your order.`, 'success')
            } else if (payload.eventType === 'UPDATE') {
              updateInvoice(payload.new as any)
            }
            router.refresh()
          }
        )
        .subscribe()
      channels.push(invoicesChannel)

      // 3. Profiles Subscription 
      const profilesChannel = supabase
        .channel('public:profiles')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles' },
          (payload: any) => {
            updateProfile(payload.new)
            if (payload.new.id === user.id) {
              setUserProfile(payload.new)
              // Logic for account locking removed as per requirements
            }
            router.refresh()
          }
        )
        .subscribe()
      channels.push(profilesChannel)

      // 4. Notifications Subscription
      const notificationsChannel = supabase
        .channel('public:notifications')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload: any) => {
            showToast(payload.new.title, payload.new.message, 'info')
            router.refresh()
          }
        )
        .subscribe()
      channels.push(notificationsChannel)
    }

    setupRealtime()

    return () => {
      mounted = false
      channels.forEach(ch => supabase.removeChannel(ch))
    }
  }, [supabase, router, addOrder, updateOrder, addInvoice, updateInvoice, setUserProfile, updateProfile, showToast])

  return <>{children}</>
}
