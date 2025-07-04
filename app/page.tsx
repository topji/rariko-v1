'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  Eye,
  EyeOff,
  DollarSign,
  BarChart3,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  Clock,
  XCircle,
  Copy
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { useDynamicWallet } from '../hooks/useDynamicWallet'
import { formatUSDT, formatCurrency, shortenAddress } from '../lib/utils'
import { useRouter } from 'next/navigation'
import { Navigation } from '../components/Navigation'
import WalletCheck from '../components/WalletCheck'
import { PageHeader } from '../components/PageHeader'

export default function DashboardPage() {
  const {
    wallet,
    isConnected,
    walletAddress,
    displayName,
    tokenBalances,
    isLoadingTokens,
    logout
  } = useDynamicWallet()
  
  const router = useRouter()
  const [showBalance, setShowBalance] = useState(true)
  const [isAddressCopied, setIsAddressCopied] = useState(false)

  // Get SOL balance from token balances
  const solBalance = tokenBalances?.find(token => token.symbol === 'SOL')?.balance || 0
  const solBalanceUSD = tokenBalances?.find(token => token.symbol === 'SOL')?.marketValue || 0

  // Mock dashboard data (you can replace with real data later)
  const dashboardData = {
    portfolioValue: 15420.67,
    totalVolume: 45678.90,
    totalProfitLoss: 1245.32,
    profitLossPercent: 8.78,
    ordersCount: 23,
    recentOrders: [
      {
        id: '1',
        type: 'buy' as const,
        symbol: 'AAPL',
        shares: 5,
        price: 175.43,
        total: 877.15,
        status: 'completed' as const,
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: '2',
        type: 'sell' as const,
        symbol: 'TSLA',
        shares: 3,
        price: 248.42,
        total: 745.26,
        status: 'pending' as const,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
      {
        id: '3',
        type: 'buy' as const,
        symbol: 'NVDA',
        shares: 2,
        price: 485.09,
        total: 970.18,
        status: 'completed' as const,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      },
    ]
  }

  const getOrderIcon = (type: 'buy' | 'sell') => {
    if (type === 'buy') {
      return <ArrowUpRight className="w-4 h-4 text-green-400" />
    }
    return <ArrowDownLeft className="w-4 h-4 text-red-400" />
  }

  const getStatusIcon = (status: 'completed' | 'pending' | 'failed') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />
      default:
        return null
    }
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`
    }
  }

  const handleCopyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress)
      setIsAddressCopied(true)
      setTimeout(() => setIsAddressCopied(false), 2000)
    }
  }

  return (
    <WalletCheck>
      <div className="min-h-screen bg-gray-900 pb-20">
        {/* Header */}
        <PageHeader showProfile={true}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyAddress}
            className="text-gray-400 hover:text-white"
          >
            <Copy className="w-4 h-4" />
          </Button>
          {isAddressCopied && (
            <span className="text-xs text-green-400">Copied!</span>
          )}
        </PageHeader>

        <div className="px-4 py-6 space-y-6">
          {/* Portfolio Value Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card variant="elevated" className="bg-gradient-to-br from-usdt to-primary-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">Portfolio Value</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBalance(!showBalance)}
                    className="text-white hover:bg-white/10"
                  >
                    {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                
                <div className="mb-4">
                  {showBalance ? (
                    <div className="space-y-2">
                      <div className="text-3xl font-bold">
                        ${dashboardData.portfolioValue.toLocaleString()}
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${
                        dashboardData.totalProfitLoss >= 0 ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {dashboardData.totalProfitLoss >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {dashboardData.totalProfitLoss >= 0 ? '+' : ''}${dashboardData.totalProfitLoss.toFixed(2)} ({dashboardData.profitLossPercent >= 0 ? '+' : ''}{dashboardData.profitLossPercent.toFixed(2)}%)
                      </div>
                    </div>
                  ) : (
                    <div className="text-3xl font-bold">••••••</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            {/* USD Balance (from SOL) */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-usdt rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-gray-400">USD Balance</span>
              </div>
              <div className="text-xl font-bold text-usdt">
                {isLoadingTokens ? '...' : `$${solBalanceUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
              </div>
              <div className="text-sm text-gray-400">
                {isLoadingTokens ? '...' : `${solBalance.toFixed(4)} SOL`}
              </div>
            </Card>

            {/* Total Volume */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-gray-400">Total Volume</span>
              </div>
              <div className="text-xl font-bold text-white">${dashboardData.totalVolume.toLocaleString()}</div>
              <div className="text-sm text-gray-400">All time</div>
            </Card>

            {/* Total P&L */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-gray-400">Total P&L</span>
              </div>
              <div className={`text-xl font-bold ${
                dashboardData.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {dashboardData.totalProfitLoss >= 0 ? '+' : ''}${dashboardData.totalProfitLoss.toFixed(2)}
              </div>
              <div className={`text-sm ${
                dashboardData.totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {dashboardData.profitLossPercent >= 0 ? '+' : ''}{dashboardData.profitLossPercent.toFixed(2)}%
              </div>
            </Card>

            {/* Orders Count */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-gray-400">Orders</span>
              </div>
              <div className="text-xl font-bold text-white">{dashboardData.ordersCount}</div>
              <div className="text-sm text-gray-400">Total orders</div>
            </Card>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/portfolio')}
              >
                View All
              </Button>
            </div>

            <div className="space-y-3">
              {dashboardData.recentOrders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center">
                        {getOrderIcon(order.type)}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {order.type === 'buy' ? 'Bought' : 'Sold'} {order.shares} {order.symbol}
                        </p>
                        <p className="text-sm text-gray-400">
                          @${order.price} per share
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-white">
                        ${order.total.toFixed(2)}
                      </p>
                      <div className="flex items-center justify-end space-x-1 mt-1">
                        {getStatusIcon(order.status)}
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(order.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Bottom Navigation */}
        <Navigation />
      </div>
    </WalletCheck>
  )
} 