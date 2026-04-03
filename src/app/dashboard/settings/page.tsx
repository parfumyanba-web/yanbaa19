'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import LuxuryButton from '@/components/ui/LuxuryButton'

const SettingsPage = () => {
  const [isPending, setIsPending] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignOut = async () => {
    setIsPending(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white/90">Account Settings</h1>
        <p className="text-white/40 text-sm">Manage your profile and security preferences</p>
      </header>

      <div className="glass-card p-8 space-y-8">
        <section className="space-y-4">
          <h3 className="text-lg font-bold">Session Management</h3>
          <p className="text-white/40 text-sm italic">You are currently logged in as a B2B partner.</p>
          <LuxuryButton 
            onClick={handleSignOut} 
            disabled={isPending}
            className="px-8 py-3 bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
          >
            {isPending ? 'Signing Out...' : 'Sign Out'}
          </LuxuryButton>
        </section>

        <div className="border-t border-white/5 pt-8">
          <p className="text-[10px] uppercase tracking-widest text-white/20">
            More settings coming soon: Password change, profile update, and notification preferences.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
