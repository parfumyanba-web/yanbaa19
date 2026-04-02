import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { InventoryList } from '@/components/admin/inventory/InventoryList'

export default async function InventoryPage() {
  const supabase = createClient()
  
  const { data: inventory } = await supabase
    .from('inventory')
    .select('*, products(name, image_url)')
    .order('stock_grams', { ascending: true })

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white/90">Inventory Management</h1>
        <p className="text-white/40 text-sm">Monitor stock levels (grams) and restock products</p>
      </header>

      <InventoryList initialInventory={(inventory || []) as any} />
    </div>
  )
}
