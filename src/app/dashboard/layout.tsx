'use client'

import React from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { History, FileText, Settings, Layout, LogOut } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { logoutUser } from '@/lib/auth/actions'

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col">
      <Navbar />
      
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 pt-32 pb-20 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Sidebar Nav */}
        <aside className="md:col-span-1 space-y-2">
          <h2 className="text-gold text-xs font-bold uppercase tracking-widest mb-6 ml-4">{t('my_account')}</h2>
          <ClientNavItem href="/dashboard" icon={<Layout size={18} />} label={t('overview')} />
          <ClientNavItem href="/dashboard/orders" icon={<History size={18} />} label={t('order_history')} />
          <ClientNavItem href="/dashboard/invoices" icon={<FileText size={18} />} label={t('invoices_documents')} />
          <ClientNavItem href="/dashboard/settings" icon={<Settings size={18} />} label={t('settings')} />
          <button 
            onClick={() => logoutUser()}
            className="flex items-center gap-4 px-6 py-4 rounded-xl border border-transparent hover:border-red-400/20 hover:bg-red-400/5 transition-all group w-full text-left"
          >
            <LogOut size={18} className="text-white/40 group-hover:text-red-400 transition-colors" />
            <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{t('signout') || 'Sign Out'}</span>
          </button>
        </aside>

        {/* Main Dashboard Content */}
        <main className="md:col-span-3 space-y-8">
          {children}
        </main>
      </div>

      <Footer />
    </div>
  )
}

const ClientNavItem = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <Link 
    href={href} 
    className="flex items-center gap-4 px-6 py-4 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5 transition-all group"
  >
    <span className="text-white/40 group-hover:text-gold transition-colors">{icon}</span>
    <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">{label}</span>
  </Link>
)

export default ClientLayout
