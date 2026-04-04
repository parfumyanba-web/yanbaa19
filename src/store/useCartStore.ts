'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity_label: string // '100g', '500g', '1kg', '10kg'
  quantity_count: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string, quantity_label: string) => void
  clearCart: () => void
  totalPrice: () => number
  updateQuantity: (id: string, quantity_label: string, count: number) => void
  syncWithDatabase: () => Promise<void>
  loadFromDatabase: () => Promise<void>
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: async (newItem) => {
        const existingItem = get().items.find(
          (item) => item.id === newItem.id && item.quantity_label === newItem.quantity_label
        )

        let updatedItems: CartItem[]
        if (existingItem) {
          updatedItems = get().items.map((item) =>
            item.id === newItem.id && item.quantity_label === newItem.quantity_label
              ? { ...item, quantity_count: item.quantity_count + newItem.quantity_count }
              : item
          )
        } else {
          updatedItems = [...get().items, newItem]
        }

        set({ items: updatedItems })
        
        // Sync to DB if logged in
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user
        if (user) {
          const item = updatedItems.find(i => i.id === newItem.id && i.quantity_label === newItem.quantity_label)!
          await supabase.from('cart_items').upsert({
            user_id: user.id,
            product_id: item.id,
            quantity_label: item.quantity_label,
            quantity_count: item.quantity_count
          }, { onConflict: 'user_id,product_id,quantity_label' })
        }
      },

      removeItem: async (id, quantity_label) => {
        const updatedItems = get().items.filter(
          (item) => !(item.id === id && item.quantity_label === quantity_label)
        )
        set({ items: updatedItems })

        // Sync to DB if logged in
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user
        if (user) {
          await supabase.from('cart_items')
            .delete()
            .match({ user_id: user.id, product_id: id, quantity_label })
        }
      },

      updateQuantity: async (id, quantity_label, count) => {
        const updatedItems = get().items.map((item) =>
          item.id === id && item.quantity_label === quantity_label
            ? { ...item, quantity_count: count }
            : item
        )
        set({ items: updatedItems })

        // Sync to DB if logged in
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user
        if (user) {
          await supabase.from('cart_items')
            .upsert({
              user_id: user.id,
              product_id: id,
              quantity_label,
              quantity_count: count
            }, { onConflict: 'user_id,product_id,quantity_label' })
        }
      },

      clearCart: async () => {
        set({ items: [] })
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user
        if (user) {
          await supabase.from('cart_items').delete().eq('user_id', user.id)
        }
      },

      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity_count, 0)
      },

      loadFromDatabase: async () => {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user
        if (!user) return

        const { data, error } = await supabase
          .from('cart_items')
          .select('*, products(*)')
          .eq('user_id', user.id)

        if (data && !error) {
          const dbItems: CartItem[] = data.map((item: any) => ({
            id: item.product_id,
            name: item.products.name,
            price: item.products.price_dzd,
            image: item.products.image_url,
            quantity_label: item.quantity_label,
            quantity_count: item.quantity_count
          }))
          
          // Merge with local items or overwrite? 
          // Requirements usually prefer DB if user is logged in.
          set({ items: dbItems })
        }
      },

      syncWithDatabase: async () => {
        // Pushes all local items to DB (useful after login)
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user
        if (!user) return

        const localItems = get().items
        if (localItems.length === 0) return

        for (const item of localItems) {
          await supabase.from('cart_items').upsert({
            user_id: user.id,
            product_id: item.id,
            quantity_label: item.quantity_label,
            quantity_count: item.quantity_count
          })
        }
        await get().loadFromDatabase() // Refresh to get full product info
      }
    }),
    {
      name: 'yanba-cart',
    }
  )
)
