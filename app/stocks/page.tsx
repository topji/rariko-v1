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
  { address: 'XswsQk4duEQmCbGzfqUUWYmi7pV7xpJ9eEmLHXCaEQP', symbol: 'BRKx', name: 'Berkshire Hathaway xStock' },
  { address: 'Xs6B6zawENwAbWVi7w92rjazLuAr5Az59qgWKcNb45x', symbol: 'JPMx', name: 'JPMorgan Chase xStock' },
  { address: 'XsgSaSvNSqLTtFuyWPBhK9196Xb9Bbdyjj4fH3cPJGo', symbol: 'JNJx', name: 'Johnson & Johnson xStock' },
  { address: 'XsNNMt7WTNA2sV3jrb1NNfNgapxRF5i4i6GcnTRRHts', symbol: 'Vx', name: 'Visa xStock' },
  { address: 'XsueG8BtpquVJX9LVLLEGuViXUungE6WmK5YZ3p3bd1', symbol: 'PGx', name: 'Procter & Gamble xStock' },
  { address: 'Xsr3pdLQyXvDJBFgpR5nexCEZwXvigb8wbPYp4YoNFf', symbol: 'HDx', name: 'Home Depot xStock' },
  { address: 'XsaBXg8dU5cPM6ehmVctMkVqoiRG2ZjMo1cyBJ3AykQ', symbol: 'MAx', name: 'Mastercard xStock' },
  { address: 'Xs7ZdzSHLU9ftNJsii5fCeJhoRWSC32SQGzGQtePxNu', symbol: 'UNHx', name: 'UnitedHealth xStock' },
  { address: 'XsvKCaNsxg2GN8jjUmq71qukMJr7Q1c5R2Mk9P8kcS8', symbol: 'DISx', name: 'Disney xStock' },
  { address: 'Xs7xXqkcK7K8urEqGg52SECi79dRp2cEKKuYjUePYDw', symbol: 'PYPLx', name: 'PayPal xStock' },
  { address: 'Xseo8tgCZfkHxWS9xbFYeKFyMSbWEvZGFV1Gh53GtCV', symbol: 'ADBEx', name: 'Adobe xStock' },
  { address: 'Xs2yquAgsHByNzx68WJC55WHjHBvG9JsMB7CWjTLyPy', symbol: 'CRMx', name: 'Salesforce xStock' },
  { address: 'Xsnuv4omNoHozR6EEW5mXkw8Nrny5rB3jVfLqi6gKMH', symbol: 'NKEx', name: 'Nike xStock' },
  { address: 'XsaHND8sHyfMfsWPj6kSdd5VwvCayZvjYgKmmcNL5qh', symbol: 'INTCx', name: 'Intel xStock' },
  { address: 'Xsf9mBktVB9BSU5kf4nHxPq5hCBJ2j2ui3ecFGxPRGc', symbol: 'VZx', name: 'Verizon xStock' },
  { address: 'Xsv9hRk1z5ystj9MhnA7Lq4vjSsLwzL2nxrwmwtD3re', symbol: 'CMCSAx', name: 'Comcast xStock' },
  { address: 'XsgaUyp4jd1fNBCxgtTKkW64xnnhQcvgaxzsbAq5ZD1', symbol: 'PEPx', name: 'PepsiCo xStock' },
  { address: 'XszjVtyhowGjSC5odCqBpW1CtXXwXjYokymrk7fGKD3', symbol: 'ABTx', name: 'Abbott xStock' },
  { address: 'XsRbLZthfABAPAfumWNEJhPyiKDW6TvDVeAeW7oKqA2', symbol: 'TMOx', name: 'Thermo Fisher xStock' },
  { address: 'XshPgPdXFRWB8tP1j82rebb2Q9rPgGX37RuqzohmArM', symbol: 'COSTx', name: 'Costco xStock' },
  { address: 'XspwhyYPdWVM8XBHZnpS9hgyag9MKjLRyE3tVfmCbSr', symbol: 'DHRx', name: 'Danaher xStock' },
  { address: 'XsGVi5eo1Dh2zUpic4qACcjuWGjNv8GCt3dm5XcX6Dn', symbol: 'ACNx', name: 'Accenture xStock' },
  { address: 'XsMAqkcKsUewDrzVkait4e5u4y8REgtyS7jWgCpLV2C', symbol: 'LLYx', name: 'Eli Lilly xStock' },
  { address: 'XsSr8anD1hkvNMu8XQiVcmiaTP7XGvYu7Q58LdmtE8Z', symbol: 'TXNx', name: 'Texas Instruments xStock' },
  { address: 'XsuxRGDzbLjnJ72v74b7p9VY6N66uYgTCyfwwRjVCJA', symbol: 'HONx', name: 'Honeywell xStock' },
  { address: 'XsApJFV9MAktqnAc6jqzsHVujxkGm9xcSUffaBoYLKC', symbol: 'ISRGx', name: 'Intuitive Surgical xStock' },
  { address: 'XsqE9cRRpzxcGKDXj1BJ7Xmg4GRhZoyY1KpmGSxAWT2', symbol: 'GILDx', name: 'Gilead Sciences xStock' },
  { address: 'XsDgw22qRLTv5Uwuzn6T63cW69exG41T6gwQhEK22u2', symbol: 'AMGNx', name: 'Amgen xStock' },
  { address: 'XsnQnU7AdbRZYe2akqqpibDdXjkieGFfSkbkjX1Sd1X', symbol: 'MDLZx', name: 'Mondelez xStock' },
  { address: 'Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu', symbol: 'BKNGx', name: 'Booking Holdings xStock' },
  { address: 'XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX', symbol: 'ADIx', name: 'Analog Devices xStock' },
  { address: 'XsP7xzNPvEHS1m6qfanPUGjNmdnmsLKEoNAnHjdxxyZ', symbol: 'REGNx', name: 'Regeneron xStock' },
  { address: 'Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ', symbol: 'VRTXx', name: 'Vertex Pharmaceuticals xStock' },
  { address: 'XsEH7wWfJJu2ZT3UCFeVfALnVA6CP5ur7Ee11KmzVpL', symbol: 'KLACx', name: 'KLA Corporation xStock' },
  { address: 'XsfAzPzYrYjd4Dpa9BU3cusBsvWfVB9gBcyGC87S57n', symbol: 'PANWx', name: 'Palo Alto Networks xStock' },
  { address: 'Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh', symbol: 'SNPSx', name: 'Synopsys xStock' },
  { address: 'XsjFwUPiLofddX5cWFHW35GCbXcSu1BCUGfxoQAQjeL', symbol: 'CDNSx', name: 'Cadence Design xStock' },
  { address: 'XsoBhf2ufR8fTyNSjqfU71DYGaE6Z3SUGAidpzriAA4', symbol: 'MUx', name: 'Micron Technology xStock' },
  { address: 'Xsv99frTRUeornyvCfvhnDesQDWuvns1M852Pez91vF', symbol: 'ORCLx', name: 'Oracle xStock' },
  { address: 'XsAtbqkAP1HJxy7hFDeq7ok6yM43DQ9mQ1Rh861X8rw', symbol: 'CSCOx', name: 'Cisco Systems xStock' },
  { address: 'Xsba6tUnSjDae2VcopDB6FGGDaxRrewFCDa5hKn5vT3', symbol: 'PFEx', name: 'Pfizer xStock' },
  { address: 'XsYdjDjNUygZ7yGKfQaB6TxLh2gC6RRjzLtLAGJrhzV', symbol: 'ABBVx', name: 'AbbVie xStock' },
  { address: 'XsvNBAYkrDRNhA7wPHQfX3ZUXZyZLdnCQDfHZ56bzpg', symbol: 'BMYx', name: 'Bristol-Myers Squibb xStock' },
  { address: 'XsczbcQ3zfcgAEt9qHQES8pxKAVG5rujPSHQEXi4kaN', symbol: 'TMOx', name: 'Thermo Fisher Scientific xStock' },
  { address: 'XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W', symbol: 'DEOx', name: 'Diageo xStock' },
  { address: 'XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB', symbol: 'ELVx', name: 'Elevance Health xStock' },
  { address: 'Xs8drBWy3Sd5QY3aifG9kt9KFs2K3PGZmx7jWrsrk57', symbol: 'TJXx', name: 'TJX Companies xStock' },
  { address: 'XsjQP3iMAaQ3kQScQKthQpx9ALRbjKAjQtHg6TFomoc', symbol: 'ITWx', name: 'Illinois Tool Works xStock' },
  { address: 'XszvaiXGPwvk2nwb3o9C1CX4K6zH8sez11E6uyup6fe', symbol: 'SYKx', name: 'Stryker xStock' },
  { address: 'XsssYEQjzxBCFgvYFFNuhJFBeHNdLWYeUSP8F45cDr9', symbol: 'SPGIx', name: 'S&P Global xStock' },
  { address: 'XsqgsbXwWogGJsNcVZ3TyVouy2MbTkfCFhCGGGcQZ2p', symbol: 'ICEx', name: 'Intercontinental Exchange xStock' },
  { address: 'Xs151QeqTCiuKtinzfRATnUESM2xTU6V9Wy8Vy538ci', symbol: 'SHWx', name: 'Sherwin-Williams xStock' },
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