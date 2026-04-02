import React from 'react'
import Image from 'next/image'
import { Plus, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import { Product } from '@/lib/services/catalog'
import { useLanguage } from '@/context/LanguageContext'

const ProductCard = ({ product }: { product: Product }) => {
  const { t } = useLanguage()
  const addItem = useCartStore((state) => state.addItem)

  // Resolve image URL
  const resolveImage = (url?: string) => {
    if (!url) return '/placeholder-perfume.jpg'
    if (url.startsWith('http') || url.startsWith('/')) return url
    // If it's just a filename, assume it's in the Supabase 'products' bucket
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/products/${url}`
  }

  const imageUrl = resolveImage(product.image_url)

  const handleAddToCart = () => {
    addItem({
      id: product.id.toString(),
      name: product.name,
      price: product.price_dzd,
      image: imageUrl,
      quantity_label: '100g', // Default
      quantity_count: 1
    })
  }

  return (
    <div className="group glass-card overflow-hidden transition-all duration-700 hover:border-gold/30 hover:shadow-[0_0_40px_rgba(212,175,55,0.1)] rounded-3xl border border-white/5 bg-white/[0.02]">
      <div className="aspect-[3/4] relative bg-neutral-900 overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-end p-6">
          <button 
            onClick={handleAddToCart}
            className="w-full gold-gradient py-4 rounded-2xl text-black font-bold flex items-center justify-center gap-3 transform translate-y-8 group-hover:translate-y-0 transition-all duration-700 shadow-2xl hover:scale-[1.02] active:scale-95"
          >
            <Plus size={20} /> {t('add_to_cart')}
          </button>
        </div>
        
        {/* Tags */}
        {product.product_tags && product.product_tags.length > 0 && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 pointer-events-none">
            {product.product_tags.map((pt, i) => (
              <span key={i} className="bg-black/50 backdrop-blur-md border border-white/10 text-white/80 text-[10px] uppercase px-3 py-1 rounded-full font-arabic">
                {pt.tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-8 space-y-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-arabic font-medium text-white/90 group-hover:text-gold transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-white/30 text-[10px] uppercase tracking-[0.2em] font-medium">
            {product.brands?.name || 'Yanba Special'}
          </p>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent">
              {product.price_dzd.toLocaleString()}
            </span>
            <span className="text-[10px] text-gold/60 font-bold uppercase">{t('price_dzd')}</span>
          </div>
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/20 group-hover:border-gold/50 group-hover:text-gold transition-all duration-500">
             <ShoppingBag size={14} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
