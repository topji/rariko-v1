'use client'

import React, { useState, useEffect } from 'react'
import { Navigation } from '../../components/Navigation'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Search, TrendingUp, TrendingDown, DollarSign, Volume2, RefreshCw, Loader2 } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { useSwap } from '../../hooks/useSwap'
import { useDynamicWallet } from '../../hooks/useDynamicWallet'
import { NATIVE_MINT } from '@solana/spl-token'

// Single token address for all stocks
const TOKEN_ADDRESS = 'Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh'

// Stock symbols and names
const STOCK_SYMBOLS = [
  { symbol: 'AAPLx', name: 'Apple xStock' },
  { symbol: 'MSFTx', name: 'Microsoft xStock' },
  { symbol: 'TSLAx', name: 'Tesla xStock' },
  { symbol: 'GOOGLx', name: 'Alphabet xStock' },
  { symbol: 'AMZNx', name: 'Amazon xStock' },
  { symbol: 'NVDAx', name: 'NVIDIA xStock' },
  { symbol: 'METAx', name: 'Meta xStock' },
  { symbol: 'NFLXx', name: 'Netflix xStock' },
  { symbol: 'SPYx', name: 'SPDR S&P 500 xStock' },
  { symbol: 'BRKx', name: 'Berkshire Hathaway xStock' },
  { symbol: 'JPMx', name: 'JPMorgan Chase xStock' },
  { symbol: 'JNJx', name: 'Johnson & Johnson xStock' },
  { symbol: 'Vx', name: 'Visa xStock' },
  { symbol: 'PGx', name: 'Procter & Gamble xStock' },
  { symbol: 'HDx', name: 'Home Depot xStock' },
  { symbol: 'MAx', name: 'Mastercard xStock' },
  { symbol: 'UNHx', name: 'UnitedHealth xStock' },
  { symbol: 'DISx', name: 'Disney xStock' },
  { symbol: 'PYPLx', name: 'PayPal xStock' },
  { symbol: 'ADBEx', name: 'Adobe xStock' },
  { symbol: 'CRMx', name: 'Salesforce xStock' },
  { symbol: 'NKEx', name: 'Nike xStock' },
  { symbol: 'INTCx', name: 'Intel xStock' },
  { symbol: 'VZx', name: 'Verizon xStock' },
  { symbol: 'CMCSAx', name: 'Comcast xStock' },
  { symbol: 'PEPx', name: 'PepsiCo xStock' },
  { symbol: 'ABTx', name: 'Abbott xStock' },
  { symbol: 'TMOx', name: 'Thermo Fisher xStock' },
  { symbol: 'COSTx', name: 'Costco xStock' },
  { symbol: 'DHRx', name: 'Danaher xStock' },
  { symbol: 'ACNx', name: 'Accenture xStock' },
  { symbol: 'LLYx', name: 'Eli Lilly xStock' },
  { symbol: 'TXNx', name: 'Texas Instruments xStock' },
  { symbol: 'HONx', name: 'Honeywell xStock' },
  { symbol: 'ISRGx', name: 'Intuitive Surgical xStock' },
  { symbol: 'GILDx', name: 'Gilead Sciences xStock' },
  { symbol: 'AMGNx', name: 'Amgen xStock' },
  { symbol: 'MDLZx', name: 'Mondelez xStock' },
  { symbol: 'BKNGx', name: 'Booking Holdings xStock' },
  { symbol: 'ADIx', name: 'Analog Devices xStock' },
  { symbol: 'REGNx', name: 'Regeneron xStock' },
  { symbol: 'VRTXx', name: 'Vertex Pharmaceuticals xStock' },
  { symbol: 'KLACx', name: 'KLA Corporation xStock' },
  { symbol: 'PANWx', name: 'Palo Alto Networks xStock' },
  { symbol: 'SNPSx', name: 'Synopsys xStock' },
  { symbol: 'CDNSx', name: 'Cadence Design xStock' },
  { symbol: 'MUx', name: 'Micron Technology xStock' },
  { symbol: 'ORCLx', name: 'Oracle xStock' },
  { symbol: 'CSCOx', name: 'Cisco Systems xStock' },
  { symbol: 'PFEx', name: 'Pfizer xStock' },
  { symbol: 'ABBVx', name: 'AbbVie xStock' },
  { symbol: 'BMYx', name: 'Bristol-Myers Squibb xStock' },
  { symbol: 'DEOx', name: 'Diageo xStock' },
  { symbol: 'ELVx', name: 'Elevance Health xStock' },
  { symbol: 'TJXx', name: 'TJX Companies xStock' },
  { symbol: 'ITWx', name: 'Illinois Tool Works xStock' },
  { symbol: 'SYKx', name: 'Stryker xStock' },
  { symbol: 'SPGIx', name: 'S&P Global xStock' },
  { symbol: 'ICEx', name: 'Intercontinental Exchange xStock' },
  { symbol: 'SHWx', name: 'Sherwin-Williams xStock' },
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
  const [buyAmountUSD, setBuyAmountUSD] = useState('')
  const [stocksData, setStocksData] = useState<StockData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [quoteData, setQuoteData] = useState<any>(null)
  const [isGettingQuote, setIsGettingQuote] = useState(false)
  const [solPrice, setSolPrice] = useState<number>(0)
  const [tokenPrice, setTokenPrice] = useState<number>(0)
  
  const { buyToken, getQuote, isLoading: isSwapLoading } = useSwap()
  const { isConnected, tokenBalances } = useDynamicWallet()
  
  // SOL balance
  const solBalance = tokenBalances?.find(token => token.symbol === 'SOL')?.balance || 0

  // Fetch SOL price
  const fetchSolPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
      const data = await response.json()
      setSolPrice(data.solana.usd)
    } catch (error) {
      console.error('Error fetching SOL price:', error)
      setSolPrice(0)
    }
  }

  // Fetch token price from Jupiter lite API
  const fetchTokenPrice = async () => {
    try {
      const response = await fetch(`https://lite-api.jup.ag/price/v3?ids=${TOKEN_ADDRESS}`)
      const data = await response.json()
      
      if (data && data[TOKEN_ADDRESS]) {
        setTokenPrice(data[TOKEN_ADDRESS].usdPrice)
        return data[TOKEN_ADDRESS]
      } else {
        throw new Error('No price data received')
      }
    } catch (error) {
      console.error('Error fetching token price:', error)
      setTokenPrice(0)
      return null
    }
  }

  // Fetch stock data from DexScreener API for additional data
  const fetchStockData = async (symbol: string, name: string): Promise<StockData> => {
    try {
      const response = await fetch(`https://api.dexscreener.com/tokens/v1/solana/${TOKEN_ADDRESS}`)
      const data = await response.json()
      
      if (data && data.length > 0) {
        const stock = data[0]
        return {
          symbol,
          name,
          priceUsd: tokenPrice.toString() || stock.priceUsd || '0',
          volume24h: stock.volume?.h24 || 0,
          priceChange24h: stock.priceChange?.h24 || 0,
          contractAddress: TOKEN_ADDRESS,
        }
      } else {
        throw new Error('No data received')
      }
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error)
      return {
        symbol,
        name,
        priceUsd: tokenPrice.toString() || '0',
        volume24h: 0,
        priceChange24h: 0,
        contractAddress: TOKEN_ADDRESS,
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
      // First fetch token price from Jupiter
      const priceData = await fetchTokenPrice()
      
      // Then fetch additional data from DexScreener
      const promises = STOCK_SYMBOLS.map(stock => 
        fetchStockData(stock.symbol, stock.name)
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
    fetchSolPrice()
  }, [])

  // Filter stocks based on search query
  const filteredStocks = stocksData.filter(stock =>
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Get quote for swap estimation
  const getSwapQuote = async (usdAmount: number) => {
    if (!selectedStock || !isConnected || solPrice === 0) return
    
    setIsGettingQuote(true)
    try {
      // Calculate SOL amount from USD using real price
      const solAmount = usdAmount / solPrice
      const amountInLamports = solAmount * 1e9
      
      const quote = await getQuote(
        NATIVE_MINT.toBase58(),
        selectedStock.contractAddress,
        amountInLamports.toString()
      )
      
      setQuoteData(quote)
    } catch (error) {
      console.error('Error getting quote:', error)
      setQuoteData(null)
    } finally {
      setIsGettingQuote(false)
    }
  }

  const handleBuyStock = async () => {
    if (!selectedStock || !buyAmountUSD || !isConnected || solPrice === 0) return
    
    const usdAmount = parseFloat(buyAmountUSD)
    
    // Validate minimum amount
    if (usdAmount < 1.00) {
      alert('Minimum purchase amount is $1.00')
      return
    }
    
    // Validate SOL balance (including 1% fee)
    const solAmount = usdAmount / solPrice
    const feeAmount = solAmount * 0.01 // 1% fee
    const totalRequiredSol = solAmount + feeAmount
    
    if (solBalance < totalRequiredSol) {
      alert(`Insufficient SOL balance. You need approximately ${totalRequiredSol.toFixed(4)} SOL (including ${feeAmount.toFixed(4)} SOL fee)`)
      return
    }
    
    try {
      const result = await buyToken(selectedStock.contractAddress, usdAmount)
      alert(`Successfully bought ${selectedStock.symbol}! Transaction: ${result.txId}\nFee: $${result.feeInUSD.toFixed(2)}`)
      setSelectedStock(null)
      setBuyAmountUSD('')
      setQuoteData(null)
    } catch (error) {
      console.error('Buy failed:', error)
      alert('Transaction failed. Please try again.')
    }
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
      <PageHeader showProfile={true} 
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
            
            {!isConnected && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">Please connect your wallet to buy stocks</p>
              </div>
            )}
            
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
                  Amount in USD
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={buyAmountUSD}
                  onChange={(e) => {
                    setBuyAmountUSD(e.target.value)
                    const amount = parseFloat(e.target.value)
                    if (amount >= 1.00) {
                      getSwapQuote(amount)
                    } else {
                      setQuoteData(null)
                    }
                  }}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum $1.00 - Buy fractional shares</p>
                
                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[10, 25, 50, 100, 250, 500].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBuyAmountUSD(amount.toString())
                        getSwapQuote(amount)
                      }}
                      className="h-8 text-xs"
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
              </div>
              
              {buyAmountUSD && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400">Platform Fee (1%)</span>
                    <span className="font-semibold text-white text-yellow-400">
                      ${(parseFloat(buyAmountUSD) * 0.01).toFixed(2)}
                    </span>
                  </div>
                  
                  {isGettingQuote && (
                    <div className="flex items-center justify-center p-3 bg-gray-800 rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin text-usdt mr-2" />
                      <span className="text-gray-400">Getting quote...</span>
                    </div>
                  )}
                  
                  {quoteData && !isGettingQuote && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <span className="text-gray-400">Estimated Output</span>
                        <span className="font-semibold text-white">
                          {parseFloat(quoteData.outAmount || '0').toFixed(2)} {selectedStock.symbol}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <span className="text-gray-400">Price Impact</span>
                        <span className="font-semibold text-white">
                          {parseFloat(quoteData.priceImpactPct || '0').toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400">Your SOL Balance</span>
                    <span className="font-semibold text-white">
                      {solBalance.toFixed(4)} SOL
                    </span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setSelectedStock(null)
                    setBuyAmountUSD('')
                    setQuoteData(null)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBuyStock}
                  disabled={!buyAmountUSD || parseFloat(buyAmountUSD) < 1.00 || isSwapLoading || !isConnected}
                  className="flex-1 bg-usdt hover:bg-primary-600"
                >
                  {isSwapLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Buy Shares'
                  )}
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