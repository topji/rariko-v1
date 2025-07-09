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

// Single token address
const TOKEN_ADDRESS = 'Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh'

interface TokenData {
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
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null)
  const [buyAmountUSD, setBuyAmountUSD] = useState('')
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
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

  // Fetch token data from Jupiter and DexScreener APIs
  const fetchTokenData = async (): Promise<TokenData> => {
    try {
      // Fetch price from Jupiter lite API
      const jupiterResponse = await fetch(`https://lite-api.jup.ag/price/v3?ids=${TOKEN_ADDRESS}`)
      const jupiterData = await jupiterResponse.json()
      
      // Fetch additional data from DexScreener
      const dexScreenerResponse = await fetch(`https://api.dexscreener.com/tokens/v1/solana/${TOKEN_ADDRESS}`)
      const dexScreenerData = await dexScreenerResponse.json()
      
      let tokenInfo = {
        symbol: 'TOKEN',
        name: 'Token',
        priceUsd: '0',
        volume24h: 0,
        priceChange24h: 0,
        contractAddress: TOKEN_ADDRESS,
      }
      
      // Get price from Jupiter
      if (jupiterData && jupiterData[TOKEN_ADDRESS]) {
        tokenInfo.priceUsd = jupiterData[TOKEN_ADDRESS].usdPrice.toString()
      }
      
      // Get additional data from DexScreener
      if (dexScreenerData && dexScreenerData.length > 0) {
        const dexData = dexScreenerData[0]
        tokenInfo.symbol = dexData.baseToken?.symbol || 'TOKEN'
        tokenInfo.name = dexData.baseToken?.name || 'Token'
        tokenInfo.volume24h = dexData.volume?.h24 || 0
        tokenInfo.priceChange24h = dexData.priceChange?.h24 || 0
      }
      
      return tokenInfo
    } catch (error) {
      console.error('Error fetching token data:', error)
      return {
        symbol: 'TOKEN',
        name: 'Token',
        priceUsd: '0',
        volume24h: 0,
        priceChange24h: 0,
        contractAddress: TOKEN_ADDRESS,
        error: 'Failed to load data'
      }
    }
  }

  // Fetch token data
  const fetchData = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const data = await fetchTokenData()
      setTokenData(data)
    } catch (error) {
      console.error('Error fetching token data:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchData()
    fetchSolPrice()
  }, [])

  // Get quote for swap estimation
  const getSwapQuote = async (usdAmount: number) => {
    if (!selectedToken || !isConnected || solPrice === 0) return
    
    setIsGettingQuote(true)
    try {
      // Calculate SOL amount from USD using real price
      const solAmount = usdAmount / solPrice
      const amountInLamports = solAmount * 1e9
      
      const quote = await getQuote(
        NATIVE_MINT.toBase58(),
        selectedToken.contractAddress,
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

  const handleBuyToken = async () => {
    if (!selectedToken || !buyAmountUSD || !isConnected || solPrice === 0) return
    
    const usdAmount = parseFloat(buyAmountUSD)
    
    // Validate minimum amount (increased to avoid "Program failed to complete" error)
    const minSolAmount = 0.05 // 0.05 SOL minimum
    const minUsdAmount = minSolAmount * solPrice
    if (usdAmount < minUsdAmount) {
      alert(`Minimum purchase amount is $${minUsdAmount.toFixed(2)} (${minSolAmount} SOL). Try with at least $${minUsdAmount.toFixed(2)} USD.`)
      return
    }
    
    // Validate SOL balance (including 1% fee and increased buffer)
    const solAmount = usdAmount / solPrice
    const feeAmount = solAmount * 0.01 // 1% fee
    const bufferAmount = 0.03 * solPrice // Increased buffer for fees
    const totalRequiredSol = solAmount + feeAmount + (bufferAmount / solPrice)
    
    if (solBalance < totalRequiredSol) {
      alert(`Insufficient SOL balance. You need approximately ${totalRequiredSol.toFixed(4)} SOL (including ${feeAmount.toFixed(4)} SOL fee + buffer). Please ensure you have at least $${((solAmount + 0.03) * solPrice).toFixed(2)} USD worth of SOL.`)
      return
    }
    
    try {
      const result = await buyToken(selectedToken.contractAddress, usdAmount)
      alert(`Successfully bought ${selectedToken.symbol}! Transaction: ${result.txId}\nFee: $${result.feeInUSD.toFixed(2)}`)
      setSelectedToken(null)
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
        onRefresh={() => fetchData(true)}
        isRefreshing={isRefreshing}
      />

      <div className="px-4 py-6 space-y-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin text-usdt" />
              <span className="text-gray-400">Loading token data...</span>
            </div>
          </div>
        )}

        {/* Token Data */}
        {!isLoading && tokenData && (
          <div className="space-y-3">
            <Card className="p-4 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-usdt to-green-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{tokenData.symbol.slice(0, 2)}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-white">{tokenData.symbol}</h3>
                      <p className="text-gray-400 text-sm">{tokenData.name}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">
                    ${formatPrice(tokenData.priceUsd)}
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    tokenData.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {tokenData.priceChange24h >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {tokenData.priceChange24h >= 0 ? '+' : ''}{tokenData.priceChange24h.toFixed(2)}%
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  <span>24h Vol: {formatVolume(tokenData.volume24h)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  <span>Contract: {TOKEN_ADDRESS.slice(0, 8)}...{TOKEN_ADDRESS.slice(-8)}</span>
                </div>
              </div>
              
              <Button
                onClick={() => setSelectedToken(tokenData)}
                className="w-full mt-3 bg-usdt hover:bg-primary-600"
                disabled={tokenData.error !== undefined}
              >
                {tokenData.error ? 'Data Unavailable' : `Buy ${tokenData.symbol}`}
              </Button>
            </Card>
          </div>
        )}

        {/* Error State */}
        {!isLoading && !tokenData && (
          <div className="text-center py-12">
            <p className="text-gray-400">Failed to load token data. Please try refreshing.</p>
          </div>
        )}
      </div>

      {/* Buy Modal */}
      {selectedToken && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4 text-white">Buy {selectedToken.symbol}</h2>
            
            {!isConnected && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">Please connect your wallet to buy tokens</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">Current Price</span>
                <span className="font-semibold text-white">${formatPrice(selectedToken.priceUsd)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">24h Change</span>
                <span className={`font-semibold ${
                  selectedToken.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {selectedToken.priceChange24h >= 0 ? '+' : ''}{selectedToken.priceChange24h.toFixed(2)}%
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
                <p className="text-xs text-gray-500 mt-1">Minimum $10-20 USD - Buy fractional tokens</p>
                
                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[25, 50, 100, 250, 500, 1000].map((amount) => (
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
                          {parseFloat(quoteData.outAmount || '0').toFixed(2)} {selectedToken.symbol}
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
                    setSelectedToken(null)
                    setBuyAmountUSD('')
                    setQuoteData(null)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBuyToken}
                  disabled={!buyAmountUSD || parseFloat(buyAmountUSD) < 1.00 || isSwapLoading || !isConnected}
                  className="flex-1 bg-usdt hover:bg-primary-600"
                >
                  {isSwapLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    'Buy Tokens'
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