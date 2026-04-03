'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Box, ShoppingCart, Users, Settings, LogOut, Bell, Languages } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { clsx } from 'clsx'

const AdminDashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { language, direction, setLanguage } = useLanguage()
  const pathname = usePathname()

  const adminTranslations: any = {
    ar: {
      dashboard: 'لوحة التحكم',
      catalog: 'كتالوج المنتجات',
      orders: 'الطلبيات',
      customers: 'الزبائن',
      platform: 'الإعدادات',
      signout: 'تسجيل الخروج',
      overview: 'نظرة عامة',
      control_center: 'مركز التحكم في الإنتاج',
      admin: 'المدير العام',
      super_user: 'مستخدم متميز',
    },
    fr: {
      dashboard: 'Tableau de bord',
      catalog: 'Catalogue',
      orders: 'Commandes',
      customers: 'Clients',
      platform: 'Paramètres',
      signout: 'Déconnexion',
      overview: 'Aperçu',
      control_center: 'Centre de contrôle de production',
      admin: 'Administrateur',
      super_user: 'Super Utilisateur',
    }
  }

  const t = (key: string) => adminTranslations[language][key] || key

  return (
    <div className={clsx("min-h-screen bg-[#0a0a0a] flex text-white/90", direction === 'rtl' ? 'flex-row' : 'flex-row-reverse')} dir={direction}>
      {/* Sidebar - Positioned correctly based on DIR */}
      <aside className={clsx(
        "w-64 border-white/5 bg-[#121212] flex flex-col sticky top-0 h-screen z-20",
        direction === 'rtl' ? 'border-l' : 'border-r'
      )}>
        <div className="p-8">
          <Link href="/admin" className="text-2xl font-arabic gold-text-gradient block">ينبع أدمن</Link>
          <p className="text-[10px] uppercase tracking-widest text-white/30 mt-1">B2B Management Control</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem href="/admin" icon={<LayoutDashboard size={18} />} label={t('dashboard')} active={pathname === '/admin'} />
          <NavItem href="/admin/products" icon={<Box size={18} />} label={t('catalog')} active={pathname.startsWith('/admin/products')} />
          <NavItem href="/admin/orders" icon={<ShoppingCart size={18} />} label={t('orders')} active={pathname.startsWith('/admin/orders')} />
          <NavItem href="/admin/users" icon={<Users size={18} />} label={t('customers')} active={pathname.startsWith('/admin/users')} />
          <NavItem href="/admin/settings" icon={<Settings size={18} />} label={t('platform')} active={pathname.startsWith('/admin/settings')} />
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <button 
            onClick={() => setLanguage(language === 'ar' ? 'fr' : 'ar')}
            className="flex items-center gap-3 text-white/40 hover:text-gold transition-colors text-sm w-full"
          >
            <Languages size={18} /> {language === 'ar' ? 'Français' : 'العربية'}
          </button>
          <button className="flex items-center gap-3 text-white/40 hover:text-red-400 transition-colors text-sm w-full">
            <LogOut size={18} /> {t('signout')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-10">
          <h2 className="text-sm uppercase tracking-widest text-white/50">{t('control_center')}</h2>
          <div className="flex items-center gap-6">
             <button className="relative text-white/50 hover:text-gold transition-colors">
               <Bell size={20} />
               <span className="absolute -top-1 -right-1 w-2 h-2 bg-gold rounded-full shadow-[0_0_10px_#D4AF37]" />
             </button>
             <div className={clsx("flex items-center gap-3 pl-6", direction === 'rtl' ? 'border-r pr-6 border-white/5' : 'border-l pl-6 border-white/5')}>
               <div className={direction === 'rtl' ? 'text-left' : 'text-right'}>
                 <p className="text-xs font-bold">{t('admin')}</p>
                 <p className="text-[10px] text-white/30 uppercase">{t('super_user')}</p>
               </div>
               <div className="w-10 h-10 rounded-full gold-gradient p-[1px]">
                 <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-bold text-gold text-xs">AD</div>
               </div>
             </div>
          </div>
        </header>

        <div className="p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

const NavItem = ({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) => (
  <Link 
    href={href} 
    className={clsx(
      "flex items-center gap-4 px-4 py-3 rounded-xl transition-all group",
      active ? "bg-gold/10 text-gold shadow-[0_0_15px_-5px_#D4AF37]" : "hover:bg-white/5 hover:text-gold"
    )}
  >
    <span className={clsx("transition-colors", active ? "text-gold" : "text-white/40 group-hover:text-gold")}>{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </Link>
)

export default AdminDashboardLayout
