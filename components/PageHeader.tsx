import React from 'react'
import { useRouter } from 'next/navigation'
import { useDynamicWallet } from '../hooks/useDynamicWallet'
import { Logo } from './Logo'
import { DollarSign } from 'lucide-react'

interface PageHeaderProps {
  showRefresh?: boolean
  onRefresh?: () => void
  isRefreshing?: boolean
  children?: React.ReactNode
  showProfile?: boolean
}

export function PageHeader({ showRefresh = false, onRefresh, isRefreshing = false, children, showProfile = false }: PageHeaderProps) {
  const router = useRouter()
  const { tokenBalances } = useDynamicWallet()

  // Calculate total USD balance
  const totalUSDBalance = tokenBalances?.reduce((total, token) => {
    return total + (token.marketValue || 0)
  }, 0) || 0

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Logo size="md" />
          <div>
            <h1 className="text-lg font-semibold text-white">rizz.money</h1>
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
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl border border-gray-600 hover:border-usdt transition-all duration-300 hover:shadow-lg hover:shadow-usdt/10 group">
              <DollarSign className="w-4 h-4 text-usdt" />
              <div className="text-sm font-bold text-white group-hover:text-usdt transition-colors">
                ${totalUSDBalance.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 