'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, User, Menu, X, Languages, ArrowRight, LayoutDashboard, LogIn, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import CartDrawer from '@/components/cart/CartDrawer'
import { useLanguage } from '@/context/LanguageContext'
import { createClient } from '@/lib/supabase/client'

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
    const supabase = createClient()
    const checkUserStatus = async () => {
       const { data: { session } } = await supabase.auth.getSession()
       const user = session?.user
       if (user) {
         setIsAuthUser(true)
         // Check admin from JWT metadata (no DB query = fast + no RLS issues)
         const isAdmin = user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin'
         setIsAdminUser(isAdmin)
       }
    }

    checkUserStatus()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        setIsAuthUser(true)
        setIsAdminUser(session.user.app_metadata?.role === 'admin' || session.user.user_metadata?.role === 'admin')
      } else {
        setIsAuthUser(false)
        setIsAdminUser(false)
      }
    })

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      subscription.unsubscribe()
    }
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isMobileMenuOpen])

  return (
    <>
      <nav className={`fixed z-[60] transition-all duration-700 w-full flex justify-center pointer-events-none px-4 ${
        isScrolled ? 'top-4 md:top-6' : 'top-0'
      }`}>
        <div className={`pointer-events-auto w-full transition-all duration-700 flex items-center justify-between ${
          isScrolled 
            ? 'max-w-5xl bg-black/40 backdrop-blur-3xl border border-white/10 rounded-full py-3 px-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]' 
            : 'max-w-7xl bg-transparent py-6 md:py-8 px-4 md:px-8'
        }`}>
          {/* Logo Section */}
          <div className="flex-1 shrink-0 flex items-center">
            <Link href="/" className={`font-arabic gold-text-gradient font-bold tracking-tighter hover:scale-105 transition-transform ${isScrolled ? 'text-2xl md:text-3xl' : 'text-3xl md:text-5xl'}`}>
              ينبع
            </Link>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <div className="hidden lg:flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-sm">
            <Link href="/store" className="group relative px-4 py-2 hover:bg-white/5 rounded-full transition-all">
              <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/60 group-hover:text-white transition-colors">
                {t('store')}
              </span>
              <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </Link>
            
            <Link 
              href="/admin-login" 
              className="group relative flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-full transition-all"
            >
              <div className="w-1 h-1 bg-white/20 rounded-full group-hover:bg-gold group-hover:shadow-[0_0_8px_rgba(212,175,55,0.8)] transition-all duration-300" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/50 group-hover:text-gold transition-colors">Portal</span>
            </Link>

            {isAdminUser && (
              <Link href="/admin" className="group relative flex items-center gap-2 px-4 py-2 hover:bg-gold/10 border border-transparent hover:border-gold/20 rounded-full transition-all">
                <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-gold">Admin</span>
              </Link>
            )}
          </div>

          {/* Action Icons Section */}
          <div className="flex-1 flex justify-end items-center gap-2 md:gap-3">
            <button 
              onClick={() => setLanguage(language === 'ar' ? 'fr' : 'ar')}
              className="group hidden sm:flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-[10px] font-bold tracking-[0.2em] text-white/50 hover:text-white"
            >
              <Languages size={14} className="opacity-70 group-hover:text-gold transition-colors" />
              <span>{language === 'ar' ? 'FR' : 'عربي'}</span>
            </button>
            
            <Link href={isAuthUser ? "/dashboard" : "/login"} className="text-white/50 hover:text-gold transition-all p-2.5 hover:bg-white/5 rounded-full border border-transparent hover:border-white/10 group">
              <User size={18} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
            </Link>
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative text-white/50 hover:text-gold transition-all p-2.5 hover:bg-white/5 rounded-full border border-transparent hover:border-white/10 group"
            >
              <ShoppingBag size={18} strokeWidth={1.5} className="group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                 <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-gold to-yellow-200 text-black text-[9px] font-black w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(212,175,55,0.5)] group-hover:scale-110 transition-transform border border-black/20">
                  {totalItems}
                </span>
              )}
            </button>

            <div className="h-6 w-px bg-white/10 mx-1 lg:hidden" />

            <button 
              className={`lg:hidden relative p-2.5 rounded-full transition-all duration-300 border ${
                isMobileMenuOpen ? 'bg-white/10 border-white/20 text-white' : 'hover:bg-white/5 border-transparent text-white/50'
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                <span className={`absolute h-px w-5 bg-current transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`} />
                <span className={`absolute h-px bg-current transition-all duration-300 ${isMobileMenuOpen ? 'w-0 opacity-0' : 'w-5 opacity-100'}`} />
                <span className={`absolute h-px w-5 bg-current transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-3xl transition-all duration-500 lg:hidden flex flex-col ${
        isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <div className={`mt-24 px-6 flex-1 flex flex-col gap-4 overflow-y-auto pb-24 transition-all duration-700 transform ${
          isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          
          <Link href="/store" className="group rounded-3xl p-6 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5 hover:border-gold/30 transition-all flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
            <div>
              <span className="text-[10px] text-gold font-bold tracking-widest uppercase opacity-60">Collection</span>
              <h3 className="text-3xl font-arabic text-white mt-2 group-hover:text-gold transition-colors">{t('store')}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold/10 group-hover:scale-110 transition-all">
              <ChevronRight size={24} className={`text-white/30 group-hover:text-gold transition-colors ${language === 'ar' ? 'rotate-180' : ''}`} />
            </div>
          </Link>

          <Link href={isAuthUser ? "/dashboard" : "/login"} className="group rounded-3xl p-6 bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5 hover:border-gold/30 transition-all flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
            <div>
              <span className="text-[10px] text-white/50 font-bold tracking-widest uppercase">My Space</span>
              <h3 className="text-3xl font-arabic text-white mt-2 group-hover:text-gold transition-colors">{isAuthUser ? "Dashboard" : "Login"}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold/10 group-hover:scale-110 transition-all">
              {isAuthUser ? <LayoutDashboard size={22} className="text-white/50 group-hover:text-gold" /> : <LogIn size={22} className="text-white/50 group-hover:text-gold" />}
            </div>
          </Link>

          {isAdminUser && (
            <Link href="/admin" className="group rounded-3xl p-6 bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 hover:border-gold/40 hover:from-gold/20 transition-all flex items-center justify-between" onClick={() => setIsMobileMenuOpen(false)}>
              <div>
                <span className="text-[10px] text-gold font-bold tracking-widest uppercase">Management</span>
                <h3 className="text-3xl font-arabic text-gold mt-2">Admin Panel</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 group-hover:scale-110 transition-all relative">
                <div className="absolute inset-0 rounded-full border border-gold/30 animate-spin-slow" />
                <div className="w-2 h-2 bg-gold rounded-full animate-pulse shadow-[0_0_10px_rgba(212,175,55,1)]" />
              </div>
            </Link>
          )}

          <Link 
            href="/admin-login" 
            className="mt-4 flex items-center justify-center gap-3 py-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all text-[10px] font-bold tracking-[0.3em] uppercase text-white/30 hover:text-white group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="w-1 h-1 bg-white/20 rounded-full group-hover:bg-gold group-hover:shadow-[0_0_8px_rgba(212,175,55,0.8)] transition-all duration-300" />
            Portal Access
          </Link>

        </div>

        {/* Mobile menu footer (Lang switcher) */}
        <div className={`p-6 border-t border-white/10 bg-black/50 backdrop-blur-xl transition-all duration-1000 delay-100 transform ${
          isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}>
           <button 
              onClick={() => { setLanguage(language === 'ar' ? 'fr' : 'ar'); setIsMobileMenuOpen(false); }}
              className="w-full py-4 rounded-xl border border-white/5 hover:bg-white/5 transition-all flex items-center justify-center gap-3 text-[11px] font-bold tracking-[0.3em] uppercase text-white/50 hover:text-white"
           >
              <Languages size={16} className="text-gold" />
              {language === 'ar' ? 'Passer au Français' : 'التبديل إلى العربية'}
           </button>
        </div>
      </div>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

export default Navbar
