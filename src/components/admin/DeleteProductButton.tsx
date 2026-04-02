'use client'

import React from 'react'
import { Trash2 } from 'lucide-react'
import { deleteProduct } from '@/actions/products'

export default function DeleteProductButton({ id }: { id: number }) {
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this product?')) {
      const result = await deleteProduct(id)
      if (result.error) {
        alert('Failed to delete product: ' + result.error)
      }
    }
  }

  return (
    <button 
      onClick={handleDelete}
      className="p-2 text-white/30 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
    >
      <Trash2 size={16} />
    </button>
  )
}
