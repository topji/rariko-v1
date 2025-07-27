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
  ExternalLink,
  Filter,
  RefreshCw,
  Loader2,
  History
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent } from '../../components/ui/Card'
import { useDynamicWallet } from '../../hooks/useDynamicWallet'
import { formatUSDT, formatCurrency, shortenAddress } from '../../lib/utils'
import { useRouter } from 'next/navigation'
import { Navigation } from '../../components/Navigation'
import WalletCheck from '../../components/WalletCheck'
import { PageHeader } from '../../components/PageHeader'
import { useUserApi } from '../../hooks/useUserApi'
import { orderApi } from '../../lib/api'

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
  const [isAddressCopied, setIsAddressCopied] = useState(false)
  const [filterByMe, setFilterByMe] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // User API hook
  const { getProfile, loading: userLoading } = useUserApi()

  // Fetch orders from backend
  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const options: any = {
        limit: 20,
        page: pagination.currentPage
      };
      
      if (filterByMe && walletAddress) {
        options.userAddress = walletAddress;
      }
      
      const response = await orderApi.getAllOrders(options);
      
      setOrders(response.orders || []);
      setPagination({
        currentPage: response.pagination.currentPage,
        totalPages: response.pagination.totalPages,
        totalOrders: response.pagination.totalOrders,
        hasNextPage: response.pagination.hasNextPage,
        hasPrevPage: response.pagination.hasPrevPage
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Fetch orders when component mounts or filter changes
  useEffect(() => {
    fetchOrders();
  }, [filterByMe, pagination.currentPage, walletAddress]);

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pb-20">
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

        <div className="px-4 py-6 space-y-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-4"
          >
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              History
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Track all trading activity across the platform
            </p>
          </motion.div>

          {/* Filter Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <RefreshCw 
                className={`w-4 h-4 text-gray-400 transition-all duration-300 ${isLoadingOrders ? 'animate-spin' : ''}`} 
              />
              <span className="text-sm text-gray-400">
                {isLoadingOrders ? 'Refreshing...' : 'Live updates'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterByMe(false)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  !filterByMe 
                    ? 'bg-usdt text-white shadow-lg shadow-usdt/25' 
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Feed
              </button>
              <button
                onClick={() => setFilterByMe(true)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  filterByMe 
                    ? 'bg-usdt text-white shadow-lg shadow-usdt/25' 
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Only Me
              </button>
            </div>
          </motion.div>

          {/* Orders List */}
          {isLoadingOrders ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-12"
            >
              <div className="flex items-center gap-3 p-6 bg-gray-800/50 rounded-2xl border border-gray-700">
                <div className="w-8 h-8 border-2 border-usdt border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-300 font-medium">Loading orders...</span>
              </div>
            </motion.div>
          ) : orders.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/70 transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                          order.type === 'BUY' 
                            ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-green-500/25' 
                            : 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/25'
                        }`}>
                          {getOrderIcon(order.type.toLowerCase())}
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold text-white text-lg">
                            <span className="text-gray-300">{order.username}</span> {order.type.toLowerCase() === 'buy' ? 'bought' : 'sold'} <span className="text-usdt">{order.tokenAmount.toFixed(6)} {order.symbol}</span>
                          </div>
                          <div className="text-gray-400 text-sm flex items-center gap-2">
                            <span>${order.tokenPrice.toFixed(4)}</span>
                            <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                            <span>{formatTimeAgo(new Date(order.timestamp))}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className={`text-xl font-bold ${
                          order.type === 'BUY' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          ${order.amountInUsd.toFixed(2)}
                        </div>
                        {order.type === 'SELL' && order.realizedPNL && (
                          <div className={`text-sm font-medium px-2 py-1 rounded-lg ${
                            order.realizedPNL >= 0 
                              ? 'text-green-400 bg-green-400/10' 
                              : 'text-red-400 bg-red-400/10'
                          }`}>
                            {order.realizedPNL >= 0 ? '+' : ''}${order.realizedPNL.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
                          <Card className="p-12 text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 backdrop-blur-sm">
              <div className="w-24 h-24 bg-gradient-to-br from-usdt to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-usdt/25">
                <History className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No Orders Found</h3>
              <p className="text-gray-300 mb-8 text-lg">
                {filterByMe ? "You haven't made any trades yet." : "No trading activity yet."}
              </p>
              <Button 
                onClick={() => router.push('/stocks')}
                className="bg-gradient-to-r from-usdt to-green-600 hover:from-green-600 hover:to-usdt text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-usdt/25 transition-all duration-300 hover:scale-105"
              >
                Start Trading
              </Button>
            </Card>
            </motion.div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center justify-center gap-4 mt-8"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={!pagination.hasPrevPage}
                className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800/70 hover:text-white disabled:opacity-50"
              >
                Previous
              </Button>
              <div className="px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                <span className="text-sm text-gray-300 font-medium">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={!pagination.hasNextPage}
                className="bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-800/70 hover:text-white disabled:opacity-50"
              >
                Next
              </Button>
            </motion.div>
          )}
        </div>
        
        {/* Bottom Navigation */}
        <Navigation />
      </div>
    </WalletCheck>
  )
} 