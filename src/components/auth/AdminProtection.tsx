import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import React from 'react'

interface AdminProtectionProps {
  children: React.ReactNode
}

export default async function AdminProtection({ children }: AdminProtectionProps) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  console.log(`[Admin Protection] Checking session for user: ${user?.email || 'None'}`);

  if (authError || !user) {
    console.warn(`[Admin Protection] No authenticated user. Redirecting to admin-login. Error: ${authError?.message}`)
    redirect('/admin-login?error=NotLoggedIn')
  }

  // 1. FAST CHECK: JWT Metadata
  const isJwtAdmin = user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin'
  console.log(`[Admin Protection] Is JWT Admin: ${isJwtAdmin}`);
  
  if (isJwtAdmin) {
    return <>{children}</>
  }

  // 2. FALLBACK: Database Query (Using isolated admin_profiles table)
  console.log(`[Admin Protection] Falling back to DB query for user ID: ${user.id}`);
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
