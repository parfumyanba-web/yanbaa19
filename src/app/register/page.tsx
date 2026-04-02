import React from 'react'
import Link from 'next/link'
import LuxuryButton from '@/components/ui/LuxuryButton'
import { signUp } from '@/lib/auth/actions'

const RegisterPage = () => {
  return (
    <main className="min-h-screen py-20 flex items-center justify-center bg-[#121212] p-6 lg:p-20">
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <Link href="/" className="text-4xl font-arabic gold-text-gradient block mb-8">ينبع</Link>
          <h2 className="text-2xl font-bold tracking-tight text-white/90">Join Our B2B Network</h2>
          <p className="text-white/40 text-sm">Register your store for wholesale access</p>
        </div>

        <form action={signUp} className="glass-card p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
             <h3 className="text-gold text-xs font-bold uppercase tracking-widest">Personal Info</h3>
             <div className="space-y-4">
               <div>
                 <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">Full Name</label>
                 <input name="full_name" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none text-white text-sm" />
               </div>
               <div>
                 <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">Phone Number</label>
                 <input name="phone" type="tel" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none text-white text-sm" />
               </div>
               <div>
                 <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">Password</label>
                 <input name="password" type="password" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none text-white text-sm" />
               </div>
             </div>
          </div>

          <div className="space-y-6">
             <h3 className="text-gold text-xs font-bold uppercase tracking-widest">Business Info</h3>
             <div className="space-y-4">
               <div>
                 <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">Store Name</label>
                 <input name="store_name" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none text-white text-sm" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">Wilaya</label>
                   <input name="wilaya" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none text-white text-sm" />
                 </div>
                 <div>
                   <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">Commune</label>
                   <input name="commune" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none text-white text-sm" />
                 </div>
               </div>
               <div>
                 <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">Address</label>
                 <input name="address" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none text-white text-sm" />
               </div>
             </div>
          </div>

          <div className="md:col-span-2 pt-6">
            <LuxuryButton type="submit" className="w-full py-4 text-lg">
              Create Partner Account
            </LuxuryButton>
            <p className="text-center text-white/30 text-sm mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-gold hover:underline">Log In</Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  )
}

export default RegisterPage
