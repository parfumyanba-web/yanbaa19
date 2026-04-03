'use client'

import React from 'react'

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string | null
  icon?: React.ReactNode
}

const FormInput: React.FC<FormInputProps> = ({ label, error, icon, className, ...props }) => {
  return (
    <div className="space-y-1 group">
      <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1 group-focus-within:text-gold transition-colors">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          className={`w-full bg-white/5 border rounded-xl px-4 py-3 outline-none text-white text-sm transition-all duration-300
            ${error ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 group-focus-within:border-gold hover:border-white/20'}
            ${className}`}
        />
        {icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-gold/50 transition-colors">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="text-[10px] text-red-400 mt-1 ml-1 animate-fade-in">{error}</p>}
    </div>
  )
}

export default FormInput
