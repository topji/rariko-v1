'use client'

import React, { useState } from 'react'
import { Navigation } from '../../components/Navigation'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { TrendingUp, TrendingDown, DollarSign, Percent, PieChart, RefreshCw, Loader2 } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { usePortfolio } from '../../hooks/usePortfolio'
import { useRouter } from 'next/navigation'
import SellTokenModal from '../../components/SellTokenModal'
import TransactionSuccessModal from '../../components/TransactionSuccessModal'
import WalletCheck from '../../components/WalletCheck'

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

  const handleBuyMore = (contractAddress: string) => {
    // Navigate to stocks page with the token pre-selected
    router.push('/stocks')
  }

  const handleSell = (holding: any) => {
    setSelectedHolding(holding)
    setShowSellModal(true)
  }

  const handleSellSuccess = (result: any) => {
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
    <WalletCheck>
      <div className="min-h-screen bg-gray-900 text-white pb-20">
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

        {/* Portfolio Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-usdt" />
            <div className="text-lg font-semibold text-white">{holdings.length}</div>
            <div className="text-gray-400 text-sm">Tokens</div>
          </Card>
          
          <Card className="p-4 text-center">
            <Percent className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <div className="text-lg font-semibold text-white">{totalChangePercent.toFixed(2)}%</div>
            <div className="text-gray-400 text-sm">Total Return</div>
          </Card>
        </div>

        {/* Holdings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Holdings</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshPortfolio}
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
          ) : (
          <div className="space-y-3">
              {holdings.map((holding) => (
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
      </div>
    </WalletCheck>
  )
} 