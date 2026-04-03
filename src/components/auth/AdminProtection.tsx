import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import React from 'react'

interface AdminProtectionProps {
  children: React.ReactNode
}

export default async function AdminProtection({ children }: AdminProtectionProps) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/admin-login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    // Optionally log out if a non-admin tries to access admin routes
    redirect('/admin-login?error=Unauthorized')
  }

  return (
    <>
      {children}
    </>
  )
}
