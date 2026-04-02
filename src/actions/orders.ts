'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createOrder(data: {
  userId: string
  items: { productId: number; quantityLabel: string; quantityGrams: number; price: number; count: number }[]
  totalPrice: number
}) {
  const supabase = createClient()

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: data.userId,
      total_price: data.totalPrice,
      status: 'pending'
    })
    .select()
    .single()

  if (orderError) return { error: orderError.message }

  const orderItems = data.items.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    quantity_label: item.quantityLabel,
    quantity_grams: item.quantityGrams,
    price_at_time: item.price,
    quantity_count: item.count
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) return { error: itemsError.message }

  revalidatePath('/admin/orders')
  revalidatePath('/dashboard')
  return { success: true, orderId: order.id }
}

export async function updateOrderStatus(id: string, status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled') {
  const supabase = createClient()
  const { error } = await supabase.from('orders').update({ status }).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/orders')
  return { success: true }
}

export async function updatePayment(id: string, paidAmount: number) {
  const supabase = createClient()
  const { error } = await supabase.from('orders').update({ paid_amount: paidAmount }).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/orders')
  return { success: true }
}

export async function getOrders() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, profiles(full_name, phone, store_name), order_items(*, products(name))')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }

  return data
}
