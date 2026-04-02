import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { UserList } from '@/components/admin/users/UserList'

const AdminUsers = async () => {
  const supabase = await createClient()
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white/90">Customer Management</h1>
          <p className="text-white/40 text-sm">Manage B2B partners and account access</p>
        </div>
      </header>

      <UserList initialUsers={(users || []) as any} />
    </div>
  )
}

export default AdminUsers
