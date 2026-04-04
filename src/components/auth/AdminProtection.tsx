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
    console.warn('[Admin Protection] User not authenticated, redirecting to login.')
    redirect('/admin-login?error=NotLoggedIn')
  }

  // 1. FAST CHECK: JWT Metadata
  // This avoids a database query if the role is already in the token.
  const isJwtAdmin = user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin'
  
  if (isJwtAdmin) {
    return <>{children}</>
  }

  // 2. FALLBACK: Database Query (Using isolated admin_profiles table)
  const { data: adminProfile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('is_active')
    .eq('id', user.id)
    .single()

  if (profileError || !adminProfile || !adminProfile.is_active) {
    console.error(`[Admin Protection] Admin Profile Not Found or Inactive. Error: ${profileError?.message}`)
    redirect('/admin-login?error=UnauthorizedRole')
  }

  return (
    <>
      {children}
    </>
  )
}
