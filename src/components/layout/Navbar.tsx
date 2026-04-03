'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, User, Menu, X, Languages, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import CartDrawer from '@/components/cart/CartDrawer'
import { useLanguage } from '@/context/LanguageContext'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isAuthUser, setIsAuthUser] = useState(false)
  const [isAdminUser, setIsAdminUser] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const cartItems = useCartStore((state) => state.items)
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity_count, 0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    // Check if user is authenticated and if admin
    const checkUserStatus = async () => {
       const { createClient } = await import('@/lib/supabase/client')
       const supabase = createClient()
       const { data: { user } } = await supabase.auth.getUser()
       if (user) {
         setIsAuthUser(true)
         const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
         setIsAdminUser(profile?.role === 'admin')
       }
    }

    checkUserStatus()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-700 ${
        isScrolled ? 'py-5 bg-black/40 backdrop-blur-2xl border-b border-white/5 shadow-2xl' : 'py-10 bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-16">
            <Link href="/" className="text-3xl md:text-4xl font-arabic gold-text-gradient font-bold tracking-tighter hover:scale-105 transition-transform shrink-0">
              ينبع
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-10 text-[11px] font-bold tracking-[0.3em] uppercase text-white/50">
              <Link href="/store" className="hover:text-white transition-all relative group py-2">
                {t('store')}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gold transition-all group-hover:w-full" />
              </Link>
              
              {/* Dedicated Admin Portal Link */}
              <Link href="/admin-login" className="flex items-center gap-2 px-5 py-2.5 bg-gold/10 border border-gold/30 rounded-xl text-gold text-[11px] font-black tracking-widest hover:bg-gold hover:text-black transition-all duration-500 shadow-lg shadow-gold/5 group">
                <div className="w-1.5 h-1.5 bg-gold rounded-full group-hover:bg-black group-hover:scale-125 transition-all" />
                ADMIN PORTAL
              </Link>

              {isAdminUser && (
                <Link href="/admin" className="text-white font-bold flex items-center gap-3 px-6 py-3 border border-white/20 rounded-2xl bg-white/5 hover:bg-gold hover:text-black transition-all duration-500 group shadow-xl">
                  <div className="w-2 h-2 bg-gold rounded-full group-hover:bg-black animate-pulse" />
                  <span className="tracking-[0.2em]">{t('admin_dashboard')}</span>
                </Link>
              )}
            </div>
          </div>

          {/* Action Icons Section */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLanguage(language === 'ar' ? 'fr' : 'ar')}
              className="text-white/40 hover:text-gold transition-all px-4 py-2.5 border border-white/5 rounded-xl hover:bg-white/5 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Languages size={14} className="opacity-50" />
              {language === 'ar' ? 'FRANÇAIS' : 'عربي'}
            </button>
            
            <div className="h-6 w-px bg-white/10 mx-2" />

            <Link href={isAuthUser ? "/dashboard" : "/login"} className="text-white/40 hover:text-gold transition-all p-3.5 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5">
              <User size={22} strokeWidth={1.5} className={isAuthUser ? "text-gold" : ""} />
            </Link>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative text-white/40 hover:text-gold transition-all p-3.5 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 group"
            >
              <ShoppingBag size={22} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-gold text-black text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform">
                  {totalItems}
                </span>
              )}
            </button>

            <button 
              className="md:hidden text-white/40 p-3.5 hover:bg-white/5 rounded-xl border border-white/5 ml-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-2xl border-t border-white/10 p-8 flex flex-col gap-8 md:hidden animate-fade-in shadow-2xl">
            <Link href="/store" className="text-2xl font-arabic hover:text-gold transition-colors flex justify-between items-center" onClick={() => setIsMobileMenuOpen(false)}>
              {t('store')}
              <ArrowRight size={20} className="opacity-20 translate-x-4 group-hover:translate-x-0 transition-transform" />
            </Link>
            <Link href={isAuthUser ? "/dashboard" : "/login"} className="text-2xl font-arabic hover:text-gold transition-colors flex justify-between items-center" onClick={() => setIsMobileMenuOpen(false)}>
              {isAuthUser ? "Dashboard" : "Login"}
              <ArrowRight size={20} className="opacity-20 translate-x-4 group-hover:translate-x-0 transition-transform" />
            </Link>
            {isAdminUser && (
              <Link href="/admin" className="text-2xl text-gold font-bold flex items-center justify-between p-4 bg-gold/5 border border-gold/10 rounded-2xl" onClick={() => setIsMobileMenuOpen(false)}>
                {t('admin_dashboard')}
                <div className="w-2.5 h-2.5 bg-gold rounded-full animate-pulse shadow-[0_0_10px_rgba(212,175,55,1)]" />
              </Link>
            )}
            <div className="pt-8 border-t border-white/5 flex flex-col gap-4">
               <button 
                  onClick={() => { setLanguage(language === 'ar' ? 'fr' : 'ar'); setIsMobileMenuOpen(false); }}
                  className="w-full py-4 rounded-xl border border-white/10 text-white/60 flex items-center justify-center gap-3 font-bold"
               >
                  <Languages size={18} />
                  {language === 'ar' ? 'Switch to French' : 'التحويل للعربية'}
               </button>
            </div>
          </div>
        )}
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

export default Navbar
