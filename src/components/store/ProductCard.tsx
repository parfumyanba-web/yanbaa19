import React from 'react'
import Image from 'next/image'
import { Plus, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { Product } from '@/lib/services/catalog'

const ProductCard = ({ product }: { product: Product }) => {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: product.price_dzd,
      image: product.image_url || '/placeholder-perfume.jpg',
      quantity_label: '100g', // Default
      quantity_count: 1
    })
  }

  return (
    <div className="group glass-card overflow-hidden transition-all duration-500 hover:border-gold/50">
      <div className="aspect-[4/5] relative bg-neutral-900 overflow-hidden">
        <Image
          src={product.image_url || '/placeholder-perfume.jpg'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
          <button 
            onClick={handleAddToCart}
            className="w-full gold-gradient py-3 rounded-xl text-black font-bold flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
          >
            <Plus size={18} /> Add to Cart
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-white/90 group-hover:text-gold transition-colors">
            {product.name}
          </h3>
          <span className="text-gold font-bold">{product.price_dzd} DZD</span>
        </div>
        <p className="text-white/40 text-xs uppercase tracking-widest">
          {product.brands?.name || 'Yanba Special'}
        </p>
      </div>
    </div>
  )
}

export default ProductCard
