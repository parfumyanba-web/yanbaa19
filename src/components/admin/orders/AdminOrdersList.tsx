'use client'

import React, { useEffect, useState } from 'react'
import { Search, Eye, CheckCircle, Truck, Package, XCircle, DollarSign, FileText, Download } from 'lucide-react'
import { useRealtimeStore } from '@/store/useRealtimeStore'
import { updateOrderStatus, updateOrderPayment, getOrderItems } from '@/actions/orders'
import { generateInvoice } from '@/actions/invoices'
import { clsx } from 'clsx'
import { exportToExcel } from '@/lib/utils/exportUtils'
import { resolveProductImage } from '@/lib/utils/imageUtils'

interface Order {
  id: string
  user_id: string
  status: string
  total_price: number
  paid_amount: number
  created_at: string
  profiles?: {
    full_name: string
    store_name: string
  }
}

export const AdminOrdersList = ({ initialOrders }: { initialOrders: Order[] }) => {
  const { orders, setOrders, updateOrder } = useRealtimeStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [selectedOrderItems, setSelectedOrderItems] = useState<any[]>([])
  const [isLoadingItems, setIsLoadingItems] = useState(false)

  const handleViewDetails = async (order: Order) => {
    setSelectedOrder(order)
    setIsLoadingItems(true)
    const items = await getOrderItems(order.id)
    setSelectedOrderItems(items)
    setIsLoadingItems(false)
  }

  useEffect(() => {
    if (initialOrders) setOrders(initialOrders)
  }, [initialOrders, setOrders])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.profiles?.store_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus ? order.status === filterStatus : true
    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = async (id: string, newStatus: any) => {
    const res = await updateOrderStatus(id, newStatus)
    if (res.success) {
      updateOrder({ id, status: newStatus })
    }
  }

  const handlePaymentUpdate = async (id: string, total: number) => {
    const amount = prompt('Enter paid amount:', total.toString())
    if (amount !== null) {
      const paid = parseFloat(amount)
      const res = await updateOrderPayment(id, paid)
      if (res.success) {
        updateOrder({ id, paid_amount: paid })
      }
    }
  }

  const handleGenerateInvoice = async (id: string) => {
    const res = await generateInvoice(id)
    if (res.success) {
      alert('Invoice generated successfully!')
    }
  }

  const handleExport = () => {
    const dataToExport = filteredOrders.map(o => ({
      ID: o.id,
      Date: new Date(o.created_at).toLocaleDateString(),
      Customer: o.profiles?.full_name,
      Store: o.profiles?.store_name,
      'Total Price': o.total_price,
      'Paid Amount': o.paid_amount,
      Status: o.status
    }))
    exportToExcel(dataToExport, `Orders_Export_${new Date().toISOString().split('T')[0]}`)
  }

  return (
    <div className="space-y-8">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center glass-card p-4">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text" 
            placeholder="Search orders by ID or Customer..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-gold/50 transition-colors text-sm text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['pending', 'confirmed', 'shipped', 'delivered'].map(s => (
            <button 
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? null : s)}
              className={clsx(
                "px-4 py-2 rounded-xl border text-[10px] transition-all whitespace-nowrap uppercase tracking-widest flex-1 md:flex-none",
                filterStatus === s ? "border-gold text-gold bg-gold/5" : "border-white/5 text-white/40 hover:border-white/20"
              )}
            >
              {s}
            </button>
          ))}
          <button 
            onClick={handleExport}
            className="px-4 py-2 rounded-xl border border-gold/20 text-gold hover:bg-gold/5 transition-all text-[10px] uppercase tracking-widest flex items-center gap-2 flex-1 md:flex-none"
          >
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-white/30 text-[10px] uppercase tracking-widest border-b border-white/5 bg-white/5">
              <th className="px-8 py-5 font-normal">Order & Date</th>
              <th className="px-8 py-5 font-normal">Customer / Store</th>
              <th className="px-8 py-5 font-normal">Total Price</th>
              <th className="px-8 py-5 font-normal">Paid Amount</th>
              <th className="px-8 py-5 font-normal text-center">Status</th>
              <th className="px-8 py-5 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="font-bold text-white/90">#{order.id.slice(0, 8)}</div>
                    <div className="text-[10px] text-white/30 mt-1 uppercase tracking-tighter">
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-medium text-white/80">{order.profiles?.full_name}</div>
                    <div className="text-[10px] text-gold uppercase tracking-widest">{order.profiles?.store_name}</div>
                  </td>
                  <td className="px-8 py-5 font-bold text-white/90">{Number(order.total_price).toLocaleString()} DZD</td>
                  <td className="px-8 py-5">
                     <div className="flex items-center gap-2">
                       <span className={clsx(
                         "font-bold transition-all duration-500",
                         order.paid_amount >= order.total_price ? 'text-green-400' : 'text-amber-400'
                       )}>
                         {Number(order.paid_amount).toLocaleString()} DZD
                       </span>
                       <button onClick={() => handlePaymentUpdate(order.id, order.total_price)} className="p-1 hover:text-gold text-white/20 transition-colors">
                         <DollarSign size={14} />
                       </button>
                     </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {order.status === 'pending' && (
                        <ActionButton icon={<CheckCircle size={16} />} color="text-blue-400" onClick={() => handleStatusUpdate(order.id, 'confirmed')} title="Confirm" />
                      )}
                      {order.status === 'confirmed' && (
                        <ActionButton icon={<Truck size={16} />} color="text-purple-400" onClick={() => handleStatusUpdate(order.id, 'shipped')} title="Ship" />
                      )}
                      {order.status === 'shipped' && (
                        <ActionButton icon={<Package size={16} />} color="text-green-400" onClick={() => handleStatusUpdate(order.id, 'delivered')} title="Deliver" />
                      )}
                      <ActionButton icon={<FileText size={16} />} color="text-gold" onClick={() => handleGenerateInvoice(order.id)} title="Invoice" />
                      <button 
                        onClick={() => handleViewDetails(order)}
                        className="gold-gradient p-2 rounded-lg text-black hover:scale-110 transition-all shadow-lg shadow-gold/20 ml-2"
                      >
                         <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center text-white/20 uppercase tracking-widest italic">
                   No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Enhanced Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col border-gold/20 shadow-2xl shadow-gold/10">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-gold/5">
              <div>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full gold-gradient animate-pulse" />
                   <h3 className="text-2xl font-bold tracking-tighter text-white">Order Details #{selectedOrder.id.slice(0, 8)}</h3>
                </div>
                <p className="text-xs text-white/40 uppercase tracking-widest mt-1">
                  {selectedOrder.profiles?.full_name} • {selectedOrder.profiles?.store_name}
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-white/40 hover:text-white border border-white/5"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              {isLoadingItems ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                   <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
                   <p className="text-xs uppercase tracking-[0.2em] text-white/20">Loading order items...</p>
                </div>
              ) : (
                <div className="space-y-6">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/5">
                            <th className="pb-4 font-normal">Product</th>
                            <th className="pb-4 font-normal text-center">Format</th>
                            <th className="pb-4 font-normal text-center">Qty</th>
                            <th className="pb-4 font-normal text-right">Unit Price</th>
                            <th className="pb-4 font-normal text-right">Subtotal</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                         {selectedOrderItems.map((item, idx) => (
                            <tr key={idx} className="group">
                               <td className="py-4">
                                  <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex-shrink-0">
                                        <img 
                                          src={resolveProductImage(item.products?.image_url)} 
                                          className="w-full h-full object-cover" 
                                          alt="" 
                                        />
                                     </div>
                                     <span className="font-bold text-white/90 group-hover:text-gold transition-colors">{item.products?.name}</span>
                                  </div>
                               </td>
                               <td className="py-4 text-center text-xs text-white/40 uppercase tracking-widest">{item.quantity_label}</td>
                               <td className="py-4 text-center text-white/60 font-medium">{item.quantity_count}</td>
                               <td className="py-4 text-right text-xs text-white/40">{Number(item.price_at_time).toLocaleString()} DZD</td>
                               <td className="py-4 text-right font-bold text-white">{(item.price_at_time * item.quantity_count).toLocaleString()} DZD</td>
                            </tr>
                         ))}
                      </tbody>
                   </table>

                   <div className="flex flex-col items-end gap-2 pt-6 border-t-2 border-white/5">
                      <div className="flex justify-between w-64 text-sm">
                         <span className="text-white/40 font-medium">Order Total</span>
                         <span className="text-white font-black">{Number(selectedOrder.total_price).toLocaleString()} DZD</span>
                      </div>
                      <div className="flex justify-between w-64 text-sm">
                         <span className="text-white/40 font-medium">Already Paid</span>
                         <span className="text-green-400 font-bold">{Number(selectedOrder.paid_amount).toLocaleString()} DZD</span>
                      </div>
                      <div className="flex justify-between w-64 mt-2">
                         <span className="text-[10px] uppercase tracking-widest text-gold font-bold">Remaining Balance</span>
                         <span className="text-2xl font-black text-gold tracking-tighter">
                            {(selectedOrder.total_price - selectedOrder.paid_amount).toLocaleString()} DZD
                         </span>
                      </div>
                   </div>
                </div>
              )}
            </div>
            
            <div className="p-8 border-t border-white/10 flex justify-between bg-white/5 items-center">
               <p className="text-[10px] text-white/20 uppercase tracking-widest italic font-light">Digital Fulfillment Audit Log Attached</p>
               <button 
                onClick={() => setSelectedOrder(null)}
                className="px-10 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] uppercase tracking-[0.3em] font-bold text-white/60 transition-all border border-white/5 hover:text-white"
               >
                 Close Dashboard
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const OrderStatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    pending: "text-amber-400 border-amber-400/30 bg-amber-400/5",
    confirmed: "text-blue-400 border-blue-400/30 bg-blue-400/5",
    shipped: "text-purple-400 border-purple-400/30 bg-purple-400/5",
    delivered: "text-green-400 border-green-400/30 bg-green-400/5",
    cancelled: "text-red-400 border-red-400/30 bg-red-400/5"
  }
  return (
    <span className={clsx(
      "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-500",
      styles[status] || "text-white/40 border-white/10"
    )}>
      {status}
    </span>
  )
}

const ActionButton = ({ icon, color, onClick, title }: any) => (
  <button 
    onClick={onClick}
    title={title}
    className={clsx(
      "p-2 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-all",
      color
    )}
  >
    {icon}
  </button>
)
