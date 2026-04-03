'use client'

import React, { useActionState, useState } from 'react'
import Link from 'next/link'
import LuxuryButton from '@/components/ui/LuxuryButton'
import { signUp } from '@/lib/auth/actions'
import { useLanguage } from '@/context/LanguageContext'

const RegisterPage = () => {
  const { t } = useLanguage()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    if (password !== confirmPassword) {
      setValidationError(t('password_mismatch'))
      return { error: t('password_mismatch') }
    }
    setValidationError(null)
    return await signUp(formData)
  }, null)

  return (
    <main className="min-h-screen py-20 flex flex-col items-center justify-center bg-[#121212] p-6 lg:p-20 font-alexandria">
      <Link 
        href="/" 
        className="fixed top-8 left-8 flex items-center gap-2 text-white/40 hover:text-gold transition-colors text-sm uppercase tracking-widest group"
      >
        <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
        {t('back_to_home')}
      </Link>
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <Link href="/" className="text-4xl font-arabic gold-text-gradient block mb-8">ينبع</Link>
          <h2 className="text-2xl font-bold tracking-tight text-white/90">{t('create_account')}</h2>
          <p className="text-gold/50 text-[10px] uppercase tracking-[0.3em] font-black">{t('join_yanba')}</p>
        </div>

        <form action={formAction} className="glass-card p-10 grid grid-cols-1 md:grid-cols-2 gap-8 rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
          {(state?.error || validationError) && (
            <div className="md:col-span-2 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm animate-shake">
              {state?.error || validationError}
            </div>
          )}

          {state && 'success' in state && state.success && (
            <div className="md:col-span-2 bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm">
              {t('success_request')} <Link href="/login" className="underline">{t('login')}</Link>
            </div>
          )}

          <div className="space-y-6">
             <h3 className="text-gold text-xs font-bold uppercase tracking-widest">{t('personal_info')}</h3>
             <div className="space-y-4">
               <div>
                 <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">{t('full_name')}</label>
                 <input name="full_name" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none text-white text-sm" />
               </div>
               <div>
                 <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">{t('phone')}</label>
                 <input name="phone" type="tel" required autoComplete="off" placeholder="05 / 06 / 07 ..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none text-white text-sm" />
               </div>
               <div>
                 <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">{t('password')}</label>
                 <input name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none text-white text-sm" />
               </div>
               <div>
                 <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">{t('confirm_password')}</label>
                 <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full bg-white/5 border rounded-xl px-4 py-3 outline-none text-white text-sm transition-colors ${password === confirmPassword && password.length > 0 ? 'border-green-500/50' : 'border-white/10 focus:border-gold'}`} />
               </div>
             </div>
          </div>

          <div className="space-y-6">
             <h3 className="text-gold text-xs font-bold uppercase tracking-widest">{t('business_info')}</h3>
             <div className="space-y-4">
               <div>
                 <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">{t('store_name')}</label>
                 <input name="store_name" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none text-white text-sm" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">{t('wilaya')}</label>
                   <input name="wilaya" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none text-white text-sm" />
                 </div>
                 <div>
                   <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">{t('commune')}</label>
                   <input name="commune" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none text-white text-sm" />
                 </div>
               </div>
               <div>
                 <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">{t('address')}</label>
                 <input name="address" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none text-white text-sm" />
               </div>
             </div>
          </div>

          <div className="md:col-span-2 pt-6 border-t border-white/5">
            <LuxuryButton type="submit" className="w-full py-4 text-lg" disabled={isPending}>
              {isPending ? t('loading') : t('sign_up')}
            </LuxuryButton>
            <p className="text-center text-white/30 text-sm mt-6 font-alexandria">
              {t('already_have_account')}{' '}
              <Link href="/login" className="text-gold hover:underline">{t('login')}</Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}

export default RegisterPage
