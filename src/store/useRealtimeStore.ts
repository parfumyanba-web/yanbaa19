import { create } from 'zustand'

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

interface Invoice {
  id: string
  order_id: string
  pdf_url: string
  status: string
  created_at: string
}

interface RealtimeStore {
  orders: Order[]
  invoices: Invoice[]
  profiles: any[]
  userProfile: any | null
  setOrders: (orders: Order[]) => void
  addOrder: (order: Order) => void
  updateOrder: (order: Partial<Order> & { id: string }) => void
  removeOrder: (id: string) => void
  setInvoices: (invoices: Invoice[]) => void
  addInvoice: (invoice: Invoice) => void
  updateInvoice: (invoice: Partial<Invoice> & { id: string }) => void
  setProfiles: (profiles: any[]) => void
  updateProfile: (profile: any) => void
  setUserProfile: (profile: any) => void
}

export const useRealtimeStore = create<RealtimeStore>((set) => ({
  orders: [],
  invoices: [],
  profiles: [],
  userProfile: null,

  setOrders: (orders) => set({ orders }),
  addOrder: (order) => set((state) => ({ 
    orders: [order, ...state.orders.filter(o => o.id !== order.id)] 
  })),
  updateOrder: (updatedOrder) => set((state) => ({
    orders: state.orders.map((o) => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o)
  })),
  removeOrder: (id) => set((state) => ({
    orders: state.orders.filter((o) => o.id !== id)
  })),

  setInvoices: (invoices) => set({ invoices }),
  addInvoice: (invoice) => set((state) => ({
    invoices: [invoice, ...state.invoices.filter(i => i.id !== invoice.id)]
  })),
  updateInvoice: (updatedInvoice) => set((state) => ({
    invoices: state.invoices.map((i) => i.id === updatedInvoice.id ? { ...i, ...updatedInvoice } : i)
  })),

  setProfiles: (profiles) => set({ profiles }),
  updateProfile: (profile) => set((state) => ({
    profiles: state.profiles.map((p) => p.id === profile.id ? { ...p, ...profile } : p)
  })),

  setUserProfile: (userProfile) => set({ userProfile }),
}))
