'use client'

import React, { useState } from 'react'
import { Navigation } from '../../components/Navigation'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Search, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react'

// Mock stock data
const mockStocks = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.43,
    change: 2.34,
    changePercent: 1.35,
    marketCap: '2.8T',
    volume: '45.2M',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.56,
    change: -1.23,
    changePercent: -0.85,
    marketCap: '1.8T',
    volume: '23.1M',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.85,
    change: 5.67,
    changePercent: 1.52,
    marketCap: '2.9T',
    volume: '32.8M',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    price: 248.42,
    change: -8.91,
    changePercent: -3.46,
    marketCap: '789B',
    volume: '89.5M',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    price: 145.24,
    change: 3.21,
    changePercent: 2.26,
    marketCap: '1.5T',
    volume: '56.7M',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 485.09,
    change: 12.45,
    changePercent: 2.64,
    marketCap: '1.2T',
    volume: '67.3M',
  },
]

export default function StocksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStock, setSelectedStock] = useState<any>(null)
  const [buyAmount, setBuyAmount] = useState('')

  const filteredStocks = mockStocks.filter(stock =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleBuyStock = () => {
    if (!selectedStock || !buyAmount) return
    
    const amount = parseFloat(buyAmount)
    const totalCost = amount * selectedStock.price
    
    // Simulate transaction
    alert(`Order placed: ${amount} shares of ${selectedStock.symbol} for $${totalCost.toFixed(2)}`)
    setSelectedStock(null)
    setBuyAmount('')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-usdt rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Stocks</h1>
            <p className="text-sm text-gray-400">Buy tokenized US stocks with USDT</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>

        {/* Stock List */}
        <div className="space-y-3">
          {filteredStocks.map((stock) => (
            <Card key={stock.symbol} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{stock.symbol[0]}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white">{stock.symbol}</h3>
                      <p className="text-gray-400 text-sm">{stock.name}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">${stock.price}</div>
                  <div className={`flex items-center gap-1 text-sm ${
                    stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stock.change >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                <span>Market Cap: {stock.marketCap}</span>
                <span>Volume: {stock.volume}</span>
              </div>
              
              <Button
                onClick={() => setSelectedStock(stock)}
                className="w-full mt-3 bg-usdt hover:bg-primary-600"
              >
                Buy {stock.symbol}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Buy Modal */}
      {selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-white">Buy {selectedStock.symbol}</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">Current Price</span>
                <span className="font-semibold text-white">${selectedStock.price}</span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Number of Shares
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              {buyAmount && (
                <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                  <span className="text-gray-400">Total Cost</span>
                  <span className="font-semibold text-white">
                    ${(parseFloat(buyAmount) * selectedStock.price).toFixed(2)} USDT
                  </span>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setSelectedStock(null)
                    setBuyAmount('')
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBuyStock}
                  disabled={!buyAmount || parseFloat(buyAmount) <= 0}
                  className="flex-1 bg-usdt hover:bg-primary-600"
                >
                  Buy Shares
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Navigation />
    </div>
  )
} 