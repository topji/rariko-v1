'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { BarChart3, Gift, TrendingUp, PieChart, User, Clock } from 'lucide-react'
import { cn } from '../lib/utils'

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: BarChart3,
    href: '/',
  },
  {
    id: 'rewards',
    label: 'Rewards',
    icon: Gift,
    href: '/rewards',
  },
  {
    id: 'stocks',
    label: 'Stocks',
    icon: TrendingUp,
    href: '/stocks',
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: PieChart,
    href: '/portfolio',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    href: '/profile',
  },
]

export function Navigation() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={cn(
                'nav-item',
                isActive && 'active'
              )}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}