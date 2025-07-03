'use client'

import React from 'react'
import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  variant?: 'default' | 'search'
}

export function Input({
  label,
  error,
  icon,
  variant = 'default',
  className,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-200 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">{icon}</span>
          </div>
        )}
        <input
          className={cn(
            'w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-usdt focus:border-transparent transition-all duration-200 bg-gray-700 text-gray-100 placeholder-gray-400',
            icon && 'pl-10',
            variant === 'search' && 'pl-10 pr-4',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-400">{error}</p>
      )}
    </div>
  )
} 