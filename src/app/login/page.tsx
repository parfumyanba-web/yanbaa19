'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import LuxuryButton from '@/components/ui/LuxuryButton'
import { signIn } from '@/lib/auth/actions'
import { useLanguage } from '@/context/LanguageContext'

const LoginPage = () => {
  const { t } = useLanguage()
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await signIn(formData)
  }, null)

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#121212] p-6 font-alexandria">
      <Link 
        href="/" 
        className="fixed top-8 left-8 flex items-center gap-2 text-white/40 hover:text-gold transition-colors text-sm uppercase tracking-widest group"
      >
        <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
        {t('back_to_home')}
      </Link>
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <Link href="/" className="text-4xl font-arabic gold-text-gradient block mb-8">ينبع</Link>
          <h2 className="text-2xl font-bold tracking-tight text-white/90">{t('welcome_back')}</h2>
          <p className="text-white/40 text-sm">{t('partner_portal')}</p>
        </div>

        <form action={formAction} className="glass-card p-8 space-y-6 rounded-3xl border border-white/5 shadow-2xl">
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm animate-shake">
              {state.error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">{t('phone')}</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="05 / 06 / 07 ..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-colors text-white text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">{t('password')}</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-colors text-white text-sm"
              />
            </div>
          </div>

          <LuxuryButton type="submit" className="w-full py-4" disabled={isPending}>
            {isPending ? t('loading') : t('sign_in')}
          </LuxuryButton>

          <div className="text-center pt-4 border-t border-white/5">
            <p className="text-white/30 text-sm">
              {t('request_access')}{' '}
              <Link href="/register" className="text-gold hover:underline">{t('register')}</Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}

export default LoginPage
