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
  Loader2
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pb-20">
        {/* Header */}
        <PageHeader showProfile={true}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyAddress}
            className="text-gray-300 hover:text-white backdrop-blur-sm"
          >
            <Copy className="w-4 h-4" />
          </Button>
          {isAddressCopied && (
            <span className="text-xs text-emerald-400 font-medium">Copied!</span>
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
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Trading Dashboard
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Monitor real-time trading activity across the platform
            </p>
          </motion.div>

          {/* Filter and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Order History</h2>
                <p className="text-gray-400 text-sm">Live trading activity</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={filterByMe ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilterByMe(!filterByMe)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0"
              >
                <Filter className="w-4 h-4" />
                {filterByMe ? 'My Orders' : 'All Orders'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchOrders}
                className="text-gray-300 hover:text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Orders List */}
          {isLoadingOrders ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-16"
            >
              <div className="flex items-center gap-3 p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
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
                  <Card className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          order.type === 'BUY' 
                            ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                            : 'bg-gradient-to-br from-red-500 to-pink-600'
                        }`}>
                          {getOrderIcon(order.type.toLowerCase())}
                        </div>
                        <div className="space-y-1">
                          <div className="font-bold text-white text-lg">
                            {order.username} {order.type.toLowerCase() === 'buy' ? 'bought' : 'sold'} {order.tokenAmount.toFixed(6)} {order.symbol}
                          </div>
                          <div className="text-gray-300 text-sm">
                            Price: ${order.tokenPrice.toFixed(4)} • {formatTimeAgo(new Date(order.timestamp))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className={`text-xl font-bold ${
                          order.type === 'BUY' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          ${order.amountInUsd.toFixed(2)}
                        </div>
                        {order.type === 'SELL' && order.realizedPNL && (
                          <div className={`text-sm font-medium ${
                            order.realizedPNL >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            PnL: {order.realizedPNL >= 0 ? '+' : ''}${order.realizedPNL.toFixed(2)}
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
              <Card className="p-12 text-center bg-white/5 backdrop-blur-xl border border-white/10">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingCart className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No Orders Found</h3>
                <p className="text-gray-300 mb-8 text-lg">
                  {filterByMe ? "You haven't made any trades yet." : "No trading activity yet."}
                </p>
                <Button 
                  onClick={() => router.push('/stocks')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-xl"
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
                className="bg-white/5 backdrop-blur-xl border-white/20 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                Previous
              </Button>
              <div className="px-4 py-2 bg-white/5 backdrop-blur-xl rounded-lg border border-white/10">
                <span className="text-sm text-gray-300 font-medium">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={!pagination.hasNextPage}
                className="bg-white/5 backdrop-blur-xl border-white/20 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
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