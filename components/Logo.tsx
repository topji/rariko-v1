import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <img
        src="/rizzv1-logo.png"
        alt="rizz Logo"
        className="w-full h-full object-contain"
      />
    </div>
  )
}

// Text Logo Component
export function TextLogo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo size={size} />
      <span className={`font-bold ${sizeClasses[size]} bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent`}>
        rizz
      </span>
    </div>
  )
} 