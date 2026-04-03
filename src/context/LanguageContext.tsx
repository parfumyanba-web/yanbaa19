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
    request_access: 'انضم إلينا الآن',
    join_yanba: 'انضم إلى عائلة ينبع للعطور',
    personal_info: 'المعلومات الشخصية',
    business_info: 'معلومات النشاط التجاري',
    full_name: 'الاسم الكامل',
    store_name: 'اسم المحل / العلامة',
    wilaya: 'الولاية',
    commune: 'البلدية',
    address: 'العنوان بالتفصيل',
    password_mismatch: 'كلمات المرور غير متطابقة',
    success_request: 'تم إنشاء حسابك بنجاح! جاري تحويلك للمتجر...',
    account_created: 'تم إنشاء الحساب بنجاح',
    step_1_title: 'المعلومات الشخصية',
    step_1_subtitle: 'بدء الرحلة مع ينبع',
    step_2_title: 'معلومات النشاط',
    step_2_subtitle: 'أخبرنا عن متجرك أو ورشتك',
    step_3_title: 'موقع التوصيل',
    step_3_subtitle: 'أين نرسل طلباتك؟',
    continue: 'استمرار',
    back: 'رجوع',
    processing: 'جاري المعالجة...',
    required: 'هذا الحقل مطلوب',
    invalid_phone: 'رقم هاتف غير صحيح (05/06/07)',
    password_too_short: 'كلمة المرور قصيرة جداً (6 رموز)',
    store_placeholder: 'مثلاً: محل ينبع للعطور',
    
    // Store
    luxury_collection: 'تشكيلتنا الفاخرة',
    store_subtitle: 'أرقى العطور والزيوت الأصلية لتجارة الجملة في الجزائر',
    filter_all: 'كل المنتجات',
    add_to_cart: 'إضافة إلى السلة',
    select_weight: 'اختر الكمية / الوزن',
    price_dzd: 'د.ج',
    empty_store: 'لا توجد منتجات حالياً',
    
    // Homepage
    hero_title: 'ينبع للعطور',
    hero_subtitle: 'فخامة الروائح الأصيلة لنخبة التجار في الجزائر',
    explore_collection: 'اكتشف المجموعة',
    quality_title: 'الجودة والتميز في كل قطرة',
    quality_desc: 'نقدم لكم أجود أنواع العطور والزيوت العطرية بالجملة، مصممة خصيصاً لتلبية احتياجات سوقكم وتجاوز توقعات عملائكم.',
    scroll_explore: 'مرر للأسفل لاكتشاف المزيد',
    new_arrivals: 'وصل حديثاً',
    
    // Checkout
    checkout_title: 'إتمام الطلب',
    review_cart: 'مراجعة السلة',
    shipping_details: 'معلومات الشحن',
    order_summary: 'ملخص الطلب',
    place_order: 'تأكيد الطلب',
    order_success: 'تم إرسال طلبك بنجاح!',
    order_success_desc: 'سنتواصل معك قريباً لتأكيد الشحن.',
    back_to_dashboard: 'العودة للوحة التحكم',
    empty_checkout: 'سلتك فارغة، لا يمكنك إتمام الطلب.',
    
    // Footer & General
    rights: 'جميع الحقوق محفوظة - ينبع للعطور',
    location: 'الجزائر العاصمة، الجزائر',
    contact_us: 'اتصل بنا',
    privacy_policy: 'سياسة الخصوصية',
    terms_of_service: 'شروط الخدمة',
    shipping_policy: 'سياسة الشحن',
    loading: 'جاري التحميل...',
    address_label: 'العنوان',
    phone_label: 'الهاتف',
    whatsapp_label: 'واتساب',
    follow_us: 'تابعونا',
    
    // Cart
    your_cart: 'سلة المشتريات',
    cart_empty: 'السلة فارغة حالياً',
    subtotal: 'المجموع الفرعي',
    checkout: 'إتمام الطلب',
    continue_shopping: 'مواصلة التسوق',
    items_count: 'قطع',
    
    // Dashboard Components
    order_ref: 'رقم الطلب',
    order_status: 'حالة الطلب',
    total_amount: 'المبلغ الإجمالي',
    paid_amount: 'المبلغ المدفوع',
    view_details: 'عرض التفاصيل',
    no_orders: 'أحدث الطلبات',
    stock: 'المخزون',
    dashboard_overview: 'نظرة عامة',
    revenue: 'الأرباح',
    active_partners: 'الشركاء النشطون',
    total_inventory: 'إجمالي المخزون',
    enter_paid_amount: 'أدخل المبلغ المدفوع:',
    partner_portal_overview: 'نظرة عامة على بوابة الشركاء',
    refill_status: 'حالة التوريد',
    active_orders: 'الطلبات النشطة',
    total_purchases: 'إجمالي المشتريات',
    in_process: 'قيد المعالجة',
    available: 'متاح',
    
    // Invoices
    invoice_title: 'فاتورة',
    generate_invoice: 'إنشاء فاتورة',
    invoice_number: 'رقم الفاتورة',
    invoice_date: 'تاريخ الفاتورة',
    billing_to: 'فوترة إلى',
    payment_status: 'حالة الدفع',
    remaining_amount: 'المبلغ المتبقي',
    unpaid: 'غير مدفوع',
    partial: 'دفع جزئي',
    paid: 'مدفوع بالكامل',
    download_invoice: 'تحميل الفاتورة',
    view_invoice: 'عرض الفاتورة',
    invoice_success: 'تم إنشاء الفاتورة بنجاح!',
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
    request_access: 'Rejoignez-nous maintenant',
    join_yanba: 'Rejoignez la famille Yanba Parfums',
    personal_info: 'Informations Personnelles',
    business_info: 'Informations Commerciales',
    full_name: 'Nom complet',
    store_name: 'Nom de l\'établissement',
    wilaya: 'Wilaya',
    commune: 'Commune',
    address: 'Adresse complète',
    password_mismatch: 'Les mots de passe ne correspondent pas',
    success_request: 'Compte créé avec succès ! Bienvenue chez Yanba.',
    account_created: 'Compte créé avec succès',
    step_1_title: 'Informations Personnelles',
    step_1_subtitle: 'Commencez l\'aventure avec Yanba',
    step_2_title: 'Informations Commerciales',
    step_2_subtitle: 'Parlez-nous de votre boutique',
    step_3_title: 'Lieu de Livraison',
    step_3_subtitle: 'Où devons-nous envoyer vos colis ?',
    continue: 'Continuer',
    back: 'Retour',
    processing: 'Traitement en cours...',
    required: 'Ce champ est obligatoire',
    invalid_phone: 'Numéro invalide (05/06/07)',
    password_too_short: 'Mot de passe trop court (min 6)',
    store_placeholder: 'Ex: Yanba Parfums Shop',
    
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
    new_arrivals: 'Nouveautés',
    
    // Footer & General
    rights: 'Tous droits réservés - Yanba Parfums',
    location: 'Alger, Algérie',
    contact_us: 'Contactez-nous',
    privacy_policy: 'Politique de confidentialité',
    terms_of_service: 'Conditions d\'utilisation',
    shipping_policy: 'Politique de livraison',
    loading: 'Chargement en cours...',
    address_label: 'Adresse',
    phone_label: 'Téléphone',
    whatsapp_label: 'WhatsApp',
    follow_us: 'Suivez-nous',

    // Cart
    your_cart: 'Mon Panier',
    cart_empty: 'Votre panier est vide',
    subtotal: 'Sous-total',
    checkout: 'Commander',
    continue_shopping: 'Continuer mes achats',
    items_count: 'articles',

    // Dashboard Components
    order_ref: 'Réf. Commande',
    order_status: 'État',
    total_amount: 'Montant Total',
    paid_amount: 'Montant Payé',
    view_details: 'Détails',
    no_orders: 'Commandes Récentes',
    stock: 'Stock',
    dashboard_overview: 'Vue d\'ensemble',
    revenue: 'Revenus',
    active_partners: 'Partenaires Actifs',
    total_inventory: 'Stock Total',
    enter_paid_amount: 'Entrez le montant payé :',
    partner_portal_overview: 'Aperçu du Portail Partenaire',
    refill_status: 'État de l\'Approvisionnement',
    active_orders: 'Commandes Actives',
    total_purchases: 'Total des Achats',
    in_process: 'En cours',
    available: 'Disponible',

    // Invoices
    invoice_title: 'Facture',
    generate_invoice: 'Générer Facture',
    invoice_number: 'N° Facture',
    invoice_date: 'Date de Facture',
    billing_to: 'Facturé à',
    payment_status: 'Statut de Paiement',
    remaining_amount: 'Reste à Payer',
    unpaid: 'Impayé',
    partial: 'Paiement Partiel',
    paid: 'Payé',
    download_invoice: 'Télécharger la Facture',
    view_invoice: 'Voir la Facture',
    invoice_success: 'Facture générée avec succès !',

    // Checkout
    checkout_title: 'Caisse',
    review_cart: 'Vérifier mon panier',
    shipping_details: 'Détails de livraison',
    order_summary: 'Résumé de commande',
    place_order: 'Confirmer la commande',
    order_success: 'Commande envoyée avec succès !',
    order_success_desc: 'Nous vous contacterons bientôt pour confirmer l\'expédition.',
    back_to_dashboard: 'Retour au tableau de bord',
    empty_checkout: 'Votre panier est vide, impossible de commander.',
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
