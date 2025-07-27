'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Wallet,
  History,
  Target,
  Trophy
} from 'lucide-react'
import { cn } from '../lib/utils'
import { useDynamicWallet } from '../hooks/useDynamicWallet'
import { useUserApi } from '../hooks/useUserApi'

const navigationItems = [
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: Wallet,
    href: '/portfolio',
  },
  {
    id: 'history',
    label: 'History',
    icon: History,
    href: '/history',
  },
  
  {
    id: 'stocks',
    label: 'Stocks',
    icon: Target,
    href: '/stocks',
  },
  {
    id: 'rewards',
    label: 'Rewards',
    icon: Trophy,
    href: '/rewards',
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
  },
]

export function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const { walletAddress } = useDynamicWallet()
  const { getProfile } = useUserApi()
  const [userProfile, setUserProfile] = useState<any>(null)

  // Fetch user profile for profile picture
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (walletAddress) {
        try {
          const profile = await getProfile(walletAddress)
          setUserProfile(profile)
        } catch (error) {
          console.error('Error fetching user profile:', error)
        }
      }
    }

    fetchUserProfile()
  }, [walletAddress, getProfile])

  // Generate initials from username or displayName
  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get profile display name
  const getProfileDisplayName = () => {
    if (userProfile?.username) return userProfile.username
    if (userProfile?.displayName) return userProfile.displayName
    return walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : 'User'
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          
          // Special handling for profile tab
          if (item.id === 'profile') {
            const displayName = getProfileDisplayName()
            const avatarUrl = 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + (displayName || 'user')
            
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={cn(
                  'nav-item flex flex-col items-center justify-center',
                  isActive && 'active'
                )}
              >
                <div className={cn(
                  'w-5 h-5 mb-1 rounded-full overflow-hidden',
                  isActive && 'ring-2 ring-usdt'
                )}>
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-xs font-semibold bg-gray-600 text-gray-300">${getInitials(displayName)}</div>`
                      }
                    }}
                  />
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          }
          
          // Regular icon items
          const Icon = item.icon
          if (!Icon) return null // Skip items without icons
          
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