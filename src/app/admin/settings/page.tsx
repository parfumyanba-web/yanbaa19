import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/admin/settings/SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: settings } = await supabase
    .from('settings')
    .select('*')

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white/90">Platform Settings</h1>
        <p className="text-white/40 text-sm">Configure global store rules and appearance</p>
      </header>

      <SettingsForm initialSettings={settings || []} />
    </div>
  )
}
