'use client'

import HeroCanvas from '@/components/home/HeroCanvas'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useLanguage } from '@/context/LanguageContext'

export default function Home() {
  const { t } = useLanguage()
  
  return (
    <main className="min-h-screen font-alexandria">
      <Navbar />
      <HeroCanvas />
      
      {/* Quality Section */}
      <section className="relative z-10 py-32 px-6 bg-[#121212]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-fade-in">
            <h2 className="text-4xl md:text-6xl font-arabic gold-text-gradient">
              {t('quality_title')}
            </h2>
            <p className="text-lg text-white/60 leading-relaxed font-light">
              {t('quality_desc')}
            </p>
            <div className="flex gap-4">
              <button className="gold-gradient px-8 py-3 rounded-full text-black font-bold hover:scale-105 transition-transform flex items-center gap-2">
                {t('explore_collection')}
              </button>
            </div>
          </div>
          <div className="glass-card aspect-square relative overflow-hidden group rounded-3xl border border-white/5">
              <div className="absolute inset-0 bg-gold/5 mix-blend-overlay group-hover:bg-gold/10 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-1/2 h-px bg-gold/20 rotate-45" />
                 <div className="w-1/2 h-px bg-gold/20 -rotate-45" />
              </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
