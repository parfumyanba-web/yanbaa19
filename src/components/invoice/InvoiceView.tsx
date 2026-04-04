'use client'

import React from 'react'
import { useLanguage } from '@/context/LanguageContext'
import { X, Download, Printer, ShoppingBag } from 'lucide-react'
import LuxuryButton from '../ui/LuxuryButton'

interface InvoiceViewProps {
  invoice: any
  order: any
  onClose: () => void
}

const InvoiceView = ({ invoice, order, onClose }: InvoiceViewProps) => {
  const { t, direction } = useLanguage()

  const remaining = invoice.total_amount - invoice.paid_amount

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-[#1a1a1a] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl animate-scale-up">
        {/* Header Control */}
        <div className="absolute top-6 right-6 flex items-center gap-4 z-10 no-print">
           <button onClick={handlePrint} className="p-3 bg-white/5 rounded-full hover:bg-white/10 border border-white/5 transition-all">
             <Printer size={20} className="text-white/60" />
           </button>
           <button onClick={onClose} className="p-3 bg-white/5 rounded-full hover:bg-white/10 border border-white/5 transition-all">
             <X size={20} className="text-white/60" />
           </button>
        </div>

        <div className="p-8 sm:p-12 overflow-y-auto max-h-[90vh] custom-scrollbar" id="printable-invoice">
           {/* Invoice Header */}
           <div className="flex flex-col sm:flex-row justify-between items-start gap-8 border-b border-white/5 pb-12">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center border border-gold/20">
                     <ShoppingBag className="text-gold" />
                   </div>
                   <h1 className="text-3xl font-bold tracking-tighter gold-text-gradient">YANBA PERFUMES</h1>
                 </div>
                 <div className="text-white/40 text-xs space-y-1">
                    <p>Alger, Algérie</p>
                    <p>+213 555 000 000</p>
                    <p>contact@yanba-perfumes.com</p>
                 </div>
              </div>
              <div className="text-right space-y-2">
                 <h2 className="text-5xl font-black text-white/5 uppercase tracking-tighter absolute top-0 right-12 opacity-50">{t('invoice_title')}</h2>
                 <div className="pt-8 space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-white/30">{t('invoice_number')}</p>
                    <p className="text-xl font-bold text-white">{invoice.invoice_number}</p>
                    <p className="text-[10px] uppercase tracking-widest text-white/30 mt-4">{t('invoice_date')}</p>
                    <p className="text-white font-medium">{new Date(invoice.created_at).toLocaleDateString()}</p>
                 </div>
              </div>
           </div>

           {/* Client & Payment Info */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 py-12">
              <div className="space-y-4">
                 <h4 className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">{t('billing_to')}</h4>
                 <div className="space-y-1">
                    <p className="text-xl font-bold text-white/90">{order.shipping_name}</p>
                    <p className="text-white/40 text-sm">{order.shipping_phone}</p>
                    <p className="text-white/40 text-sm leading-relaxed">{order.shipping_address}</p>
                    <p className="text-white/40 text-sm">{order.shipping_wilaya}, {order.shipping_commune}</p>
                 </div>
              </div>
              <div className="text-right space-y-4">
                 <h4 className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">{t('payment_status')}</h4>
                 <div className="flex flex-col items-end gap-2">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border ${getStatusStyle(invoice.status)}`}>
                       {t(invoice.status)}
                    </span>
                    <div className="pt-4 space-y-2">
                       <div className="flex justify-end gap-4 text-sm">
                          <span className="text-white/40">{t('paid_amount')}</span>
                          <span className="text-white font-bold">{invoice.paid_amount.toLocaleString()} DZD</span>
                       </div>
                       <div className="flex justify-end gap-4 text-sm">
                          <span className="text-white/40">{t('remaining_amount')}</span>
                          <span className="text-gold font-bold">{remaining.toLocaleString()} DZD</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Item Table */}
           <div className="mt-8">
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] uppercase tracking-widest text-white/20 border-b border-white/5">
                       <th className="pb-4 font-normal">{t('products')}</th>
                       <th className="pb-4 font-normal text-center">{t('quantity')}</th>
                       <th className="pb-4 font-normal text-right">{t('total_amount')}</th>
                    </tr>
                 </thead>
                 <tbody className="text-sm">
                    {order.order_items?.map((item: any, idx: number) => (
                       <tr key={idx} className="border-b border-white/5 last:border-0 group">
                          <td className="py-6">
                             <p className="font-bold text-white/80 group-hover:text-white transition-colors">{item.products?.name}</p>
                             <p className="text-[10px] text-white/30 uppercase">{item.quantity_label}</p>
                          </td>
                          <td className="py-6 text-center text-white/60">
                             {item.quantity_count}
                          </td>
                          <td className="py-6 text-right font-bold text-white/90">
                             {(item.price_at_time * item.quantity_count).toLocaleString()} DZD
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           {/* Total Bar */}
           <div className="mt-12 pt-8 border-t-2 border-white/5 flex flex-col items-end gap-4">
              <div className="flex items-center gap-12">
                 <span className="text-white/30 uppercase tracking-[0.3em] text-[10px]">{t('total_amount')}</span>
                 <span className="text-4xl font-black text-gold tracking-tighter">{invoice.total_amount.toLocaleString()} DZD</span>
              </div>
           </div>

           {/* Footer Note */}
           <div className="mt-20 text-center opacity-20 no-print">
              <p className="text-[10px] uppercase tracking-[0.5em] font-light">{t('thank_you_message')}</p>
           </div>
        </div>

        {/* Action Bar (No Print) */}
        <div className="p-6 bg-white/5 border-t border-white/10 flex justify-between items-center no-print sm:px-12">
           <p className="text-[10px] text-white/20 uppercase tracking-widest">{t('digital_audit_log')}: {invoice.id.toUpperCase()}</p>
           <LuxuryButton onClick={handlePrint} className="px-8 flex items-center gap-2">
              <Download size={18} />
              {t('download_invoice')}
           </LuxuryButton>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          #printable-invoice { 
            padding: 0 !important; 
            background: white !important; 
            color: black !important;
            min-height: 100vh;
          }
          .glass-card, .bg-[#1a1a1a], .inset-0 { 
            background: white !important; 
            box-shadow: none !important; 
            border: none !important;
          }
          .text-white { color: black !important; }
          .text-white\/90 { color: black !important; }
          .text-white\/40, .text-white\/30, .text-white\/20, .text-white\/10 { color: #555 !important; }
          .gold-text-gradient, .text-gold { color: #8B713A !important; }
          .gold-text-gradient { -webkit-text-fill-color: #8B713A !important; background: none !important; }
          .border, .border-b, .border-t { border-color: #eee !important; }
          tr { break-inside: avoid; }
        }
      `}</style>
    </div>
  )
}

const getStatusStyle = (status: string) => {
  switch(status) {
    case 'unpaid': return 'text-red-400 bg-red-400/10 border-red-400/20'
    case 'partial': return 'text-amber-400 bg-amber-400/10 border-amber-400/20'
    case 'paid': return 'text-green-400 bg-green-400/10 border-green-400/20'
    default: return 'text-white/40 bg-white/5 border-white/10'
  }
}

export default InvoiceView
