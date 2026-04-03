'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { CartItem } from '@/store/useCartStore'

export async function createOrder(items: CartItem[], shippingInfo: {
  name: string
  phone: string
  wilaya: string
  commune: string
  address: string
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  if (items.length === 0) return { error: 'Cart is empty' }

  // 1. Calculate Total
  const total_price = items.reduce((sum, item) => sum + (item.price * item.quantity_count), 0)

  // 2. Create Order
  const { data: order, error: orderError } = await supabase.from('orders').insert({
    user_id: user.id,
    total_price,
    paid_amount: 0,
    status: 'pending',
    shipping_name: shippingInfo.name,
    shipping_phone: shippingInfo.phone,
    shipping_wilaya: shippingInfo.wilaya,
    shipping_commune: shippingInfo.commune,
    shipping_address: shippingInfo.address
  }).select().single()

  if (orderError) return { error: orderError.message }

  // 3. Create Order Items
  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.id,
    quantity_label: item.quantity_label,
    quantity_count: item.quantity_count,
    quantity_grams: parseGrams(item.quantity_label),
    price_at_time: item.price
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
  if (itemsError) return { error: itemsError.message }

  // 4. Clear Cart in DB
  await supabase.from('cart_items').delete().eq('user_id', user.id)

  revalidatePath('/dashboard')
  revalidatePath('/admin')
  
  return { success: true, orderId: order.id }
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select('user_id')
    .single()

  if (error) return { error: error.message }

  // Create Notification for Client
  if (data?.user_id) {
    await supabase.from('notifications').insert({
      user_id: data.user_id,
      type: 'order_status',
      title: 'Order Update / تحديث الطلب',
      message: `Your order #${orderId.slice(0,8)} is now ${status} / طلبك الآن ${status}`,
    })
  }
  
  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function updateOrderPayment(orderId: string, paidAmount: number) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('orders')
    .update({ paid_amount: paidAmount })
    .eq('id', orderId)
    .select('user_id')
    .single()

  if (error) return { error: error.message }

  // Create Notification for Client
  if (data?.user_id) {
    await supabase.from('notifications').insert({
      user_id: data.user_id,
      type: 'payment_update',
      title: 'Payment Received / تم استلام الدفع',
      message: `We received a payment for order #${orderId.slice(0,8)}. New total: ${paidAmount} DZD`,
    })
  }
  
  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return { success: true }
}

function parseGrams(label: string): number {
  if (label === '100g') return 100
  if (label === '500g') return 500
  if (label === '1kg') return 1000
  if (label === '10kg') return 10000
  return 0
}
