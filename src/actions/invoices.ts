'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function generateInvoice(orderId: string) {
  const supabase = await createClient()

  // 1. Verify Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'Admin access required' }

  // 2. Fetch Order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*, profiles(full_name, id)')
    .eq('id', orderId)
    .single()

  if (orderError || !order) return { error: 'Order not found' }

  // 3. Check if invoice already exists
  const { data: existingInvoice } = await supabase
    .from('invoices')
    .select('id')
    .eq('order_id', orderId)
    .single()

  if (existingInvoice) return { error: 'Invoice already exists for this order' }

  // 4. Generate Invoice Number
  const date = new Date()
  const year = date.getFullYear()
  const random = Math.floor(1000 + Math.random() * 9000)
  const invoiceNumber = `INV-${year}-${random}`

  // 5. Create Invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      order_id: orderId,
      user_id: order.user_id,
      invoice_number: invoiceNumber,
      total_amount: order.total_price,
      paid_amount: order.paid_amount || 0,
      status: calculateStatus(order.total_price, order.paid_amount || 0)
    })
    .select()
    .single()

  if (invoiceError) return { error: invoiceError.message }

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  
  return { success: true, invoiceId: invoice.id }
}

export async function updateInvoicePayment(id: string, amount: number) {
  const supabase = await createClient()

  const { data: invoice, error: fetchError } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !invoice) return { error: 'Invoice not found' }

  const status = calculateStatus(invoice.total_amount, amount)

  const { error: updateError } = await supabase
    .from('invoices')
    .update({ paid_amount: amount, status })
    .eq('id', id)

  if (updateError) return { error: updateError.message }

  // Sync back to order
  await supabase
    .from('orders')
    .update({ paid_amount: amount })
    .eq('id', invoice.order_id)

  revalidatePath('/admin')
  revalidatePath('/dashboard')
  return { success: true }
}

function calculateStatus(total: number, paid: number): string {
  if (paid <= 0) return 'unpaid'
  if (paid >= total) return 'paid'
  return 'partial'
}
