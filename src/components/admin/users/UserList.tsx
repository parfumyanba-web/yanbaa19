'use client'

import React, { useEffect, useState } from 'react'
import { Search, Shield, ShieldOff, Trash2, MapPin, Store, Key } from 'lucide-react'
import { useRealtimeStore } from '@/store/useRealtimeStore'
import { useToast } from '@/components/providers/ToastProvider'
import { freezeUser, deleteUser, resetPassword } from '@/actions/users'
import { clsx } from 'clsx'

interface Profile {
  id: string
  full_name: string
  store_name: string
  phone: string
  wilaya: string
  commune: string
  is_active: boolean
  created_at: string
}

export const UserList = ({ initialUsers }: { initialUsers: Profile[] }) => {
  const { profiles, setProfiles, updateProfile } = useRealtimeStore()
  const [searchTerm, setSearchTerm] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    if (initialUsers) setProfiles(initialUsers)
  }, [initialUsers, setProfiles])

  const handleToggleFreeze = async (userId: string, currentStatus: boolean) => {
    const res = await freezeUser(userId, !currentStatus)
    if (res.success) {
      updateProfile({ id: userId, is_active: !currentStatus })
      showToast('Success', `User account ${!currentStatus ? 'activated' : 'deactivated'}.`, 'success')
    } else {
      showToast('Error', res.error || 'Failed to update status', 'error')
    }
  }

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      const res = await deleteUser(userId)
      if (res.success) {
        setProfiles(profiles.filter(p => p.id !== userId))
        showToast('Success', 'User deleted successfully.', 'success')
      } else {
        showToast('Error', res.error || 'Failed to delete user', 'error')
      }
    }
  }

  const handleResetPassword = async (userId: string) => {
    const res = await resetPassword(userId)
    if (res.success) {
      showToast('Success', 'Password reset instructions sent.', 'success')
    } else {
      showToast('Error', res.error || 'Failed to reset password', 'error')
    }
  }

  const filteredUsers = profiles.filter(user => 
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.store_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  )

  return (
    <div className="space-y-8">
      {/* Filter Bar */}
      <div className="flex gap-4 items-center glass-card p-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
          <input 
            type="text" 
            placeholder="Search by store name, phone or full name..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-gold/50 transition-colors text-sm text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.id} className="glass-card p-6 flex gap-6 items-start group hover:border-gold/30 transition-all bg-white/2">
              <div className="w-16 h-16 rounded-2xl gold-gradient p-[1px] flex-shrink-0">
                 <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center font-bold text-xl text-gold">
                   {user.full_name[0]}
                 </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white/90">{user.full_name}</h3>
                    <div className="flex items-center gap-2 text-gold text-xs uppercase tracking-widest font-medium">
                      <Store size={12} /> {user.store_name}
                    </div>
                  </div>
                  <span className={clsx(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all duration-500 border",
                    user.is_active ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'
                  )}>
                    {user.is_active ? 'Active' : 'Frozen'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                   <div className="flex items-center gap-2 text-white/40">
                     <MapPin size={14} className="text-gold" />
                     {user.wilaya}, {user.commune}
                   </div>
                   <div className="text-white/40">Phone: <span className="text-white/80 font-mono tracking-tight">{user.phone}</span></div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-white/5">
                   <button 
                    onClick={() => handleToggleFreeze(user.id, user.is_active)}
                    className={clsx(
                      "flex-1 flex items-center justify-center gap-2 transition-all py-2 rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-black/20 border border-white/5",
                      user.is_active ? "bg-white/10 text-white/60 hover:bg-amber-400/20 hover:text-amber-400" : "bg-green-400/10 text-green-400 hover:bg-green-400 hover:text-black"
                    )}
                   >
                     {user.is_active ? <><ShieldOff size={14} /> Freeze</> : <><Shield size={14} /> Unfreeze</>}
                   </button>
                   <button 
                    onClick={() => handleResetPassword(user.id)}
                    className="px-4 py-2 bg-white/5 text-white/40 hover:text-gold transition-all rounded-lg border border-white/5"
                    title="Reset Password"
                   >
                     <Key size={14} />
                   </button>
                   <button 
                    onClick={() => handleDelete(user.id)}
                    className="px-4 py-2 bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white transition-all rounded-lg border border-red-400/10"
                   >
                      <Trash2 size={14} />
                   </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center text-white/20 uppercase tracking-widest italic glass-card border-dashed">
             No matches found
          </div>
        )}
      </div>
    </div>
  )
}
