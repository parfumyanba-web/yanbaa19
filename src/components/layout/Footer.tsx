'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/context/LanguageContext'
import { Phone, MessageCircle, MapPin, Mail } from 'lucide-react'

const Footer = () => {
  const { t } = useLanguage()
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [storeInfo, setStoreInfo] = useState<any>({})

  useEffect(() => {
    const fetchSettings = async () => {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { data } = await supabase
        .from('settings')
        .select('*')
        .eq('key', 'store_info')
        .single()
      
      if (data?.value) {
        setStoreInfo(data.value)
        setWhatsappNumber(data.value.whatsapp || '')
      }
    }
    fetchSettings()
  }, [])

  return (
    <footer className="bg-[#080808] border-t border-white/5 pt-16 md:pt-24 pb-10 md:pb-12 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-16">
        {/* Brand Section */}
        <div className="space-y-6">
          <Link href="/" className="text-4xl md:text-5xl font-arabic gold-text-gradient block hover:scale-105 transition-transform duration-500">
            {t('hero_title')}
          </Link>
          <p className="text-white/40 text-xs md:text-sm tracking-[0.2em] uppercase max-w-md mx-auto leading-relaxed font-light">
            {t('hero_subtitle')}
          </p>
        </div>

        {/* Minimalist Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-4xl pt-8">
          <ContactItem 
            icon={<MapPin size={20} />} 
            label={t('address_label')} 
            value={storeInfo.address || t('location')} 
          />
          <ContactItem 
            icon={<Phone size={20} />} 
            label={t('phone_label')} 
            value={storeInfo.phone || '+213 000 000 000'} 
          />
          <div className="flex flex-col items-center group">
            <a 
              href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-8 py-4 bg-gold/10 border border-gold/20 rounded-2xl text-gold font-bold hover:bg-gold hover:text-black transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]"
            >
              <MessageCircle size={20} className="animate-pulse" />
              <span className="uppercase tracking-widest text-xs">{t('whatsapp_label')}</span>
            </a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="w-full pt-12 md:pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 text-white/20 text-[9px] md:text-[10px] uppercase tracking-[0.3em]">
          <p>© {new Date().getFullYear()} {t('rights')}</p>
          <div className="flex gap-6 md:gap-10">
            <Link href="/privacy" className="hover:text-gold transition-colors">{t('privacy_policy')}</Link>
            <Link href="/terms" className="hover:text-gold transition-colors">{t('terms_of_service')}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

const ContactItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="space-y-3 flex flex-col items-center group">
    <div className="text-white/20 group-hover:text-gold transition-colors duration-500">{icon}</div>
    <p className="text-[10px] uppercase tracking-widest text-white/30">{label}</p>
    <p className="text-sm text-white/70 font-light group-hover:text-white transition-colors">{value}</p>
  </div>
)

export default Footer
