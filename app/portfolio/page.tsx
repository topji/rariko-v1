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
  PieChart,
  Activity
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

export default function PortfolioPage() {
  const { 
    totalValue, 
    totalChange, 
    totalChangePercent, 
    totalInvested, 
    holdings, 
    isLoading, 
    error,
    refreshPortfolio 
  } = usePortfolio()
  
  const router = useRouter()
  const [showSellModal, setShowSellModal] = useState(false)
  const [selectedHolding, setSelectedHolding] = useState<any>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState<any>(null)
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [processingMessage, setProcessingMessage] = useState('')
  
  // New state for PnL and Volume data
  const [pnlData, setPnlData] = useState<any>({
    totalRealizedPnL: 0,
    totalUnrealizedPnL: 0
  })
  const [volumeData, setVolumeData] = useState<any>({
    totalVolume: 0
  })
  const [isLoadingPnL, setIsLoadingPnL] = useState(false)

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
    setTimeout(() => refreshPortfolio(), 2000)
  }

  // Fetch PnL and Volume data
  const fetchPnLAndVolume = async () => {
    const walletAddress = useDynamicWallet().walletAddress
    if (!walletAddress) return
    
    setIsLoadingPnL(true)
    try {
      const [realizedPnLResponse, volumeResponse, holdingsResponse] = await Promise.all([
        orderApi.getUserRealizedPnL(walletAddress),
        orderApi.getUserVolume(walletAddress),
        orderApi.getUserHoldings(walletAddress)
      ])

      console.log('PnL Response:', realizedPnLResponse)
      console.log('Volume Response:', volumeResponse)
      console.log('Holdings Response:', holdingsResponse)

      setPnlData({
        totalRealizedPnL: realizedPnLResponse.totalRealizedPnL || 0,
        totalUnrealizedPnL: 0 // We'll calculate this from holdings if needed
      })
      
      // Handle volume response structure
      const totalVolume = volumeResponse.volume?.totalVolume || 
                         volumeResponse.totalVolume || 
                         volumeResponse.user?.totalVolume || 0
      
      setVolumeData({
        totalVolume: totalVolume
      })
    } catch (error) {
      console.error('Error fetching PnL and Volume data:', error)
      // Set default values on error
      setPnlData({
        totalRealizedPnL: 0,
        totalUnrealizedPnL: 0
      })
      setVolumeData({
        totalVolume: 0
      })
    } finally {
      setIsLoadingPnL(false)
    }
  }

  // Fetch data on component mount
  useEffect(() => {
    fetchPnLAndVolume()
  }, [useDynamicWallet().walletAddress])

  // Also fetch when portfolio refreshes
  useEffect(() => {
    if (!isLoading) {
      fetchPnLAndVolume()
    }
  }, [isLoading])

  if (isLoading) {
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
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pb-20">
        <PageHeader showProfile={true} />
        <div className="px-4 py-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={refreshPortfolio} className="bg-usdt hover:bg-primary-600">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
        <Navigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
              <PageHeader showProfile={true} />

      <div className="px-4 py-6 space-y-6">
        {/* Portfolio Overview */}
        <Card variant="elevated" className="bg-gradient-to-br from-usdt to-primary-600 text-white">
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">${totalValue.toLocaleString()}</h2>
            <div className={`flex items-center justify-center gap-1 text-sm mb-2 ${
              totalChange >= 0 ? 'text-green-300' : 'text-red-300'
            }`}>
              {totalChange >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {totalChange >= 0 ? '+' : ''}${totalChange.toFixed(2)} ({totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%)
            </div>
            <p className="text-blue-200 text-sm">Total Invested: ${totalInvested.toLocaleString()}</p>
          </div>
        </Card>

        {/* PnL and Volume Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total PnL Card */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-gray-400">Total P&L</span>
            </div>
            {isLoadingPnL ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                <span className="text-gray-400">Loading...</span>
              </div>
            ) : (
              <>
                <div className={`text-2xl font-bold ${
                  (pnlData.totalRealizedPnL + pnlData.totalUnrealizedPnL) >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {(pnlData.totalRealizedPnL + pnlData.totalUnrealizedPnL) >= 0 ? '+' : ''}${(pnlData.totalRealizedPnL + pnlData.totalUnrealizedPnL).toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">
                  Realized: ${pnlData.totalRealizedPnL.toFixed(2)} | Unrealized: ${pnlData.totalUnrealizedPnL.toFixed(2)}
                </div>
              </>
            )}
          </Card>
          
          {/* Volume Card */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs text-gray-400">Total Volume</span>
            </div>
            {isLoadingPnL ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                <span className="text-gray-400">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-white">
                  ${volumeData.totalVolume.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">
                  Lifetime trading volume
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Holdings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Holdings</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                refreshPortfolio()
                fetchPnLAndVolume()
              }}
              className="text-gray-400 hover:text-usdt"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          
          {holdings.length === 0 ? (
            <Card className="p-8 text-center">
              <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <h4 className="text-lg font-semibold text-white mb-2">No Holdings</h4>
              <p className="text-gray-400 mb-4">You don't have any tokens in your portfolio yet.</p>
              <Button 
                onClick={() => router.push('/stocks')}
                className="bg-usdt hover:bg-primary-600"
              >
                Buy Your First Token
              </Button>
            </Card>
          ) : holdings.filter(holding => holding.totalValue >= 0.05).length === 0 ? (
            <Card className="p-8 text-center">
              <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <h4 className="text-lg font-semibold text-white mb-2">No Visible Holdings</h4>
              <p className="text-gray-400 mb-4">Your holdings are below the $0.05 minimum display threshold.</p>
              <Button 
                onClick={() => router.push('/stocks')}
                className="bg-usdt hover:bg-primary-600"
              >
                Buy More Tokens
              </Button>
            </Card>
          ) : (
          <div className="space-y-3">
              {holdings
                .filter(holding => holding.totalValue >= 0.05) // Filter out holdings less than $0.05
                .map((holding) => (
                <Card key={holding.contractAddress} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{holding.symbol[0]}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{holding.symbol}</h4>
                        <p className="text-gray-400 text-sm">{holding.name}</p>
                          <p className="text-gray-400 text-xs">{holding.balanceFormatted} {holding.symbol}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-white">${holding.totalValue.toFixed(2)}</div>
                    <div className={`flex items-center gap-1 text-sm ${
                        (holding.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                        {(holding.change24h || 0) >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                        {(holding.change24h || 0) >= 0 ? '+' : ''}{(holding.change24h || 0).toFixed(2)}%
                    </div>
                    <div className="text-gray-400 text-xs">
                        ${holding.priceUsd.toFixed(4)} per {holding.symbol}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-sm"
                      onClick={() => handleBuyMore(holding.contractAddress)}
                  >
                    Buy More
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-sm"
                      onClick={() => handleSell(holding)}
                  >
                    Sell
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          )}
        </div>
      </div>

      <Navigation />
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
    </div>
  )
} 