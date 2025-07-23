import React from 'react'
import { useRouter } from 'next/navigation'
import { useDynamicWallet } from '../hooks/useDynamicWallet'
import { Logo } from './Logo'

interface PageHeaderProps {
  showRefresh?: boolean
  onRefresh?: () => void
  isRefreshing?: boolean
  children?: React.ReactNode
  showProfile?: boolean
}

export function PageHeader({ showRefresh = false, onRefresh, isRefreshing = false, children, showProfile = false }: PageHeaderProps) {
  const router = useRouter()
  const { displayName } = useDynamicWallet()

  // Avatar URL for profile picture
  const avatarUrl = 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + (displayName || 'user')

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Logo size="md" />
          <div>
            <h1 className="text-lg font-semibold text-white">rizz</h1>
            <p className="text-sm text-gray-400">Tokenized US Stocks Wallet</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {children}
          {showRefresh && onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <svg 
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
            </button>
          )}
          {showProfile && (
            <button
              onClick={() => router.push('/profile')}
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-600 hover:border-usdt transition-colors"
            >
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 