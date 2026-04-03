'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
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
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const existingItem = get().items.find(
          (item) => item.id === newItem.id && item.quantity_label === newItem.quantity_label
        )

        if (existingItem) {
          set({
            items: get().items.map((item) =>
              item.id === newItem.id && item.quantity_label === newItem.quantity_label
                ? { ...item, quantity_count: item.quantity_count + newItem.quantity_count }
                : item
            ),
          })
        } else {
          set({ items: [...get().items, newItem] })
        }
      },
      removeItem: (id, quantity_label) => {
        set({
          items: get().items.filter(
            (item) => !(item.id === id && item.quantity_label === quantity_label)
          ),
        })
      },
      clearCart: () => set({ items: [] }),
      totalPrice: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity_count, 0)
      },
      updateQuantity: (id, quantity_label, count) => {
        set({
          items: get().items.map((item) =>
            item.id === id && item.quantity_label === quantity_label
              ? { ...item, quantity_count: count }
              : item
          ),
        })
      },
    }),
    {
      name: 'yanba-cart',
    }
  )
)
