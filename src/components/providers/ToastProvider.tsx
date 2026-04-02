'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCircle, AlertCircle, Info, X } from 'lucide-react'

export interface ToastMessage {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

interface ToastContextProps {
  showToast: (title: string, message: string, type?: ToastMessage['type']) => void
}

const ToastContext = React.createContext<ToastContextProps | undefined>(undefined)

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within a ToastProvider')
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, title, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className="pointer-events-auto"
            >
              <div className="glass-card !p-0 overflow-hidden border border-white/10 shadow-2xl min-w-[320px]">
                <div className="p-4 flex gap-4">
                  <div className={`mt-1 ${getTypeColor(toast.type)}`}>
                    {getIcon(toast.type)}
                  </div>
                  <div className="flex-1 pr-4">
                    <h4 className="text-sm font-bold text-white/90">{toast.title}</h4>
                    <p className="text-xs text-white/50 mt-1">{toast.message}</p>
                  </div>
                  <button 
                    onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                    className="text-white/20 hover:text-white/80 transition-colors self-start"
                  >
                    <X size={14} />
                  </button>
                </div>
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 5, ease: 'linear' }}
                  className={`h-1 ${getBgColor(toast.type)} opacity-50`}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return <CheckCircle size={18} />
    case 'error': return <AlertCircle size={18} />
    case 'warning': return <AlertCircle size={18} />
    default: return <Info size={18} />
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'success': return 'text-green-400'
    case 'error': return 'text-red-400'
    case 'warning': return 'text-amber-400'
    default: return 'text-blue-400'
  }
}

const getBgColor = (type: string) => {
  switch (type) {
    case 'success': return 'bg-green-400'
    case 'error': return 'bg-red-400'
    case 'warning': return 'bg-amber-400'
    default: return 'bg-blue-400'
  }
}
