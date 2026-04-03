'use client'

import React from 'react'
import { wilayas } from '@/lib/data/wilayas'
import { useLanguage } from '@/context/LanguageContext'

interface WilayaSelectProps {
  value: string
  onChange: (value: string) => void
  label: string
  name?: string
  required?: boolean
}

const WilayaSelect: React.FC<WilayaSelectProps> = ({ value, onChange, label, name, required }) => {
  const { language } = useLanguage()

  return (
    <div className="space-y-1">
      <label className="text-[10px] uppercase tracking-widest text-white/50 ml-1">
        {label}
      </label>
      <div className="relative group">
        <select
          name={name}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:border-gold outline-none text-white text-sm appearance-none cursor-pointer transition-all hover:bg-white/[0.08]"
        >
          <option value="" className="bg-[#121212]">{language === 'ar' ? 'اختر الولاية' : 'Sélectionner la Wilaya'}</option>
          {wilayas.map((wilaya) => (
            <option key={wilaya.id} value={wilaya.name} className="bg-[#121212]">
              {wilaya.id} - {language === 'ar' ? wilaya.nameAr : wilaya.name}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gold/50 group-hover:text-gold transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default WilayaSelect
