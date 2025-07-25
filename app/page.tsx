'use client'

import React, { useState, useEffect } from 'react'
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
  Copy,
  ExternalLink
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { useDynamicWallet } from '../hooks/useDynamicWallet'
import { formatUSDT, formatCurrency, shortenAddress } from '../lib/utils'
import { useRouter } from 'next/navigation'
import { Navigation } from '../components/Navigation'
import WalletCheck from '../components/WalletCheck'
import { PageHeader } from '../components/PageHeader'
import { useUserApi } from '../hooks/useUserApi'
import { orderApi } from '../lib/api'

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
  const [dashboardData, setDashboardData] = useState<{
    portfolioValue: number;
    totalVolume: number;
    totalProfitLoss: number;
    profitLossPercent: number;
    totalInvested: number;
    totalRealizedPnL: number;
    ordersCount: number;
    recentOrders: any[];
  }>({
    portfolioValue: 0,
    totalVolume: 0,
    totalProfitLoss: 0,
    profitLossPercent: 0,
    totalInvested: 0,
    totalRealizedPnL: 0,
    ordersCount: 0,
    recentOrders: []
  })
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)

  // User API hook
  const { getProfile, loading: userLoading } = useUserApi()

  // Get SOL balance from token balances
  const solBalance = tokenBalances?.find(token => token.symbol === 'SOL')?.balance || 0
  const solBalanceUSD = tokenBalances?.find(token => token.symbol === 'SOL')?.marketValue || 0

  // Fetch dashboard data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!walletAddress) return;
      
      setIsLoadingDashboard(true);
      try {
        // Fetch user profile
        const profile = await getProfile(walletAddress);
        if (profile) {
          setUserProfile(profile);
        }

        // Fetch user orders and volume
        const [ordersResponse, volumeResponse, realizedPnLResponse] = await Promise.all([
          orderApi.getUserOrders(walletAddress),
          orderApi.getUserVolume(walletAddress),
          orderApi.getUserRealizedPnL(walletAddress)
        ]);

        const orders = ordersResponse.orders || [];
        const totalVolume = volumeResponse.volume?.totalVolume || 0;
        const totalRealizedPnL = realizedPnLResponse.totalRealizedPnL || 0;

        // Process orders to calculate holdings and portfolio value
        const tokenHoldings: { [key: string]: any } = {};
        
        orders.forEach((order: any) => {
          const symbol = order.symbol;
          
          if (!tokenHoldings[symbol]) {
            tokenHoldings[symbol] = {
              totalBought: 0,
              totalBoughtValue: 0,
              totalSold: 0,
              totalSoldValue: 0,
              averageBuyPrice: 0
            };
          }
          
          if (order.type === 'BUY') {
            tokenHoldings[symbol].totalBought += order.tokenAmount;
            tokenHoldings[symbol].totalBoughtValue += order.amountInUsd;
          } else if (order.type === 'SELL') {
            tokenHoldings[symbol].totalSold += order.tokenAmount;
            tokenHoldings[symbol].totalSoldValue += order.amountInUsd;
          }
        });

        // Calculate current holdings and portfolio value
        let totalPortfolioValue = solBalanceUSD; // Start with SOL balance
        let totalInvested = 0;
        let totalCurrentValue = 0;

        Object.keys(tokenHoldings).forEach(symbol => {
          const holding = tokenHoldings[symbol];
          const currentBalance = holding.totalBought - holding.totalSold;
          
          if (currentBalance > 0) {
            // Calculate average buy price
            const avgBuyPrice = holding.totalBoughtValue / holding.totalBought;
            holding.averageBuyPrice = avgBuyPrice;
            
            // Get current price from token data (we'll need to fetch this)
            // For now, use average buy price as approximation
            const currentPrice = avgBuyPrice; // This should be fetched from token price API
            
            const currentValue = currentBalance * currentPrice;
            totalCurrentValue += currentValue;
            totalInvested += holding.totalBoughtValue;
          }
        });

        // Add current token balances from wallet
        if (tokenBalances) {
          tokenBalances.forEach(token => {
            if (token.symbol !== 'SOL') {
              totalPortfolioValue += token.marketValue || 0;
            }
          });
        }

        // Calculate profit/loss
        const totalProfitLoss = totalPortfolioValue - totalInvested;
        const profitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

        // Get recent orders for display
        const recentOrders = orders.slice(0, 5).map((order: any) => ({
          id: order._id || order.id,
          type: order.type?.toLowerCase() || 'buy',
          symbol: order.symbol,
          shares: order.tokenAmount,
          price: order.tokenPrice,
          total: order.amountInUsd,
          status: 'completed', // All orders are completed now
          timestamp: new Date(order.timestamp)
        }));

        setDashboardData({
          portfolioValue: totalPortfolioValue,
          totalVolume,
          totalProfitLoss,
          profitLossPercent,
          totalInvested,
          totalRealizedPnL,
          ordersCount: orders.length,
          recentOrders
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to default values
        setDashboardData({
          portfolioValue: solBalanceUSD,
          totalVolume: 0,
          totalProfitLoss: 0,
          profitLossPercent: 0,
          totalInvested: 0,
          totalRealizedPnL: 0,
          ordersCount: 0,
          recentOrders: []
        });
      } finally {
        setIsLoadingDashboard(false);
      }
    };

    fetchDashboardData();
  }, [walletAddress, solBalanceUSD, tokenBalances, getProfile]);

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

        {isLoadingDashboard ? (
          <div className="px-4 py-6 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-usdt"></div>
              <span className="text-gray-400">Loading dashboard...</span>
            </div>
          </div>
        ) : (
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

            {/* Realized P&L */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-gray-400">Realized P&L</span>
              </div>
              <div className={`text-xl font-bold ${
                dashboardData.totalRealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {dashboardData.totalRealizedPnL >= 0 ? '+' : ''}${dashboardData.totalRealizedPnL.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">
                From completed trades
              </div>
            </Card>

            {/* Total Invested */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs text-gray-400">Total Invested</span>
              </div>
              <div className="text-xl font-bold text-white">${dashboardData.totalInvested.toLocaleString()}</div>
              <div className="text-sm text-gray-400">Capital deployed</div>
            </Card>
          </motion.div>

          {/* Orders Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            {/* Orders Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Recent Orders</h3>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-600 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-3 h-3 text-white" />
                </div>
                <span className="text-sm text-gray-400">{dashboardData.ordersCount} total orders</span>
              </div>
            </div>

            {/* Recent Orders List */}
            {dashboardData.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentOrders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getOrderIcon(order.type)}
                      <div>
                          <div className="font-semibold text-white">
                          {order.type === 'buy' ? 'Bought' : 'Sold'} {order.shares} {order.symbol}
                          </div>
                          <div className="text-sm text-gray-400">
                            ${order.price.toFixed(4)} per token
                          </div>
                        </div>
                      </div>
                    <div className="text-right">
                        <div className="font-semibold text-white">
                        ${order.total.toFixed(2)}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                        {getStatusIcon(order.status)}
                          <span>{formatTimeAgo(order.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            ) : (
              <Card className="p-6 text-center">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-400">No orders yet</p>
                <p className="text-sm text-gray-500">Start trading to see your order history</p>
              </Card>
            )}
          </motion.div>
        </div>
        )}
        
        {/* Bottom Navigation */}
        <Navigation />
      </div>
    </WalletCheck>
  )
} 