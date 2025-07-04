'use client'

import React from 'react'
import { Navigation } from '../../components/Navigation'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { TrendingUp, TrendingDown, DollarSign, Percent, PieChart } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'

// Mock portfolio data
const mockPortfolio = {
  totalValue: 15420.67,
  totalChange: 1245.32,
  totalChangePercent: 8.78,
  totalInvested: 14175.35,
  holdings: [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      shares: 25,
      avgPrice: 165.20,
      currentPrice: 175.43,
      totalValue: 4385.75,
      totalChange: 255.75,
      changePercent: 6.18,
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      shares: 15,
      avgPrice: 138.90,
      currentPrice: 142.56,
      totalValue: 2138.40,
      totalChange: 54.90,
      changePercent: 2.64,
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      shares: 8,
      avgPrice: 365.20,
      currentPrice: 378.85,
      totalValue: 3030.80,
      totalChange: 109.20,
      changePercent: 3.74,
    },
    {
      symbol: 'TSLA',
      name: 'Tesla, Inc.',
      shares: 12,
      avgPrice: 260.15,
      currentPrice: 248.42,
      totalValue: 2981.04,
      totalChange: -140.76,
      changePercent: -4.51,
    },
    {
      symbol: 'NVDA',
      name: 'NVIDIA Corporation',
      shares: 6,
      avgPrice: 470.25,
      currentPrice: 485.09,
      totalValue: 2910.54,
      totalChange: 89.04,
      changePercent: 3.16,
    },
  ]
}

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Header */}
              <PageHeader showProfile={true} />

      <div className="px-4 py-6 space-y-6">
        {/* Portfolio Overview */}
        <Card variant="elevated" className="bg-gradient-to-br from-usdt to-primary-600 text-white">
          <div className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">${mockPortfolio.totalValue.toLocaleString()}</h2>
            <div className={`flex items-center justify-center gap-1 text-sm mb-2 ${
              mockPortfolio.totalChange >= 0 ? 'text-green-300' : 'text-red-300'
            }`}>
              {mockPortfolio.totalChange >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {mockPortfolio.totalChange >= 0 ? '+' : ''}${mockPortfolio.totalChange.toFixed(2)} ({mockPortfolio.totalChangePercent >= 0 ? '+' : ''}{mockPortfolio.totalChangePercent.toFixed(2)}%)
            </div>
            <p className="text-blue-200 text-sm">Total Invested: ${mockPortfolio.totalInvested.toLocaleString()}</p>
          </div>
        </Card>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-usdt" />
            <div className="text-lg font-semibold text-white">{mockPortfolio.holdings.length}</div>
            <div className="text-gray-400 text-sm">Stocks</div>
          </Card>
          
          <Card className="p-4 text-center">
            <Percent className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <div className="text-lg font-semibold text-white">{mockPortfolio.totalChangePercent.toFixed(2)}%</div>
            <div className="text-gray-400 text-sm">Total Return</div>
          </Card>
        </div>

        {/* Holdings */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Holdings</h3>
          <div className="space-y-3">
            {mockPortfolio.holdings.map((holding) => (
              <Card key={holding.symbol} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{holding.symbol[0]}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{holding.symbol}</h4>
                        <p className="text-gray-400 text-sm">{holding.name}</p>
                        <p className="text-gray-400 text-xs">{holding.shares} shares</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold text-white">${holding.totalValue.toFixed(2)}</div>
                    <div className={`flex items-center gap-1 text-sm ${
                      holding.totalChange >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {holding.totalChange >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {holding.totalChange >= 0 ? '+' : ''}${holding.totalChange.toFixed(2)} ({holding.changePercent >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%)
                    </div>
                    <div className="text-gray-400 text-xs">
                      Avg: ${holding.avgPrice} | Current: ${holding.currentPrice}
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-sm"
                  >
                    Buy More
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-sm"
                  >
                    Sell
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Navigation />
    </div>
  )
} 