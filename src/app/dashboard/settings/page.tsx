'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/context/LanguageContext'
import { useRouter } from 'next/navigation'
import LuxuryButton from '@/components/ui/LuxuryButton'
import { User, Phone, MapPin, ShieldCheck, LogIn, Key, Globe, Clock } from 'lucide-react'

export default function SettingsPage() {
  const { t, direction } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [logs, setLogs] = useState<any[]>([])
  const [msg, setMsg] = useState({ text: '', type: '' })
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    wilaya: '',
    commune: '',
    address: '',
    store_name: ''
  })
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: p, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        
        if (p) {
          setProfile(p)
          setFormData({
            full_name: p.full_name || '',
            phone: p.phone || '',
            wilaya: p.wilaya || '',
            commune: p.commune || '',
            address: p.address || '',
            store_name: p.store_name || ''
          })
        } else {
          // Self-Healing: If profile row is missing, pre-fill from auth metadata
          const meta = user.user_metadata
          if (meta) {
            setFormData({
              full_name: meta.full_name || '',
              phone: meta.phone || '',
              wilaya: meta.wilaya || '',
              commune: meta.commune || '',
              address: meta.address || '',
              store_name: meta.store_name || ''
            })
            // Set profile to a dummy object to allow the page to render
            setProfile({ id: user.id, ...meta, placeholder: true })
          } else {
            console.error(`[Settings] Profile fetch failed for user ${user.id}:`, error)
            setMsg({ text: error?.message || 'Profile not found', type: 'error' })
            setProfile('error')
            return
          }
        }

        // Fetch Activity Logs - Wrap in try/catch or handle error to prevent page break if table missing
        const { data: userLogs, error: logError } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
        
        if (logError) {
          console.warn('[Settings] Activity logs fetch failed (table might not exist):', logError)
        } else if (userLogs) {
          setLogs(userLogs)
        }
      } else {
        window.location.href = '/login'
      }
    }
    loadData()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg({ text: '', type: '' })
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('profiles').upsert({ id: user.id, ...formData })
    if (error) {
      setMsg({ text: error.message, type: 'error' })
    } else {
      setMsg({ text: t('profile_updated'), type: 'success' })
      
      // Log Activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'PROFILE_UPDATE',
        description: 'Updated personal profile information'
      })
      
      router.refresh()
    }
    setLoading(false)
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMsg({ text: t('passwords_not_match'), type: 'error' })
      return
    }
    setLoading(true)
    setMsg({ text: '', type: '' })

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: passwordForm.newPassword })
    if (error) {
      setMsg({ text: error.message, type: 'error' })
    } else {
      // Get user for logging
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          action: 'PASSWORD_CHANGE',
          description: 'User updated their account password'
        })
      }

      setMsg({ text: t('password_updated'), type: 'success' })
      setPasswordForm({ newPassword: '', confirmPassword: '' })
      router.refresh()
    }
    setLoading(false)
  }

  if (profile === 'error') return (
    <div className="p-12 text-center space-y-6">
       <p className="text-red-400 font-bold uppercase tracking-widest">{t('error_loading_profile') || 'Error Loading Profile'}</p>
       <LuxuryButton onClick={() => window.location.reload()}>{t('retry') || 'Retry'}</LuxuryButton>
    </div>
  )

  if (!profile) return <div className="p-8 text-center text-gold uppercase tracking-[0.3em] font-arabic animate-pulse text-sm">{t('loading')}</div>

  return (
    <div className="space-y-8 animate-fade-in p-4 sm:p-0">
      <header>
        <h1 className="text-3xl font-bold font-arabic gold-text-gradient">{t('settings')}</h1>
        <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mt-2">{t('settings_subtitle')}</p>
      </header>

      {msg.text && (
        <div className={`p-4 rounded-xl text-sm border ${msg.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Info */}
        <form onSubmit={handleUpdateProfile} className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gold border border-white/10">
              <User size={20} />
            </div>
            <h3 className="text-xl font-bold font-arabic text-white/90">{t('personal_information')}</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1 mb-2 block">{t('full_name')}</label>
              <input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold/50 outline-none transition-all" required />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1 mb-2 block">{t('store_name')}</label>
              <input value={formData.store_name} onChange={e => setFormData({...formData, store_name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold/50 outline-none transition-all" required />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1 mb-2 block">{t('phone_number')}</label>
              <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold/50 outline-none transition-all" required dir="ltr" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1 mb-2 block">{t('wilaya')}</label>
                <input value={formData.wilaya} onChange={e => setFormData({...formData, wilaya: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold/50 outline-none transition-all" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1 mb-2 block">{t('commune')}</label>
                <input value={formData.commune} onChange={e => setFormData({...formData, commune: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold/50 outline-none transition-all" />
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1 mb-2 block">{t('address')}</label>
              <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold/50 outline-none transition-all resize-none" rows={3} />
            </div>
          </div>

          <LuxuryButton type="submit" className="w-full py-4 mt-6" disabled={loading}>
            {loading ? t('saving') : t('save_changes')}
          </LuxuryButton>
        </form>

        {/* Security Info */}
        <div className="space-y-8">
          <form onSubmit={handleUpdatePassword} className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gold border border-white/10">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-xl font-bold font-arabic text-white/90">{t('security_settings')}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1 mb-2 block">{t('new_password')}</label>
                <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold/50 outline-none transition-all" minLength={6} required />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1 mb-2 block">{t('confirm_password')}</label>
                <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-gold/50 outline-none transition-all" minLength={6} required />
              </div>
            </div>

            <LuxuryButton type="submit" className="w-full py-4 mt-6" disabled={loading || !passwordForm.newPassword}>
              {loading ? t('updating') : t('update_password')}
            </LuxuryButton>
          </form>
        </div>

        {/* Activity Log */}
        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-6 lg:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-gold border border-white/10">
              <Clock size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-arabic text-white/90">{t('activity_log')}</h3>
              <p className="text-white/30 text-[10px] uppercase tracking-widest">{t('recent_activity')}</p>
            </div>
          </div>

          <div className="space-y-4">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white/2 border border-white/5 hover:border-white/10 transition-all gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      log.action === 'LOGIN' ? 'bg-blue-500/10 text-blue-400' : 
                      log.action === 'PASSWORD_CHANGE' ? 'bg-red-500/10 text-red-400' : 
                      'bg-gold/10 text-gold'
                    }`}>
                      {log.action === 'LOGIN' ? <LogIn size={18} /> : 
                       log.action === 'PASSWORD_CHANGE' ? <Key size={18} /> : 
                       <User size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white/90 uppercase tracking-tighter">
                        {t(`activity_${log.action.toLowerCase()}`)}
                      </p>
                      <p className="text-xs text-white/40">{log.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest text-white/30">
                    {log.ip_address && (
                      <div className="flex items-center gap-1.5">
                        <Globe size={12} />
                        {log.ip_address}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <Clock size={12} />
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center border border-dashed border-white/5 rounded-3xl">
                <p className="text-white/20 text-xs uppercase tracking-widest">{t('no_activity')}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
