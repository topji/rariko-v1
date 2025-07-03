'use client'

import React from 'react'
import { cn } from '../../lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'elevated' | 'outlined'
}

export function Card({ 
  children, 
  variant = 'default', 
  className, 
  ...props 
}: CardProps) {
  const variants = {
    default: 'bg-gray-800 rounded-2xl shadow-sm border border-gray-700',
    elevated: 'bg-gray-800 rounded-2xl shadow-lg border border-gray-700',
    outlined: 'bg-gray-800 rounded-2xl border border-gray-600',
  }

  return (
    <div
      className={cn(
        'p-6',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardHeader({ children, className, ...props }: CardHeaderProps) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-gray-700', className)} {...props}>
      {children}
    </div>
  )
} 