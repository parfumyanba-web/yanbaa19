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
    const setupRealtime = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Orders Subscription
      const ordersChannel = supabase
        .channel('public:orders')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              addOrder(payload.new as any)
              showToast('New Order', `Order #${payload.new.id.slice(0, 8)} has been placed.`, 'info')
            } else if (payload.eventType === 'UPDATE') {
              updateOrder(payload.new as any)
              if (payload.new.status !== payload.old.status) {
                showToast('Order Update', `Order #${payload.new.id.slice(0, 8)} is now ${payload.new.status.toUpperCase()}.`, 'success')
              }
            } else if (payload.eventType === 'DELETE') {
              removeOrder(payload.old.id as string)
            }
          }
        )
        .subscribe()

      // 2. Invoices Subscription
      const invoicesChannel = supabase
        .channel('public:invoices')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'invoices' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              addInvoice(payload.new as any)
              showToast('Invoice Issued', `A new invoice has been generated for your order.`, 'success')
            } else if (payload.eventType === 'UPDATE') {
              updateInvoice(payload.new as any)
            }
          }
        )
        .subscribe()

      // 3. Profiles Subscription 
      const profilesChannel = supabase
        .channel('public:profiles')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles' },
          (payload) => {
            // Update the store for any profile change (useful for admin list)
            updateProfile(payload.new)

            // If it's the current user, check for freeze
            if (payload.new.id === user.id) {
              setUserProfile(payload.new)
              if (payload.new.is_active === false) {
                showToast('Account Locked', 'Your account has been deactivated. Contact administration.', 'error')
                supabase.auth.signOut().then(() => {
                  router.push('/login?error=account_locked')
                })
              }
            }
          }
        )
        .subscribe()

      // 4. Notifications Subscription
      const notificationsChannel = supabase
        .channel(`public:notifications:user_id=eq.${user.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload) => {
            showToast('Notification', payload.new.message, payload.new.type as any)
          }
        )
        .subscribe()

      return () => {
        ordersChannel.unsubscribe()
        invoicesChannel.unsubscribe()
        profilesChannel.unsubscribe()
        notificationsChannel.unsubscribe()
      }
    }

    setupRealtime()
  }, []) // Initialize once on mount

  return <>{children}</>
}
