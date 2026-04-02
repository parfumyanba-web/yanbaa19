import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'

const Footer = () => {
  const { t } = useLanguage()
  return (
    <footer className="bg-black border-t border-white/10 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="space-y-6">
            <h3 className="text-3xl font-arabic gold-text-gradient">{t('hero_title')}</h3>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs font-light">
              {t('hero_subtitle')}
            </p>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-gold text-sm font-bold uppercase tracking-widest">Platform</h4>
            <ul className="space-y-4 text-white/50 text-sm">
              <li><Link href="/store" className="hover:text-white transition-colors">Product Catalog</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Partner Dashboard</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Join Us</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-gold text-sm font-bold uppercase tracking-widest">Support</h4>
            <ul className="space-y-4 text-white/50 text-sm">
              <li><Link href="/shipping" className="hover:text-white transition-colors">Shipping Policy</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Returns</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">B2B FAQ</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-gold text-sm font-bold uppercase tracking-widest">Contact</h4>
            <ul className="space-y-4 text-white/50 text-sm">
              <li>info@yanba.com</li>
              <li>+213 (0) 555 123 456</li>
              <li>Algiers, Algeria</li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/30 text-[10px] uppercase tracking-widest">
            © {new Date().getFullYear()} {t('rights')}
          </p>
          <div className="flex gap-8 text-white/20 text-[10px] uppercase tracking-widest font-bold">
            <Link href="/privacy" className="hover:text-gold transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gold transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
