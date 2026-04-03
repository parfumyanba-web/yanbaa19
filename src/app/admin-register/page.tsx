'use client'

import React, { useTransition, useState } from 'react'
import Link from 'next/link'
import LuxuryButton from '@/components/ui/LuxuryButton'
import FormInput from '@/components/ui/FormInput'
import { adminSignUp } from '@/lib/auth/actions'
import { useLanguage } from '@/context/LanguageContext'

const AdminRegisterPage = () => {
  const { t } = useLanguage()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await adminSignUp(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    })
  }

  return (
    <main className="min-h-screen py-20 flex flex-col items-center justify-center bg-[#0a0a0a] p-6 lg:p-20 font-alexandria relative overflow-hidden">
      {/* Intense Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Link 
        href="/admin-login" 
        className="fixed top-8 left-8 flex items-center gap-2 text-white/40 hover:text-gold transition-colors text-sm uppercase tracking-widest group z-10"
      >
        <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
        {t('back_to_login') || 'Back to Login'}
      </Link>

      <div className="w-full max-w-lg space-y-10 relative z-10 animate-fade-in">
        <div className="text-center space-y-4">
          <div className="inline-block px-4 py-1 rounded-full border border-gold/20 bg-gold/5 text-gold text-[10px] font-black uppercase tracking-[0.3em] mb-4">
            Security Clearance Required
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-white/90">Admin Onboarding</h2>
          <p className="text-white/40 text-xs uppercase tracking-widest">Yanba Perfumes Dashboard Access</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-10 rounded-[2.5rem] border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute inset-0 noise-overlay opacity-[0.05] pointer-events-none" />
          
          {error && (
            <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm animate-shake flex items-center gap-3">
              <span className="text-lg">🛑</span>
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center space-y-6 py-4 animate-slide-up">
              <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto border border-gold/30">
                <span className="text-4xl">👑</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Access Granted</h3>
                <p className="text-white/40 text-sm">Your administrator account is ready.</p>
              </div>
              <Link href="/admin" className="block">
                <LuxuryButton type="button" className="w-full">Enter Dashboard</LuxuryButton>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <FormInput 
                label="Full Name" 
                name="full_name" 
                required 
                placeholder="Manager Name"
              />
              <FormInput 
                label="Professional Email" 
                name="email" 
                type="email" 
                required 
                placeholder="admin@yanba.com"
              />
              <FormInput 
                label="Password" 
                name="password" 
                type="password" 
                required 
              />
              <div className="pt-4 border-t border-white/5">
                <FormInput 
                  label="Master Security Token" 
                  name="token" 
                  type="password" 
                  required 
                  placeholder="••••••••••••"
                  className="bg-gold/5 border-gold/20 focus:border-gold"
                />
                <p className="text-[9px] text-white/20 mt-2 ml-1 italic">
                  Contact the system architect if you do not have a token.
                </p>
              </div>

              <div className="pt-6">
                <LuxuryButton type="submit" disabled={isPending} className="w-full py-4 text-sm font-bold tracking-widest">
                  {isPending ? 'VALIDATING...' : 'CREATE ADMIN ACCOUNT'}
                </LuxuryButton>
              </div>
            </div>
          )}
        </form>

        <p className="text-center text-white/20 text-[10px] uppercase tracking-widest">
          Authored by Antigravity v2.0 • Secure Transmission
        </p>
      </div>
    </main>
  )
}

export default AdminRegisterPage
