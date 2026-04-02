'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import LuxuryButton from '@/components/ui/LuxuryButton'
import { signIn } from '@/lib/auth/actions'

const LoginPage = () => {
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await signIn(formData)
  }, null)

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#121212] p-6">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <Link href="/" className="text-4xl font-arabic gold-text-gradient block mb-8">ينبع</Link>
          <h2 className="text-2xl font-bold tracking-tight text-white/90">Welcome Back</h2>
          <p className="text-white/40 text-sm">B2B Partner Portal Login</p>
        </div>

        <form action={formAction} className="glass-card p-8 space-y-6">
          {state?.error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm animate-shake">
              {state.error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/50 ml-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                placeholder="05 / 06 / 07 ..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-colors text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/50 ml-1">Password</label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none transition-colors text-white"
              />
            </div>
          </div>

          <LuxuryButton type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Signing In...' : 'Sign In'}
          </LuxuryButton>

          <div className="text-center pt-4">
            <p className="text-white/30 text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-gold hover:underline">Request Access</Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}

export default LoginPage
