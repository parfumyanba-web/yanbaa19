'use client'

import React, { useState } from 'react'
import { Search, Plus, AlertTriangle, ArrowUpRight } from 'lucide-react'
import { updateStock, restock } from '@/actions/inventory'
import { clsx } from 'clsx'

interface InventoryItem {
  id: number
  product_id: number
  stock_grams: number
  low_stock_threshold: number
  products: {
    name: string
    image_url: string
  }
}

export const InventoryList = ({ initialInventory }: { initialInventory: InventoryItem[] }) => {
  const [inventory, setInventory] = useState(initialInventory)
  const [searchTerm, setSearchTerm] = useState('')

  const handleRestock = async (inventoryId: number, currentStock: number) => {
    const amount = prompt('Enter amount to add (grams):', '500')
    if (amount) {
      const grams = parseInt(amount)
      const res = await restock(inventoryId, grams)
      if (res.success) {
        setInventory(prev => prev.map(item => 
          item.id === inventoryId ? { ...item, stock_grams: item.stock_grams + grams } : item
        ))
      }
    }
  }

  const filteredInventory = inventory.filter(item => 
    item.products.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex gap-4 items-center glass-card p-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text" 
            placeholder="Search inventory..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-gold/50 transition-colors text-sm text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInventory.map((item) => (
          <div key={item.id} className="glass-card p-6 space-y-4 group transition-all hover:border-gold/30">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/5 overflow-hidden border border-white/10">
                   {item.products.image_url ? (
                     <img src={item.products.image_url} alt={item.products.name} className="w-full h-full object-cover" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-white/20 uppercase text-[10px]">No Image</div>
                   )}
                </div>
                <div>
                  <h3 className="font-bold text-white/90 truncate max-w-[150px]">{item.products.name}</h3>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest">ID: {item.product_id}</p>
                </div>
              </div>
              {item.stock_grams <= item.low_stock_threshold && (
                <div className="p-2 text-amber-400 bg-amber-400/10 rounded-lg animate-pulse" title="Low Stock">
                  <AlertTriangle size={16} />
                </div>
              )}
            </div>

            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
               <div className="flex justify-between items-end">
                 <div>
                   <label className="text-[10px] uppercase tracking-widest text-white/40 block mb-1">Stock Level</label>
                   <span className={clsx(
                     "text-2xl font-bold",
                     item.stock_grams <= item.low_stock_threshold ? "text-amber-400" : "text-white"
                   )}>
                     {Number(item.stock_grams).toLocaleString()}g
                   </span>
                 </div>
                 <button 
                  onClick={() => handleRestock(item.id, item.stock_grams)}
                  className="flex items-center gap-2 px-4 py-2 bg-gold text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-gold/20"
                 >
                   <Plus size={14} /> Restock
                 </button>
               </div>
               
               <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={clsx(
                      "h-full transition-all duration-1000",
                      item.stock_grams <= item.low_stock_threshold ? "bg-amber-400" : "bg-gold"
                    )}
                    style={{ width: `${Math.min((item.stock_grams / (item.low_stock_threshold * 3)) * 100, 100)}%` }}
                  />
               </div>
            </div>
            
            <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/30 px-1">
               <span>Min Threshold: {item.low_stock_threshold}g</span>
               <button className="hover:text-gold transition-colors flex items-center gap-1">
                 View History <ArrowUpRight size={10} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
