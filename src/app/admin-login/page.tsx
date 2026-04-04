'use client'

import React, { useActionState, Suspense } from 'react'
import Link from 'next/link'
import LuxuryButton from '@/components/ui/LuxuryButton'
import { adminSignIn } from '@/lib/auth/actions'
import { useLanguage } from '@/context/LanguageContext'
import { ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

const AdminLoginForm = () => {
  const { t, direction } = useLanguage()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')

  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await adminSignIn(formData)
    },
    null
  )

  const getErrorMessage = (err: string | null) => {
    if (!err) return null
    switch (err) {
      case 'NotLoggedIn': return t('err_not_logged_in')
      case 'ProfileNotFound': return t('err_profile_not_found')
      case 'UnauthorizedRole': return t('err_unauthorized_role')
      case 'Unauthorized': return t('err_unauthorized')
      default: return err
    }
  }

  const displayError = state?.error || getErrorMessage(urlError)

  return (
    <div className="w-full max-w-md space-y-12 animate-fade-in px-4 sm:px-0">
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto border border-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
          <ShieldCheck size={40} className="text-gold" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white/90">
            {t('admin_dashboard')}
          </h1>
          <p className="text-gold/50 text-[10px] uppercase tracking-[0.3em] font-black">
            {t('admin_login_subtitle')}
          </p>
        </div>
      </div>

      <form action={formAction} className="glass-card p-8 sm:p-10 space-y-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
        
        {displayError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm animate-shake flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1 mb-2 block font-bold">
              {t('email_address')}
            </label>
            <input 
              name="identifier" 
              type="email"
              required 
              placeholder="admin@yanba.com"
              autoComplete="off"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-gold/50 outline-none text-white text-sm transition-all focus:bg-white/[0.08]" 
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1 mb-2 block font-bold">
              {t('password')}
            </label>
            <input 
              name="password" 
              type="password" 
              required 
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-gold/50 outline-none text-white text-sm transition-all focus:bg-white/[0.08]" 
            />
          </div>
        </div>

        <LuxuryButton type="submit" className="w-full py-5 text-lg group/btn" disabled={isPending}>
          <span className="flex items-center justify-center gap-3">
            {isPending ? t('loading') : t('sign_in')}
            {!isPending && <ArrowRight size={20} className={`opacity-50 group-hover/btn:translate-x-1 transition-transform ${direction === 'rtl' ? 'rotate-180' : ''}`} />}
          </span>
        </LuxuryButton>
      </form>

      <p className="text-center text-white/20 text-[10px] uppercase tracking-widest font-medium">
        {t('authorized_only')}
      </p>
    </div>
  )
}

const AdminLoginPage = () => {
  const { t, direction } = useLanguage()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] p-6 lg:p-20 font-alexandria">
      <Link 
        href="/" 
        className="fixed top-8 left-8 flex items-center gap-2 text-white/40 hover:text-gold transition-colors text-sm uppercase tracking-widest group no-print z-20"
      >
        <span className={direction === 'rtl' ? 'rotate-180' : ''}>←</span>
        {t('back_to_home')}
      </Link>

      <Suspense fallback={
        <div className="text-gold uppercase tracking-[0.3em] font-arabic animate-pulse text-sm">
          {t('loading')}
        </div>
      }>
        <AdminLoginForm />
      </Suspense>
    </main>
  )
}

export default AdminLoginPage
