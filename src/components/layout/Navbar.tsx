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
         // Check admin from JWT metadata (no DB query = fast + no RLS issues)
         const isAdmin = user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin'
         setIsAdminUser(isAdmin)
       }
    }

    checkUserStatus()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-700 ${
        isScrolled ? 'py-4 md:py-5 bg-black/60 backdrop-blur-2xl border-b border-white/5 shadow-2xl' : 'py-6 md:py-10 bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-6 md:gap-16">
            <Link href="/" className="text-2xl md:text-4xl font-arabic gold-text-gradient font-bold tracking-tighter hover:scale-105 transition-transform shrink-0">
              ينبع
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-10 text-[11px] font-bold tracking-[0.3em] uppercase text-white/50">
              <Link href="/store" className="hover:text-white transition-all relative group py-2">
                {t('store')}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gold transition-all group-hover:w-full" />
              </Link>
              
              {/* Refined Admin Access Point */}
              <Link 
                href="/admin-login" 
                className="group flex items-center gap-3 px-4 py-2 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-full text-white/40 hover:text-gold hover:border-gold/30 hover:bg-gold/[0.02] transition-all duration-700 shadow-2xl"
              >
                <div className="w-1 h-1 bg-white/20 rounded-full group-hover:bg-gold group-hover:scale-150 group-hover:shadow-[0_0_10px_rgba(212,175,55,0.8)] transition-all duration-500" />
                <span className="text-[9px] font-bold tracking-[0.4em] uppercase">Admin.Access</span>
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
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setLanguage(language === 'ar' ? 'fr' : 'ar')}
              className="text-white/40 hover:text-gold transition-all px-2 md:px-4 py-2 md:py-2.5 border border-white/5 rounded-xl hover:bg-white/5 flex items-center gap-2 md:gap-3 text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Languages size={14} className="opacity-50" />
              <span className="hidden sm:inline">{language === 'ar' ? 'FRANÇAIS' : 'عربي'}</span>
              <span className="sm:hidden">{language === 'ar' ? 'FR' : 'ع'}</span>
            </button>
            
            <div className="hidden xs:block h-6 w-px bg-white/10 mx-1 md:mx-2" />

            <Link href={isAuthUser ? "/dashboard" : "/login"} className="text-white/40 hover:text-gold transition-all p-2.5 md:p-3.5 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5">
              <User size={20} strokeWidth={1.5} className={`md:w-[22px] md:h-[22px] ${isAuthUser ? "text-gold" : ""}`} />
            </Link>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative text-white/40 hover:text-gold transition-all p-2.5 md:p-3.5 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5 group"
            >
              <ShoppingBag size={20} strokeWidth={1.5} className="md:w-[22px] md:h-[22px]" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-gold text-black text-[9px] font-black w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)] group-hover:scale-110 transition-transform">
                  {totalItems}
                </span>
              )}
            </button>

            <button 
              className="md:hidden text-white/40 p-2.5 hover:bg-white/5 rounded-xl border border-white/5 ml-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 h-[calc(100vh-100%)] bg-black/95 backdrop-blur-2xl border-t border-white/10 p-6 flex flex-col md:hidden animate-fade-in shadow-2xl overflow-y-auto">
            <div className="flex flex-col gap-4">
              <Link href="/store" className="group p-6 glass-card border-white/5 hover:border-gold/30 transition-all" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gold font-bold tracking-widest uppercase opacity-50">Collection</span>
                    <h3 className="text-2xl font-arabic text-white group-hover:text-gold transition-colors">{t('store')}</h3>
                  </div>
                  <ArrowRight size={24} className={`opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : ''}`} />
                </div>
              </Link>

              <Link href={isAuthUser ? "/dashboard" : "/login"} className="group p-6 glass-card border-white/5 hover:border-gold/30 transition-all" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gold font-bold tracking-widest uppercase opacity-50">Portal</span>
                    <h3 className="text-2xl font-arabic text-white group-hover:text-gold transition-colors">{isAuthUser ? "Dashboard" : "Login"}</h3>
                  </div>
                  <ArrowRight size={24} className={`opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-2' : ''}`} />
                </div>
              </Link>

              {isAdminUser && (
                <Link href="/admin" className="group p-6 bg-gold/5 border border-gold/20 rounded-3xl hover:bg-gold/10 transition-all" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <span className="text-[10px] text-gold font-bold tracking-widest uppercase">Management</span>
                      <h3 className="text-2xl font-arabic text-gold">{t('admin_dashboard')}</h3>
                    </div>
                    <div className="w-3 h-3 bg-gold rounded-full animate-pulse shadow-[0_0_15px_rgba(212,175,55,0.6)]" />
                  </div>
                </Link>
              )}
              
              <Link 
                href="/admin-login" 
                className="flex items-center justify-center gap-4 py-5 bg-white/[0.02] border border-white/5 rounded-3xl text-[10px] font-black tracking-[0.3em] text-white/20 hover:text-gold hover:bg-gold/5 transition-all uppercase group" 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="w-1 h-1 bg-white/10 rounded-full group-hover:bg-gold transition-all" />
                Management Access
              </Link>
            </div>

            <div className="mt-auto pb-10 flex flex-col gap-4">
               <div className="h-px bg-white/5 w-full mb-4" />
               <button 
                  onClick={() => { setLanguage(language === 'ar' ? 'fr' : 'ar'); setIsMobileMenuOpen(false); }}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 flex items-center justify-center gap-3 font-bold text-sm tracking-widest uppercase"
               >
                  <Languages size={18} className="text-gold" />
                  {language === 'ar' ? 'FRANÇAIS' : 'العربية'}
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
