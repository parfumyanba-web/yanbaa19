import AdminProtection from '@/components/auth/AdminProtection'
import AdminDashboardLayout from '@/components/admin/AdminDashboardLayout'
import React from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProtection>
      <AdminDashboardLayout>
        {children}
      </AdminDashboardLayout>
    </AdminProtection>
  )
}
