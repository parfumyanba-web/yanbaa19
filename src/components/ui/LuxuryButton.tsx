import React from 'react'

const LuxuryButton = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary',
  className = '',
  disabled = false
}: {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'outline' | 'ghost'
  className?: string
  disabled?: boolean
}) => {
  const baseStyles = "px-6 py-3 rounded-xl font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
  
  const variants = {
    primary: "gold-gradient text-black hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]",
    outline: "border-2 border-gold text-gold hover:bg-gold hover:text-black",
    ghost: "text-white/70 hover:text-white hover:bg-white/10"
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

export default LuxuryButton
