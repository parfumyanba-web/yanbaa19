'use client'

import React from 'react'
import { Package, User, CreditCard, Bell, ArrowUpRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityFeedProps {
  activities: any[]
}

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  return (
    <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-8">
       <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold font-arabic tracking-tight border-l-4 border-gold pl-4 uppercase">Live Activity</h3>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_green]" />
       </div>

       <div className="space-y-6">
          {activities.length === 0 ? (
            <div className="text-center py-12 opacity-20">
               <Bell size={40} className="mx-auto mb-4" />
               <p className="text-[10px] uppercase tracking-widest">Awaiting Events...</p>
            </div>
          ) : (
            activities.map((item, idx) => (
              <div key={idx} className="flex gap-4 group cursor-default">
                 <div className="mt-1 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-gold/30 transition-all">
                    {getIcon(item.type)}
                 </div>
                 <div className="flex-1 space-y-1">
                    <p className="text-xs text-white/80 leading-tight">
                       <span className="font-bold text-gold">{item.title}</span> {item.message}
                    </p>
                    <p className="text-[9px] text-white/20 uppercase tracking-tighter">
                       {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </p>
                 </div>
              </div>
            ))
          )}
       </div>
    </div>
  )
}

const getIcon = (type: string) => {
  switch(type) {
    case 'order_new': return <Package size={14} className="text-gold" />
    case 'order_status': return <ArrowUpRight size={14} className="text-blue-400" />
    case 'invoice_new': return <CreditCard size={14} className="text-green-400" />
    default: return <Bell size={14} className="text-white/20" />
  }
}

export default ActivityFeed
