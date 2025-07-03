'use client'

import React, { useState, useEffect } from 'react'
import { Navigation } from '../../components/Navigation'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Search, TrendingUp, TrendingDown, DollarSign, Volume2, RefreshCw } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'

// Contract addresses for different stocks
const STOCK_CONTRACTS = [
  { address: 'XsHtf5RpxsQ7jeJ9ivNewouZKJHbPxhPoEy6yYvULr7', symbol: 'AAPLx', name: 'Apple xStock' },
  { address: 'XswbinNKyPmzTa5CskMbCPvMW6G5CMnZXZEeQSSQoie', symbol: 'MSFTx', name: 'Microsoft xStock' },
  { address: 'Xs5UJzmCRQ8DWZjskExdSQDnbE6iLkRu2jjrRAB1JSU', symbol: 'TSLAx', name: 'Tesla xStock' },
  { address: 'XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN', symbol: 'GOOGLx', name: 'Alphabet xStock' },
  { address: 'Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg', symbol: 'AMZNx', name: 'Amazon xStock' },
  { address: 'XsaQTCgebC2KPbf27KUhdv5JFvHhQ4GDAPURwrEhAzb', symbol: 'NVDAx', name: 'NVIDIA xStock' },
  { address: 'XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp', symbol: 'METAx', name: 'Meta xStock' },
  { address: 'XsPdAVBi8Zc1xvv53k4JcMrQaEDTgkGqKYeh7AYgPHV', symbol: 'NFLXx', name: 'Netflix xStock' },
  { address: 'Xs3ZFkPYT2BN7qBMqf1j1bfTeTm1rFzEFSsQ1z3wAKU', symbol: 'SPYx', name: 'SPDR S&P 500 xStock' },
]

interface StockData {
  symbol: string
  name: string
  priceUsd: string
  volume24h: number
  priceChange24h: number
  contractAddress: string
  isLoading?: boolean
  error?: string
}

export default function StocksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null)
  const [buyAmount, setBuyAmount] = useState('')
  const [stocksData, setStocksData] = useState<StockData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch stock data from DexScreener API
  const fetchStockData = async (contractAddress: string, symbol: string, name: string): Promise<StockData> => {
    try {
      const response = await fetch(`https://api.dexscreener.com/tokens/v1/solana/${contractAddress}`)
      const data = await response.json()
      
      if (data && data.length > 0) {
        const stock = data[0]
        return {
          symbol,
          name,
          priceUsd: stock.priceUsd || '0',
          volume24h: stock.volume?.h24 || 0,
          priceChange24h: stock.priceChange?.h24 || 0,
          contractAddress,
        }
      } else {
        throw new Error('No data received')
      }
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error)
      return {
        symbol,
        name,
        priceUsd: '0',
        volume24h: 0,
        priceChange24h: 0,
        contractAddress,
        error: 'Failed to load data'
      }
    }
  }

  // Fetch all stock data
  const fetchAllStocks = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const promises = STOCK_CONTRACTS.map(stock => 
        fetchStockData(stock.address, stock.symbol, stock.name)
      )
      
      const results = await Promise.all(promises)
      setStocksData(results)
    } catch (error) {
      console.error('Error fetching stocks data:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchAllStocks()
  }, [])

  // Filter stocks based on search query
  const filteredStocks = stocksData.filter(stock =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleBuyStock = () => {
    if (!selectedStock || !buyAmount) return
    
    const amount = parseFloat(buyAmount)
    const totalCost = amount * parseFloat(selectedStock.priceUsd)
    
    // Simulate transaction
    alert(`Order placed: ${amount} shares of ${selectedStock.symbol} for $${totalCost.toFixed(2)}`)
    setSelectedStock(null)
    setBuyAmount('')
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`
    return `$${volume.toFixed(2)}`
  }

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price)
    return numPrice >= 100 ? numPrice.toFixed(2) : numPrice.toFixed(4)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Header */}
      <PageHeader 
        showRefresh={true}
        onRefresh={() => fetchAllStocks(true)}
        isRefreshing={isRefreshing}
      />

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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin text-usdt" />
              <span className="text-gray-400">Loading stocks...</span>
            </div>
          </div>
        )}

        {/* Stock List */}
        {!isLoading && (
          <div className="space-y-3">
            {filteredStocks.map((stock) => (
              <Card key={stock.symbol} className="p-4 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-usdt to-green-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{stock.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-white">{stock.symbol}</h3>
                        <p className="text-gray-400 text-sm">{stock.name}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-white">
                      ${formatPrice(stock.priceUsd)}
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      stock.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stock.priceChange24h >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {stock.priceChange24h >= 0 ? '+' : ''}{stock.priceChange24h.toFixed(2)}%
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    <span>24h Vol: {formatVolume(stock.volume24h)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>Market Cap: ${(parseFloat(stock.priceUsd) * 1000000).toLocaleString()}</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => setSelectedStock(stock)}
                  className="w-full mt-3 bg-usdt hover:bg-primary-600"
                  disabled={stock.error !== undefined}
                >
                  {stock.error ? 'Data Unavailable' : `Buy ${stock.symbol}`}
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredStocks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No stocks found matching your search.</p>
          </div>
        )}
      </div>

      {/* Buy Modal */}
      {selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-white">Buy {selectedStock.symbol}</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">Current Price</span>
                <span className="font-semibold text-white">${formatPrice(selectedStock.priceUsd)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">24h Change</span>
                <span className={`font-semibold ${
                  selectedStock.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {selectedStock.priceChange24h >= 0 ? '+' : ''}{selectedStock.priceChange24h.toFixed(2)}%
                </span>
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
                    ${(parseFloat(buyAmount) * parseFloat(selectedStock.priceUsd)).toFixed(2)} USDT
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