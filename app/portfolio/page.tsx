'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Percent,
  RefreshCw,
  BarChart3,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  PieChart
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { useDynamicWallet } from '../../hooks/useDynamicWallet'
import { formatUSDT, formatCurrency, shortenAddress } from '../../lib/utils'
import { useRouter } from 'next/navigation'
import { Navigation } from '../../components/Navigation'
import { PageHeader } from '../../components/PageHeader'
import { useUserApi } from '../../hooks/useUserApi'
import { orderApi } from '../../lib/api'
import SellTokenModal from '../../components/SellTokenModal'
import TransactionSuccessModal from '../../components/TransactionSuccessModal'
import { usePortfolio } from '../../hooks/usePortfolio'
import WalletCheck from '../../components/WalletCheck';

export default function PortfolioPage() {
  const { walletAddress } = useDynamicWallet();
  const [portfolioData, setPortfolioData] = useState<any>({
    portfolioValue: 0,
    totalVolume: 0,
    totalProfitLoss: 0,
    unrealizedPnL: 0,
    holdings: [],
    isLoading: true,
    error: null
  });

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!walletAddress) return;
      setPortfolioData((d: any) => ({ ...d, isLoading: true }));
      try {
        const [holdingsRes, volumeRes] = await Promise.all([
          orderApi.getUserHoldings(walletAddress),
          orderApi.getUserVolume(walletAddress)
        ]);
        // Calculate portfolio value and unrealized PnL
        let portfolioValue = 0;
        let unrealizedPnL = 0;
        (holdingsRes.holdings || []).forEach((h: any) => {
          portfolioValue += h.currentHoldings * h.averageBuyPrice; // Approximation
          unrealizedPnL += (h.currentHoldings * h.averageBuyPrice) - h.totalBoughtValue;
        });
        setPortfolioData({
          portfolioValue,
          totalVolume: volumeRes.volume?.totalVolume || 0,
          totalProfitLoss: portfolioValue - (holdingsRes.holdings || []).reduce((sum: number, h: any) => sum + h.totalBoughtValue, 0),
          unrealizedPnL,
          holdings: holdingsRes.holdings || [],
          isLoading: false,
          error: null
        });
      } catch (e) {
        setPortfolioData((d: any) => ({ ...d, isLoading: false, error: 'Failed to load portfolio' }));
      }
    };
    fetchPortfolio();
  }, [walletAddress]);

  const router = useRouter()
  const [showSellModal, setShowSellModal] = useState(false)
  const [selectedHolding, setSelectedHolding] = useState<any>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState<any>(null)
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [processingMessage, setProcessingMessage] = useState('')

  const handleBuyMore = (contractAddress: string) => {
    // Navigate to stocks page with the token pre-selected
    router.push('/stocks')
  }

  const handleSell = (holding: any) => {
    setSelectedHolding(holding)
    setShowSellModal(true)
  }

  const handleSellSuccess = (result: any) => {
    setShowProcessingModal(false)
    setSuccessData({
      txId: result.txId,
      tokenSymbol: selectedHolding.symbol,
      tokenAmount: result.tokenAmount || 0,
      usdAmount: (result.tokenAmount || 0) * selectedHolding.priceUsd,
      feeInUSD: result.feeInUSD,
      tokenPrice: selectedHolding.priceUsd
    })
    setShowSuccessModal(true)
    setShowSellModal(false)
    setSelectedHolding(null)
    // Refresh portfolio data
    setTimeout(() => window.location.reload(), 2000)
  }

  if (portfolioData.isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pb-20">
        <PageHeader showProfile={true} />
        <div className="px-4 py-6 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-usdt" />
            <span className="text-gray-400">Loading portfolio...</span>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  if (portfolioData.error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pb-20">
        <PageHeader showProfile={true} />
        <div className="px-4 py-6 text-center">
          <p className="text-red-400 mb-4">{portfolioData.error}</p>
          <Button onClick={() => window.location.reload()} className="bg-usdt hover:bg-primary-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <WalletCheck>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <PageHeader showProfile={true} />
        <div className="px-4 py-6 space-y-6">
          {/* Portfolio Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Portfolio Value */}
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
              <div className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Portfolio Value</span>
                </div>
                <div className="text-xl font-bold">${portfolioData.portfolioValue.toLocaleString()}</div>
              </div>
            </Card>

            {/* Total PnL */}
            <Card className={`bg-gradient-to-br ${portfolioData.totalProfitLoss >= 0 ? 'from-green-600 to-green-700' : 'from-red-600 to-red-700'} text-white`}>
              <div className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Total PnL</span>
                </div>
                <div className="text-xl font-bold">
                  {portfolioData.totalProfitLoss >= 0 ? '+' : ''}${portfolioData.totalProfitLoss.toFixed(2)}
                </div>
              </div>
            </Card>

            {/* Unrealized PnL */}
            <Card className={`bg-gradient-to-br ${portfolioData.unrealizedPnL >= 0 ? 'from-emerald-600 to-emerald-700' : 'from-orange-600 to-orange-700'} text-white`}>
              <div className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Percent className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Unrealized PnL</span>
                </div>
                <div className="text-lg font-bold">
                  {portfolioData.unrealizedPnL >= 0 ? '+' : ''}${portfolioData.unrealizedPnL.toFixed(2)}
                </div>
              </div>
            </Card>

            {/* Volume */}
            <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white">
              <div className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">Volume</span>
                </div>
                <div className="text-xl font-bold">${portfolioData.totalVolume.toLocaleString()}</div>
              </div>
            </Card>
          </div>

          {/* Holdings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Holdings</h3>
            </div>
            {portfolioData.holdings.length === 0 ? (
              <Card className="p-8 text-center">
                <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                <h4 className="text-lg font-semibold text-white mb-2">No Holdings</h4>
                <p className="text-gray-400 mb-4">You don't have any tokens in your portfolio yet.</p>
                <Button onClick={() => window.location.href = '/stocks'} className="bg-usdt hover:bg-primary-600">Buy Your First Token</Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {portfolioData.holdings.map((holding: any) => (
                  <Card key={holding.tokenAddress} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm">{holding.symbol[0]}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{holding.symbol}</h4>
                            <p className="text-gray-400 text-xs">Avg Buy: ${holding.averageBuyPrice?.toFixed(4)}</p>
                            <p className="text-gray-400 text-xs">Current: {holding.currentHoldings} {holding.symbol}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">${(holding.currentHoldings * holding.averageBuyPrice).toFixed(2)}</div>
                        <div className="text-gray-400 text-xs">Total Invested: ${holding.totalBoughtValue.toFixed(2)}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
        <Navigation />
      </div>
      {/* Sell Modal */}
      {showSellModal && selectedHolding && (
        <SellTokenModal
          isOpen={showSellModal}
          onClose={() => setShowSellModal(false)}
          onSuccess={handleSellSuccess}
          token={{
            symbol: selectedHolding.symbol,
            name: selectedHolding.name,
            priceUsd: selectedHolding.priceUsd.toString(),
            volume24h: 0,
            priceChange24h: selectedHolding.change24h || 0,
            contractAddress: selectedHolding.contractAddress,
            balance: selectedHolding.balance,
            decimals: selectedHolding.decimals
          }}
        />
      )}

      {/* Success Modal */}
      {showSuccessModal && successData && (
        <TransactionSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          txId={successData.txId}
          tokenSymbol={successData.tokenSymbol}
          tokenAmount={successData.tokenAmount}
          usdAmount={successData.usdAmount}
          feeInUSD={successData.feeInUSD}
          tokenPrice={successData.tokenPrice}
          transactionType="sell"
        />
      )}

      {/* Processing Modal */}
      {showProcessingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-usdt mx-auto mb-6"></div>
            <h3 className="text-xl font-bold text-white mb-2">Processing Transaction</h3>
            <p className="text-gray-400 mb-4">{processingMessage}</p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-usdt rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-usdt rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-usdt rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
    </WalletCheck>
  )
} 