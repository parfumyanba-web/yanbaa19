'use client'

import React, { useEffect, useState } from 'react'
import { Bell, X, CheckCircle2, Info, AlertCircle, ShoppingCart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/context/LanguageContext'

export const NotificationCenter = ({ userId }: { userId: string }) => {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()
  const { t, direction } = useLanguage()

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
    setNotifications(data || [])
  }

  useEffect(() => {
    fetchNotifications()

    // Realtime subscription for NEW notifications
    const channel = supabase
      .channel('notifications-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload: any) => {
          setNotifications(prev => [payload.new, ...prev].slice(0, 10))
          // Play a subtle sound or show toast (logic elsewhere)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/30 transition-all text-white/60 hover:text-gold group"
      >
        <Bell size={20} className="group-hover:rotate-12 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 border-2 border-[#121212] rounded-full text-[8px] flex items-center justify-center font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute top-full mt-4 w-80 glass-card rounded-3xl border border-white/10 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 ${direction === 'rtl' ? 'left-0' : 'right-0'}`}>
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h3 className="font-bold text-white/90 font-arabic">{t('notifications') || 'Notifications'}</h3>
            <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors">
               <X size={16} />
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-12 text-center text-white/20">
                <Bell size={32} className="mx-auto mb-4 opacity-50" />
                <p className="text-[10px] uppercase tracking-widest">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => markAsRead(n.id)}
                  className={`p-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer group relative ${!n.read ? 'bg-gold/[0.02]' : 'opacity-60'}`}
                >
                  {!n.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-gold rounded-full" />}
                  <div className="flex gap-4">
                    <div className="mt-1">
                       {getIcon(n.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-bold text-white/90">{n.title}</p>
                      <p className="text-[11px] text-white/40 leading-relaxed font-arabic">{n.message}</p>
                      <p className="text-[9px] text-white/20 uppercase tracking-tighter">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 bg-white/[0.02] text-center border-t border-white/5">
             <button className="text-[10px] text-gold uppercase tracking-[0.2em] font-bold hover:underline">
                View All / عرض الكل
             </button>
          </div>
        </div>
      )}
    </div>
  )
}

const getIcon = (type: string) => {
  switch(type) {
    case 'order_new': return <ShoppingCart size={14} className="text-gold" />
    case 'order_status': return <Info size={14} className="text-blue-400" />
    case 'invoice_new': return <CheckCircle2 size={14} className="text-green-400" />
    case 'payment_update': return <CheckCircle2 size={14} className="text-gold" />
    default: return <Bell size={14} className="text-white/40" />
  }
}
