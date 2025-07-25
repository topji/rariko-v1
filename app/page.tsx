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
        const res = await orderApi.getAllOrders(options);
        setOrders(res.orders || []);
      } catch (e) {
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [showMine, walletAddress]);

  const getOrderIcon = (type: 'buy' | 'sell' | 'BUY' | 'SELL') => {
    if (type === 'BUY') {
      return <ArrowUpRight className="w-4 h-4 text-green-400" />;
    }
    return <ArrowDownLeft className="w-4 h-4 text-red-400" />;
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

  return (
    <WalletCheck>
      <div className="min-h-screen bg-gray-900 pb-20">
        <PageHeader showProfile={true}>
          <Button
            variant={showMine ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setShowMine(!showMine)}
            className="text-gray-400 hover:text-white"
          >
            {showMine ? 'Show All' : 'Show Mine'}
          </Button>
        </PageHeader>
        <div className="px-4 py-6 space-y-6">
          <h2 className="text-xl font-bold text-white mb-4">Order History</h2>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-usdt"></div>
              <span className="text-gray-400">Loading history...</span>
            </div>
          ) : orders.length === 0 ? (
            <Card className="p-6 text-center">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-400">No orders yet</p>
              <p className="text-sm text-gray-500">Start trading to see order history</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Card key={order._id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getOrderIcon(order.type)}
                      <div>
                        <div className="font-semibold text-white">
                          {order.type === 'BUY' ? 'Bought' : 'Sold'} {order.tokenAmount} {order.symbol}
                        </div>
                        <div className="text-sm text-gray-400">
                          ${order.tokenPrice?.toFixed(4)} per token
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.userAddress === walletAddress ? 'You' : order.userAddress?.slice(0, 6) + '...'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white">
                        ${order.amountInUsd?.toFixed(2)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <span>{formatTimeAgo(order.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        <Navigation />
      </div>
    </WalletCheck>
  );
} 