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

  // 2. FALLBACK: Database Query
  // Only if metadata is missing, we check the profiles table.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError) {
    console.error(`[Admin Protection] Profile Fetch Error: ${profileError.message}`)
    redirect('/admin-login?error=ProfileNotFound')
  }

  if (profile?.role !== 'admin') {
    console.warn(`[Admin Protection] Unauthorized. Role: ${profile?.role}`)
    redirect('/admin-login?error=UnauthorizedRole')
  }

  return (
    <>
      {children}
    </>
  )
}
