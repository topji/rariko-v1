import React from 'react'
import { TrendingUp } from 'lucide-react'

interface PageHeaderProps {
  showRefresh?: boolean
  onRefresh?: () => void
  isRefreshing?: boolean
  children?: React.ReactNode
}

export function PageHeader({ showRefresh = false, onRefresh, isRefreshing = false, children }: PageHeaderProps) {
  return (
    <div className="bg-gray-800 border-b border-gray-700 px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-usdt rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">RariKo</h1>
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
        </div>
      </div>
    </div>
  )
} 