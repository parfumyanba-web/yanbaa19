'use client'

import React, { useEffect, useState } from 'react'
import { FileText, Download, ExternalLink, Calendar } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

interface Invoice {
  id: string
  order_id: string
  pdf_url: string
  status: string
  created_at: string
}

interface OrderWithInvoice {
  id: string
  total_price: number
  created_at: string
  invoices: Invoice[]
}

export const InvoicesList = ({ initialOrders }: { initialOrders: OrderWithInvoice[] }) => {
  const { t } = useLanguage()
  const [orders, setOrders] = useState<OrderWithInvoice[]>([])

  useEffect(() => {
    if (initialOrders) setOrders(initialOrders)
  }, [initialOrders])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {orders && orders.length > 0 ? (
        orders.map((order) => (
           <div key={order.id} className="glass-card p-6 flex items-start gap-6 group hover:border-gold/30 transition-all bg-white/2">
              <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-gold transition-all border border-white/10 group-hover:border-gold/30">
                <FileText size={24} />
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white/90">#{order.id.slice(0, 8)} - {t('invoice_label')}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest mt-1">
                      <Calendar size={10} /> {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="text-gold font-bold text-sm tracking-tighter">{order.total_price} {t('price_dzd')}</span>
                </div>

                <div className="flex gap-2 pt-4 border-t border-white/5">
                   <button className="flex-1 flex items-center justify-center gap-2 bg-gold/10 hover:bg-gold hover:text-black transition-all py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-gold shadow-lg shadow-gold/5">
                     <Download size={14} /> {t('download_pdf')}
                   </button>
                   <button className="px-4 py-2 bg-white/5 hover:bg-white/10 transition-all rounded-lg text-white/40">
                      <ExternalLink size={14} />
                   </button>
                </div>
              </div>
           </div>
        ))
      ) : (
        <div className="col-span-full py-20 text-center glass-card border-dashed border-white/10">
          <FileText size={48} className="mx-auto text-white/5 mb-4" />
          <p className="text-white/20 uppercase tracking-[2em] text-[10px]">{t('vault_empty')}</p>
        </div>
      )}
    </div>
  )
}
