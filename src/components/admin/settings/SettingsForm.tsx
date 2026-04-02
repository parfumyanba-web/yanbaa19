'use client'

import React, { useState } from 'react'
import { Save, Globe, DollarSign, Bell } from 'lucide-react'
import { updatePlatformSettings } from '@/actions/settings'
import { useToast } from '@/components/providers/ToastProvider'
import LuxuryButton from '@/components/ui/LuxuryButton'

export const SettingsForm = ({ initialSettings }: { initialSettings: any[] }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()

  const findValue = (key: string) => {
    return initialSettings.find(s => s.key === key)?.value || {}
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const storeInfo = {
      name: formData.get('store_name'),
      email: formData.get('contact_email'),
      phone: formData.get('contact_phone'),
    }

    const { success, error } = await updatePlatformSettings('store_info', storeInfo)
    
    if (success) {
      showToast('Success', 'Settings updated successfully.', 'success')
    } else {
      showToast('Error', error || 'Failed to update settings', 'error')
    }
    setIsLoading(false)
  }

  const storeInfo = findValue('store_info')

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center gap-3 text-gold mb-2">
            <Globe size={20} />
            <h3 className="text-lg font-bold">General Store Info</h3>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Store Name</label>
              <input 
                name="store_name"
                defaultValue={storeInfo.name || 'Yanba Perfumes'}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-gold/50 transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Contact Email</label>
              <input 
                name="contact_email"
                defaultValue={storeInfo.email || 'contact@yanba.com'}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-gold/50 transition-colors"
                type="email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40">Support Phone</label>
              <input 
                name="contact_phone"
                defaultValue={storeInfo.phone || '+213 123 456 789'}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-gold/50 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-8 space-y-6">
            <div className="flex items-center gap-3 text-blue-400 mb-2">
              <DollarSign size={20} />
              <h3 className="text-lg font-bold">Financial Defaults</h3>
            </div>
            <div className="space-y-4 text-sm text-white/40">
              <p>Currency: <span className="text-white">Algerian Dinar (DZD)</span></p>
              <p>Tax Rate: <span className="text-white">19% (Standard)</span></p>
              <div className="flex items-center gap-2 text-amber-400/50 italic text-[10px] uppercase tracking-tighter">
                <Bell size={12} /> These values are currently read-only in the V1 trial.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <LuxuryButton type="submit" disabled={isLoading} className="px-12">
          {isLoading ? 'Saving...' : <><Save size={18} className="mr-2" /> Save Changes</>}
        </LuxuryButton>
      </div>
    </form>
  )
}
