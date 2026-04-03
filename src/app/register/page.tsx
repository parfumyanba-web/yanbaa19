'use client'

import React, { useActionState, useState, useTransition } from 'react'
import Link from 'next/link'
import LuxuryButton from '@/components/ui/LuxuryButton'
import FormInput from '@/components/ui/FormInput'
import WilayaSelect from '@/components/ui/WilayaSelect'
import { signUp } from '@/lib/auth/actions'
import { useLanguage } from '@/context/LanguageContext'

const RegisterPage = () => {
  const { t } = useLanguage()
  const [step, setStep] = useState(1)
  const [isPending, startTransition] = useTransition()
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    password: '',
    confirm_password: '',
    store_name: '',
    wilaya: '',
    commune: '',
    address: ''
  })

  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when typing
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string | null> = {}
    
    if (currentStep === 1) {
      if (!formData.full_name) newErrors.full_name = t('required')
      if (!formData.phone) {
        newErrors.phone = t('required')
      } else if (!/^(05|06|07)\d{8}$/.test(formData.phone)) {
        newErrors.phone = t('invalid_phone')
      }
      if (!formData.password) newErrors.password = t('required')
      else if (formData.password.length < 6) newErrors.password = t('password_too_short')
      
      if (formData.password !== formData.confirm_password) {
        newErrors.confirm_password = t('password_mismatch')
      }
    } else if (currentStep === 2) {
      if (!formData.store_name) newErrors.store_name = t('required')
    } else if (currentStep === 3) {
      if (!formData.wilaya) newErrors.wilaya = t('required')
      if (!formData.commune) newErrors.commune = t('required')
      if (!formData.address) newErrors.address = t('required')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1)
    }
  }

  const handleBack = () => setStep(prev => prev - 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(3)) return

    setServerError(null)
    startTransition(async () => {
      const data = new FormData()
      Object.entries(formData).forEach(([key, value]) => data.append(key, value))
      
      const result = await signUp(data)
      if (result?.error) {
        setServerError(result.error)
      } else {
        setSuccess(true)
      }
    })
  }

  return (
    <main className="min-h-screen py-12 md:py-20 flex flex-col items-center justify-center bg-[#121212] p-4 md:p-6 lg:p-20 font-alexandria relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[120px]" />

      <Link 
        href="/" 
        className="fixed top-6 md:top-8 left-6 md:left-8 rtl:left-auto rtl:right-6 rtl:md:right-8 flex items-center gap-2 text-white/40 hover:text-gold transition-colors text-xs md:text-sm uppercase tracking-widest group z-[100]"
      >
        <span className="transform group-hover:-translate-x-1 transition-transform rtl:rotate-180 rtl:group-hover:translate-x-1">←</span>
        {t('back_to_home')}
      </Link>

      <div className="w-full max-w-xl space-y-8 relative z-10">
        <div className="text-center space-y-4">
          <Link href="/" className="text-5xl font-arabic gold-text-gradient block mb-4 animate-slide-up">ينبع</Link>
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-white/90">{t('create_account')}</h2>
            <p className="text-gold/50 text-[10px] uppercase tracking-[0.4em] font-black">{t('join_yanba')}</p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between items-center max-w-xs mx-auto mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 
                ${step >= s ? 'bg-gold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-white/5 text-white/30 border border-white/10'}`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-[1px] mx-2 transition-all duration-500 ${step > s ? 'bg-gold' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute inset-0 noise-overlay opacity-[0.03] pointer-events-none" />

          {serverError && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm animate-shake flex items-center gap-3">
              <span className="text-lg">⚠️</span>
              {serverError}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-2xl text-sm text-center space-y-4 animate-fade-in">
              <div className="text-4xl">✨</div>
              <p className="text-lg font-bold">{t('account_created')}</p>
              <p className="text-white/60">{t('success_request')}</p>
              <Link href="/login" className="block w-full">
                <LuxuryButton type="button" className="w-full">{t('login')}</LuxuryButton>
              </Link>
            </div>
          )}

          {!success && (
            <div className="space-y-8">
              {/* STEP 1: ACCOUNT */}
              {step === 1 && (
                <div className="space-y-6 animate-slide-left">
                  <header>
                    <h3 className="text-gold text-xs font-bold uppercase tracking-[0.2em]">{t('step_1_title') || 'Personal Details'}</h3>
                    <p className="text-white/40 text-[10px] mt-1">{t('step_1_subtitle') || 'Let\'s get to know you'}</p>
                  </header>
                  <div className="grid gap-6">
                    <FormInput 
                      label={t('full_name')} 
                      name="full_name"
                      required
                      value={formData.full_name}
                      onChange={handleChange}
                      error={errors.full_name}
                      placeholder="e.g. Ahmed Benali"
                    />
                    <FormInput 
                      label={t('phone')} 
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      placeholder="05 / 06 / 07 ..."
                    />
                    <FormInput 
                      label={t('password')} 
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                    />
                    <FormInput 
                      label={t('confirm_password')} 
                      name="confirm_password"
                      type="password"
                      required
                      value={formData.confirm_password}
                      onChange={handleChange}
                      error={errors.confirm_password}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: BUSINESS */}
              {step === 2 && (
                <div className="space-y-6 animate-slide-left">
                  <header>
                    <h3 className="text-gold text-xs font-bold uppercase tracking-[0.2em]">{t('step_2_title') || 'Business Details'}</h3>
                    <p className="text-white/40 text-[10px] mt-1">{t('step_2_subtitle') || 'Tell us about your workshop or store'}</p>
                  </header>
                  <div className="grid gap-6">
                    <FormInput 
                      label={t('store_name')} 
                      name="store_name"
                      required
                      value={formData.store_name}
                      onChange={handleChange}
                      error={errors.store_name}
                      placeholder={t('store_placeholder') || 'Yanba Perfumes Shop'}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: LOCATION */}
              {step === 3 && (
                <div className="space-y-6 animate-slide-left">
                  <header>
                    <h3 className="text-gold text-xs font-bold uppercase tracking-[0.2em]">{t('step_3_title') || 'Delivery Location'}</h3>
                    <p className="text-white/40 text-[10px] mt-1">{t('step_3_subtitle') || 'Where should we send your orders?'}</p>
                  </header>
                  <div className="grid gap-6">
                    <WilayaSelect 
                      label={t('wilaya')} 
                      name="wilaya"
                      required
                      value={formData.wilaya}
                      onChange={(val) => setFormData(p => ({ ...p, wilaya: val }))}
                    />
                    <FormInput 
                      label={t('commune')} 
                      name="commune"
                      required
                      value={formData.commune}
                      onChange={handleChange}
                      error={errors.commune}
                    />
                    <FormInput 
                      label={t('address')} 
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      error={errors.address}
                    />
                  </div>
                </div>
              )}

              <div className="pt-8 flex gap-4 border-t border-white/5">
                {step > 1 && (
                  <button 
                    type="button" 
                    onClick={handleBack}
                    className="flex-1 py-4 text-sm font-bold text-white/40 hover:text-white transition-colors border border-white/5 rounded-2xl hover:bg-white/5"
                  >
                    {t('back')}
                  </button>
                )}
                {step < 3 ? (
                  <LuxuryButton 
                    type="button" 
                    onClick={handleNext}
                    className="flex-[2] py-4"
                  >
                    {t('continue')} →
                  </LuxuryButton>
                ) : (
                  <LuxuryButton 
                    type="submit" 
                    disabled={isPending}
                    className="flex-[2] py-4"
                  >
                    {isPending ? t('processing') : t('sign_up')}
                  </LuxuryButton>
                )}
              </div>
              
              <p className="text-center text-white/30 text-xs font-alexandria mt-6">
                {t('already_have_account')}{' '}
                <Link href="/login" className="text-gold hover:underline">{t('login')}</Link>
              </p>
            </div>
          )}
        </form>
      </div>
    </main>
  )
}

export default RegisterPage
