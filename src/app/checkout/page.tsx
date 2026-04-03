'use client'

import React, { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useCartStore } from '@/store/useCartStore'
import { useLanguage } from '@/context/LanguageContext'
import { createOrder } from '@/actions/orders'
import LuxuryButton from '@/components/ui/LuxuryButton'
import { useRouter } from 'next/navigation'
import { ShoppingBag, MapPin, Phone, User, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const CheckoutPage = () => {
  const { t, direction } = useLanguage()
  const { items, totalPrice, clearCart } = useCartStore()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    phone: '',
    wilaya: '',
    commune: '',
    address: ''
  })

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setShippingInfo({
            name: profile.full_name || '',
            phone: profile.phone || '',
            wilaya: profile.wilaya || '',
            commune: profile.commune || '',
            address: profile.address || ''
          })
        }
      } else {
        router.push('/login?redirect=/checkout')
      }
    }
    loadProfile()
  }, [])

  const handlePlaceOrder = async () => {
    setLoading(true)
    const res = await createOrder(items, shippingInfo)
    if (res.success) {
      await clearCart()
      alert(t('order_success'))
      router.push('/')
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  if (items.length === 0 && step < 4) {
    return (
      <main className="min-h-screen pt-32 bg-[#121212] flex items-center justify-center">
        <div className="text-center space-y-6">
          <ShoppingBag size={64} className="mx-auto text-white/10" />
          <h2 className="text-2xl font-bold text-white/90">{t('empty_checkout')}</h2>
          <LuxuryButton onClick={() => router.push('/store')}>{t('store')}</LuxuryButton>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen pt-32 bg-[#121212]">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Steps indicator */}
            <div className={`flex items-center justify-between mb-12 relative ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
               {[1, 2, 3].map((s) => (
                 <div key={s} className="flex flex-col items-center gap-2 z-10">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                     step >= s ? 'bg-gold border-gold text-black' : 'bg-black/40 border-white/10 text-white/40'
                   }`}>
                     {step > s ? <CheckCircle2 size={20} /> : s}
                   </div>
                   <span className={`text-[10px] uppercase tracking-widest font-bold ${step >= s ? 'text-gold' : 'text-white/20'}`}>
                     {s === 1 ? t('review_cart') : s === 2 ? t('shipping_details') : t('checkout_title')}
                   </span>
                 </div>
               ))}
               <div className="absolute top-5 left-0 right-0 h-[2px] bg-white/5 -z-10" />
            </div>

            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <h2 className="text-2xl font-bold font-arabic gold-text-gradient">{t('review_cart')}</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.quantity_label}`} className="glass-card p-4 flex gap-6 items-center">
                      <div className="w-16 h-16 bg-white/5 rounded-xl border border-white/10 shrink-0 flex items-center justify-center">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <ShoppingBag size={24} className="text-white/10" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-white/90">{item.name}</h4>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest">{item.quantity_label} × {item.quantity_count}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gold">{(item.price * item.quantity_count).toLocaleString()} {t('price_dzd')}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-8">
                  <LuxuryButton onClick={() => setStep(2)} className="px-12 flex items-center gap-3">
                    {t('shipping_details')}
                    <ArrowRight size={18} className={direction === 'rtl' ? 'rotate-180' : ''} />
                  </LuxuryButton>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-fade-in">
                <h2 className="text-2xl font-bold font-arabic gold-text-gradient">{t('shipping_details')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 glass-card p-10 rounded-[2rem]">
                   <div className="space-y-6">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1 flex items-center gap-2 mb-2">
                           <User size={12} className="text-gold" /> {t('full_name')}
                        </label>
                        <input 
                           value={shippingInfo.name}
                           onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold/50 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1 flex items-center gap-2 mb-2">
                           <Phone size={12} className="text-gold" /> {t('phone')}
                        </label>
                        <input 
                           value={shippingInfo.phone}
                           onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold/50 outline-none transition-all text-left"
                           dir="ltr"
                        />
                      </div>
                   </div>
                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1 mb-2 block">{t('wilaya')}</label>
                          <input 
                            value={shippingInfo.wilaya}
                            onChange={(e) => setShippingInfo({...shippingInfo, wilaya: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold/50 outline-none transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1 mb-2 block">{t('commune')}</label>
                          <input 
                            value={shippingInfo.commune}
                            onChange={(e) => setShippingInfo({...shippingInfo, commune: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold/50 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1 flex items-center gap-2 mb-2">
                           <MapPin size={12} className="text-gold" /> {t('address')}
                        </label>
                        <textarea 
                           rows={3}
                           value={shippingInfo.address}
                           onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold/50 outline-none transition-all resize-none"
                        />
                      </div>
                   </div>
                </div>
                <div className="flex justify-between pt-8">
                  <button onClick={() => setStep(1)} className="text-white/40 flex items-center gap-2 text-xs uppercase tracking-widest hover:text-white transition-colors">
                    <ArrowLeft size={16} className={direction === 'rtl' ? 'rotate-180' : ''} />
                    {t('review_cart')}
                  </button>
                  <LuxuryButton onClick={() => setStep(3)} className="px-12 flex items-center gap-3">
                    {t('order_summary')}
                    <ArrowRight size={18} className={direction === 'rtl' ? 'rotate-180' : ''} />
                  </LuxuryButton>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-fade-in">
                <h2 className="text-2xl font-bold font-arabic gold-text-gradient">{t('place_order')}</h2>
                <div className="glass-card p-10 rounded-[2rem] space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-white/5 pb-8">
                    <div className="space-y-4">
                      <h4 className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">{t('shipping_details')}</h4>
                      <p className="text-white font-bold">{shippingInfo.name}</p>
                      <p className="text-white/60 text-sm">{shippingInfo.phone}</p>
                      <p className="text-white/60 text-sm capitalize">{shippingInfo.address}</p>
                      <p className="text-white/60 text-sm">{shippingInfo.wilaya}, {shippingInfo.commune}</p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">{t('order_summary')}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-white/40 text-sm">{t('items_count')}</span>
                        <span className="text-white font-bold">{items.length}</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <span className="text-white/40 text-sm">{t('total_amount')}</span>
                        <span className="text-2xl font-bold text-gold">{totalPrice().toLocaleString()} {t('price_dzd')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <LuxuryButton 
                    onClick={handlePlaceOrder} 
                    disabled={loading}
                    className="w-full py-6 text-xl tracking-[0.2em]"
                  >
                    {loading ? t('loading') : t('place_order')}
                  </LuxuryButton>
                </div>
                <button onClick={() => setStep(2)} className="text-white/40 flex items-center gap-2 text-xs uppercase tracking-widest hover:text-white transition-colors">
                  <ArrowLeft size={16} className={direction === 'rtl' ? 'rotate-180' : ''} />
                  {t('shipping_details')}
                </button>
              </div>
            )}

            {step === 4 && (
              <div className="text-center space-y-8 animate-scale-up py-20">
                <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto text-gold border border-gold/20">
                  <CheckCircle2 size={48} strokeWidth={1.5} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-bold font-arabic text-white mb-2">{t('order_success')}</h2>
                  <p className="text-white/40 max-w-md mx-auto leading-relaxed">{t('order_success_desc')}</p>
                </div>
                <LuxuryButton onClick={() => router.push('/dashboard')} className="px-12 py-5 rounded-2xl">
                  {t('back_to_dashboard')}
                </LuxuryButton>
              </div>
            )}

          </div>

          {/* Right Sidebar - Summary Sticky (Desktop) */}
          {step < 4 && (
            <div className="lg:col-span-4 hidden lg:block">
              <div className="sticky top-32 glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-8">
                 <h3 className="text-lg font-bold font-arabic text-white/90">{t('order_summary')}</h3>
                 <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                   {items.map(item => (
                     <div key={item.id} className="flex justify-between items-center text-sm">
                       <div className="flex-1">
                         <p className="text-white/80 font-medium truncate">{item.name}</p>
                         <p className="text-[10px] text-white/30 uppercase">{item.quantity_label} × {item.quantity_count}</p>
                       </div>
                       <p className="text-white/60">{(item.price * item.quantity_count).toLocaleString()} {t('price_dzd')}</p>
                     </div>
                   ))}
                 </div>
                 <div className="pt-8 border-t border-white/10 space-y-4">
                    <div className="flex justify-between items-center text-white/40 uppercase tracking-widest text-[10px]">
                       <span>{t('subtotal')}</span>
                       <span>{totalPrice().toLocaleString()} {t('price_dzd')}</span>
                    </div>
                    <div className="flex justify-between items-center text-gold pt-2">
                       <span className="font-bold text-sm">{t('total_amount')}</span>
                       <span className="text-xl font-bold">{totalPrice().toLocaleString()} {t('price_dzd')}</span>
                    </div>
                 </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </main>
  )
}

export default CheckoutPage
