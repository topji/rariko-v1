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
          {/* Filter and Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Order History</h2>
            <div className="flex items-center gap-3">
              <Button
                variant={filterByMe ? "primary" : "outline"}
                size="sm"
                onClick={() => setFilterByMe(!filterByMe)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {filterByMe ? 'My Orders' : 'All Orders'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchOrders}
                className="text-gray-400 hover:text-white"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Orders List */}
          {isLoadingOrders ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-usdt" />
                <span className="text-gray-400">Loading orders...</span>
              </div>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getOrderIcon(order.type.toLowerCase())}
                      <div>
                        <div className="font-semibold text-white">
                          {order.username} {order.type.toLowerCase() === 'buy' ? 'bought' : 'sold'} {order.tokenAmount.toFixed(6)} {order.symbol} for ${order.amountInUsd.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-400">
                          Price: ${order.tokenPrice.toFixed(4)} | {formatTimeAgo(new Date(order.timestamp))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        order.type === 'BUY' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        ${order.amountInUsd.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {order.type === 'SELL' && order.realizedPNL && (
                          <span className={order.realizedPNL >= 0 ? 'text-green-400' : 'text-red-400'}>
                            PnL: {order.realizedPNL >= 0 ? '+' : ''}${order.realizedPNL.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <h3 className="text-lg font-semibold text-white mb-2">No Orders Found</h3>
              <p className="text-gray-400 mb-4">
                {filterByMe ? "You haven't made any trades yet." : "No trading activity yet."}
              </p>
              <Button 
                onClick={() => router.push('/stocks')}
                className="bg-usdt hover:bg-primary-600"
              >
                Start Trading
              </Button>
            </Card>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={!pagination.hasPrevPage}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-400">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={!pagination.hasNextPage}
              >
                Next
              </Button>
            </div>
          )}
        </div>
        
        {/* Bottom Navigation */}
        <Navigation />
      </div>
    </WalletCheck>
  )
} 