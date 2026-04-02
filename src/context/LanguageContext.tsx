'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'ar' | 'fr'
type Direction = 'rtl' | 'ltr'

interface LanguageContextType {
  language: Language
  direction: Direction
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    store: 'المتجر',
    login: 'دخول',
    register: 'تسجيل',
    cart: 'السلة',
    hero_title: 'ينبع للعطور',
    hero_subtitle: 'فخامة الروائح الأصيلة لنخبة التجار في الجزائر',
    add_to_cart: 'إضافة للسلة',
    price: 'السعر',
    quantity: 'الكمية',
  },
  fr: {
    store: 'Boutique',
    login: 'Connexion',
    register: 'Inscription',
    cart: 'Panier',
    hero_title: 'Yanba Parfums',
    hero_subtitle: 'L\'élégance des fragrances authentiques pour l\'élite B2B en Algérie',
    add_to_cart: 'Ajouter au panier',
    price: 'Prix',
    quantity: 'Quantité',
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('ar')
  const [direction, setDirection] = useState<Direction>('rtl')

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    setDirection(lang === 'ar' ? 'rtl' : 'ltr')
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    localStorage.setItem('yanba-lang', lang)
  }

  useEffect(() => {
    const saved = localStorage.getItem('yanba-lang') as Language
    if (saved) setLanguage(saved)
  }, [])

  const t = (key: string) => translations[language][key] || key

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('useLanguage must be used within LanguageProvider')
  return context
}
