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
    // Navbar
    store: 'المتجر',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    cart: 'سلة المشتريات',
    admin_dashboard: 'لوحة التحكم',
    
    // Auth
    welcome_back: 'مرحباً بك مجدداً',
    partner_portal: 'بوابة الشركاء المعتمدين',
    back_to_home: 'العودة للرئيسية',
    phone: 'رقم الهاتف',
    password: 'كلمة المرور',
    confirm_password: 'تأكيد كلمة المرور',
    sign_in: 'دخول',
    create_account: 'فتح حساب جديد',
    already_have_account: 'لديك حساب بالفعل؟',
    request_access: 'طلب الانضمام لشبكتنا',
    personal_info: 'المعلومات الشخصية',
    business_info: 'معلومات النشاط التجاري',
    full_name: 'الاسم الكامل',
    store_name: 'اسم المحل / العلامة',
    wilaya: 'الولاية',
    commune: 'البلدية',
    address: 'العنوان بالتفصيل',
    password_mismatch: 'كلمات المرور غير متطابقة',
    success_request: 'تم استلام طلبك بنجاح! سنتواصل معك قريباً.',
    
    // Store
    luxury_collection: 'تشكيلتنا الفاخرة',
    store_subtitle: 'أرقى العطور والزيوت الأصلية لتجارة الجملة في الجزائر',
    filter_all: 'كل المنتجات',
    add_to_cart: 'إضافة للسلة',
    price_dzd: 'د.ج',
    empty_store: 'لا توجد منتجات حالياً',
    
    // Homepage
    hero_title: 'ينبع للعطور',
    hero_subtitle: 'فخامة الروائح الأصيلة لنخبة التجار في الجزائر',
    explore_collection: 'اكتشف المجموعة',
    quality_title: 'الجودة والتميز في كل قطرة',
    quality_desc: 'نقدم لكم أجود أنواع العطور والزيوت العطرية بالجملة، مصممة خصيصاً لتلبية احتياجات سوقكم وتجاوز توقعات عملائكم.',
    scroll_explore: 'مرر للأسفل لاكتشاف المزيد',
    
    // Footer & General
    rights: 'جميع الحقوق محفوظة - ينبع للعطور',
    location: 'الجزائر العاصمة، الجزائر',
    contact_us: 'اتصل بنا',
    privacy_policy: 'سياسة الخصوصية',
    terms_of_service: 'شروط الخدمة',
    shipping_policy: 'سياسة الشحن',
    loading: 'جاري التحميل...',
  },
  fr: {
    // Navbar
    store: 'Boutique',
    login: 'Connexion',
    register: 'Inscription',
    cart: 'Votre Panier',
    admin_dashboard: 'Administration',
    
    // Auth
    welcome_back: 'Ravi de vous revoir',
    partner_portal: 'Portail Partenaires Agréés',
    back_to_home: 'Retour à l\'accueil',
    phone: 'Numéro de téléphone',
    password: 'Mot de passe',
    confirm_password: 'Confirmer le mot de passe',
    sign_in: 'Se connecter',
    create_account: 'Créer un compte',
    already_have_account: 'Déjà inscrit ?',
    request_access: 'Demander l\'accès grossiste',
    personal_info: 'Informations Personnelles',
    business_info: 'Informations Commerciales',
    full_name: 'Nom complet',
    store_name: 'Nom de l\'établissement',
    wilaya: 'Wilaya',
    commune: 'Commune',
    address: 'Adresse complète',
    password_mismatch: 'Les mots de passe ne correspondent pas',
    success_request: 'Demande reçue avec succès ! Nous vous contacterons bientôt.',
    
    // Store
    luxury_collection: 'Collection Prestige',
    store_subtitle: 'Les plus grandes fragrances pour les grossistes en Algérie',
    filter_all: 'Tous les produits',
    add_to_cart: 'Ajouter au panier',
    price_dzd: 'DZD',
    empty_store: 'Aucun produit disponible',
    
    // Homepage
    hero_title: 'Yanba Parfums',
    hero_subtitle: 'L\'excellence des fragrances authentiques pour les professionnels',
    explore_collection: 'Découvrir la collection',
    quality_title: 'Qualité et Excellence',
    quality_desc: 'Nous vous offrons les meilleures huiles parfumées en gros, conçues pour sublimer votre offre commerciale.',
    scroll_explore: 'Défiler pour explorer',
    
    // Footer & General
    rights: 'Tous droits réservés - Yanba Parfums',
    location: 'Alger, Algérie',
    contact_us: 'Contactez-nous',
    privacy_policy: 'Politique de confidentialité',
    terms_of_service: 'Conditions d\'utilisation',
    shipping_policy: 'Politique de livraison',
    loading: 'Chargement en cours...',
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
