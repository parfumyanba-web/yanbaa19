'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import LuxuryButton from '@/components/ui/LuxuryButton'
import { signIn } from '@/lib/auth/actions'
import { useLanguage } from '@/context/LanguageContext'
import { ShieldCheck } from 'lucide-react'

const AdminLoginPage = () => {
  const { t } = useLanguage()
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await signIn(formData)
  }, null)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] p-6 font-alexandria overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 blur-[120px] rounded-full" />
      </div>

      <Link 
        href="/" 
        className="fixed top-8 left-8 flex items-center gap-2 text-white/40 hover:text-gold transition-colors text-sm uppercase tracking-widest group z-10"
      >
        <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
        {t('back_to_home')}
      </Link>

      <div className="w-full max-w-md space-y-8 animate-fade-in z-10">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-gold/10 rounded-2xl border border-gold/20 mb-4 animate-bounce-subtle">
            <ShieldCheck size={32} className="text-gold" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white/90">Administration</h2>
          <p className="text-white/40 text-sm uppercase tracking-[0.2em]">Secure Access Portal</p>
        </div>

        <form action={formAction} className="glass-card p-10 space-y-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
          {/* Subtle glow effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm animate-shake text-center font-bold">
              {state.error}
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">Admin Identifier</label>
              <input
                type="text"
                name="identifier"
                required
                placeholder="admin@yanba.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-gold outline-none transition-all text-white text-sm focus:ring-1 focus:ring-gold/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">Secure Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-gold outline-none transition-all text-white text-sm focus:ring-1 focus:ring-gold/20"
              />
            </div>
          </div>

          <LuxuryButton type="submit" className="w-full py-5 rounded-2xl text-base font-bold tracking-widest" disabled={isPending}>
            {isPending ? 'VERIFYING...' : 'AUTHORIZE ACCESS'}
          </LuxuryButton>

          <div className="text-center pt-6 border-t border-white/5">
            <p className="text-white/20 text-[10px] uppercase tracking-[0.3em]">
              Yanba Perfumes B2B Security System
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}

export default AdminLoginPage
