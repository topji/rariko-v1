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
  User,
  Calendar,
  TrendingUp as TrendingUpIcon
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

export default function HistoryPage() {
  const {
    walletAddress,
    displayName
  } = useDynamicWallet();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMine, setShowMine] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const options: any = { limit: 100, sortBy: 'timestamp', sortOrder: 'desc' };
        if (showMine && walletAddress) {
          options.userAddress = walletAddress;
        }
        console.log('Fetching orders with options:', options);
        const res = await orderApi.getAllOrders(options);
        console.log('Orders response:', res);
        setOrders(res.orders || []);
      } catch (e) {
        console.error('Error fetching orders:', e);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [showMine, walletAddress]);

  const getOrderIcon = (type: 'buy' | 'sell' | 'BUY' | 'SELL') => {
    if (type === 'BUY') {
      return <ArrowUpRight className="w-5 h-5 text-green-400" />;
    }
    return <ArrowDownLeft className="w-5 h-5 text-red-400" />;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const d = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUsername = (userAddress: string) => {
    // For now, we'll use a shortened address, but this could be enhanced with a user lookup
    if (userAddress === walletAddress) {
      return displayName || 'You';
    }
    return userAddress?.slice(0, 6) + '...' + userAddress?.slice(-4);
  };

  return (
    <WalletCheck>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pb-20">
        <PageHeader showProfile={true}>
          <Button
            variant={showMine ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowMine(!showMine)}
            className="text-gray-400 hover:text-white transition-all duration-200"
          >
            {showMine ? 'Show All' : 'Show Mine'}
          </Button>
        </PageHeader>
        
        <div className="px-4 py-6 space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Trading History
            </h1>
            <p className="text-gray-400">
              {showMine ? 'Your trading activity' : 'Live trading feed from the community'}
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                <span className="text-gray-400 text-lg">Loading history...</span>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Card className="max-w-md mx-auto bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600">
                <div className="p-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Orders Yet</h3>
                  <p className="text-gray-400 mb-4">
                    {showMine ? 'Start trading to see your order history' : 'Be the first to make a trade!'}
                  </p>
                  {showMine && (
                    <Button 
                      onClick={() => window.location.href = '/stocks'} 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                    >
                      Start Trading
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600 hover:border-gray-500 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            order.type === 'BUY' 
                              ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                              : 'bg-gradient-to-br from-red-500 to-pink-500'
                          }`}>
                            {getOrderIcon(order.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {!showMine && (
                                <div className="flex items-center gap-1 text-blue-400">
                                  <User className="w-4 h-4" />
                                  <span className="font-medium">{getUsername(order.userAddress)}</span>
                                </div>
                              )}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.type === 'BUY' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-red-500/20 text-red-400'
                              }`}>
                                {order.type === 'BUY' ? 'Bought' : 'Sold'}
                              </span>
                            </div>
                            <div className="text-lg font-bold text-white">
                              {order.tokenAmount} {order.symbol}
                            </div>
                            <div className="text-xl font-bold text-blue-400">
                              for ${order.amountInUsd?.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400 mb-1">Price at {order.type === 'BUY' ? 'Buy' : 'Sell'}</div>
                          <div className="text-lg font-bold text-white">
                            ${order.tokenPrice?.toFixed(4)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{formatDate(order.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{formatTimeAgo(order.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <Navigation />
      </div>
    </WalletCheck>
  );
} 