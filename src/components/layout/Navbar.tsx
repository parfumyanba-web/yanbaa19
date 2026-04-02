'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingBag, User, Menu, X, Languages } from 'lucide-react'
import { useCartStore } from '@/store/useCartStore'
import CartDrawer from '@/components/cart/CartDrawer'
import { useLanguage } from '@/context/LanguageContext'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const cartItems = useCartStore((state) => state.items)
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity_count, 0)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ${
        isScrolled ? 'py-4 bg-black/60 backdrop-blur-xl border-b border-white/10' : 'py-8 bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl md:text-3xl font-arabic gold-text-gradient font-bold tracking-wider">
            ينبع
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-12 text-sm font-light tracking-widest uppercase text-white/70">
            <Link href="/store" className="hover:text-gold transition-colors">{t('store')}</Link>
            <Link href="/about" className="hover:text-gold transition-colors">{t('about')}</Link>
            <Link href="/contact" className="hover:text-gold transition-colors">{t('contact')}</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setLanguage(language === 'ar' ? 'fr' : 'ar')}
              className="text-white/70 hover:text-gold transition-colors p-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest"
            >
              <Languages size={18} />
              {language === 'ar' ? 'FR' : 'عربي'}
            </button>
            <Link href="/login" className="text-white/70 hover:text-gold transition-colors p-2">
              <User size={20} />
            </Link>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative text-white/70 hover:text-gold transition-colors p-2"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {totalItems}
                </span>
              )}
            </button>
            <button 
              className="md:hidden text-white/70 p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-black border-t border-white/10 p-6 flex flex-col gap-6 md:hidden animate-fade-in">
            <Link href="/store" className="text-lg hover:text-gold transition-colors">Store</Link>
            <Link href="/about" className="text-lg hover:text-gold transition-colors">Legacy</Link>
            <Link href="/contact" className="text-lg hover:text-gold transition-colors">B2B Portal</Link>
          </div>
        )}
      </nav>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}

export default Navbar
