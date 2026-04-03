import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// ONE-TIME admin setup endpoint. Uses Service Role Key to bypass RLS.
// After running once, this route should be deleted for security.
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Service role key not configured' }, { status: 500 })
  }

  // Create admin client with service role (bypasses all RLS)
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const adminEmail = 'admin@gmail.com'
  const adminPassword = '123456'

  try {
    // Step 1: Check if admin user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingAdmin = existingUsers?.users?.find(u => u.email === adminEmail)

    let adminId: string

    if (existingAdmin) {
      // Step 2a: Update existing admin user's password and metadata
      const { data: updated, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingAdmin.id,
        {
          password: adminPassword,
          email_confirm: true,
          app_metadata: { provider: 'email', providers: ['email'], role: 'admin' },
          user_metadata: { full_name: 'Site Administrator', role: 'admin' },
        }
      )
      if (updateError) {
        return NextResponse.json({ error: `Failed to update admin: ${updateError.message}` }, { status: 500 })
      }
      adminId = existingAdmin.id
    } else {
      // Step 2b: Create new admin user via Admin API (proper password hashing)
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        app_metadata: { provider: 'email', providers: ['email'], role: 'admin' },
        user_metadata: { full_name: 'Site Administrator', role: 'admin' },
      })
      if (createError) {
        return NextResponse.json({ error: `Failed to create admin: ${createError.message}` }, { status: 500 })
      }
      adminId = newUser.user.id
    }

    // Step 3: Ensure profile exists with admin role (service role bypasses RLS)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: adminId,
        full_name: 'Site Administrator',
        phone: '0000000000',
        store_name: 'Yanba Admin',
        address: 'HQ Algiers',
        wilaya: 'Alger',
        commune: 'Centre',
        role: 'admin',
        is_active: true,
      }, { onConflict: 'id' })

    if (profileError) {
      return NextResponse.json({ error: `Profile error: ${profileError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Admin account ready! Login with: ${adminEmail} / ${adminPassword}`,
      adminId,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
