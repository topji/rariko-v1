'use client'

import React, { useState, useEffect } from 'react'
import { Navigation } from '../../components/Navigation'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Search, TrendingUp, TrendingDown, DollarSign, Volume2, RefreshCw, Loader2 } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { useSwapV2 } from '../../hooks/useSwapV2'
import { useDynamicWallet } from '../../hooks/useDynamicWallet'
import { NATIVE_MINT } from '@solana/spl-token'
import TransactionSuccessModal from '../../components/TransactionSuccessModal'
import { orderApi } from '../../lib/api'
import WalletCheck from '../../components/WalletCheck';

// Token addresses
const TOKEN_ADDRESSES = [
  'Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh',
  'XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN',
  'Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg',
  'XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp',
  'XsueG8BtpquVJX9LVLLEGuViXUungE6WmK5YZ3p3bd1',
  'Xs7ZdzSHLU9ftNJsii5fCeJhoRWSC32SQGzGQtePxNu',
  'Xsf9mBktVB9BSU5kf4nHxPq5hCBJ2j2ui3ecFGxPRGc',
  'Xsv9hRk1z5ystj9MhnA7Lq4vjSsLwzL2nxrwmwtD3re',
  'XsqE9cRRpzxcGKDXj1BJ7Xmg4GRhZoyY1KpmGSxAWT2',
  'Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu',
  'XsP7xzNPvEHS1m6qfanPUGjNmdnmsLKEoNAnHjdxxyZ',
  'Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ',
  'XsvNBAYkrDRNhA7wPHQfX3ZUXZyZLdnCQDfHZ56bzpg',
  'XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W',
  'XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB'
]

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
  const [tokensData, setTokensData] = useState<TokenData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [quoteData, setQuoteData] = useState<any>(null)
  const [isGettingQuote, setIsGettingQuote] = useState(false)
  const [solPrice, setSolPrice] = useState<number>(0)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successData, setSuccessData] = useState<any>(null)
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [processingMessage, setProcessingMessage] = useState('')
  
  const { buyToken, getQuote, isLoading: isSwapLoading } = useSwapV2()
  const { isConnected, tokenBalances, walletAddress } = useDynamicWallet()
  
  // SOL balance
  const solBalance = tokenBalances?.find(token => token.symbol === 'SOL')?.balance || 0
  const solBalanceUSD = tokenBalances?.find(token => token.symbol === 'SOL')?.marketValue || 0

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
  const fetchTokenData = async (): Promise<TokenData[]> => {
    try {
      const tokens: TokenData[] = []
      
      // Fetch all tokens data in parallel
      const promises = TOKEN_ADDRESSES.map(async (address) => {
    try {
      // Fetch price from Jupiter lite API
          const jupiterResponse = await fetch(`https://lite-api.jup.ag/price/v3?ids=${address}`)
      const jupiterData = await jupiterResponse.json()
      
      // Fetch additional data from DexScreener
          const dexScreenerResponse = await fetch(`https://api.dexscreener.com/tokens/v1/solana/${address}`)
      const dexScreenerData = await dexScreenerResponse.json()
      
          let tokenInfo: TokenData = {
        symbol: 'TOKEN',
        name: 'Token',
        priceUsd: '0',
        volume24h: 0,
        priceChange24h: 0,
            contractAddress: address,
      }
      
      // Get price from Jupiter
          if (jupiterData && jupiterData[address]) {
            tokenInfo.priceUsd = jupiterData[address].usdPrice.toString()
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
          console.error(`Error fetching data for ${address}:`, error)
      return {
        symbol: 'TOKEN',
        name: 'Token',
        priceUsd: '0',
        volume24h: 0,
        priceChange24h: 0,
            contractAddress: address,
        error: 'Failed to load data'
      }
        }
      })
      
      const results = await Promise.all(promises)
      return results
    } catch (error) {
      console.error('Error fetching token data:', error)
      return []
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
      setTokensData(data)
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
    if (!selectedToken || !buyAmountUSD || !isConnected || solPrice === 0 || !walletAddress) return
    
    const usdAmount = parseFloat(buyAmountUSD)
    
    // Validate SOL balance (including 1% fee)
    const solAmount = usdAmount / solPrice
    const feeAmount = solAmount * 0.01 // 1% fee
    const totalRequiredSol = solAmount + feeAmount
    
    if (solBalance < totalRequiredSol) {
      alert(`Insufficient SOL balance. You need approximately ${totalRequiredSol.toFixed(4)} SOL (including ${feeAmount.toFixed(4)} SOL fee). Please ensure you have at least $${((solAmount + feeAmount) * solPrice).toFixed(2)} USD worth of SOL.`)
      return
    }
    
    // Show processing modal
    setShowProcessingModal(true)
    setProcessingMessage('Processing transaction...')
    
    try {
      // Execute the swap first
      const result = await buyToken(selectedToken.contractAddress, usdAmount)
      
      // Create backend order only after successful transaction
      const orderData = {
        userAddress: walletAddress,
        symbol: selectedToken.symbol,
        tokenAddress: selectedToken.contractAddress,
        amountInUsd: usdAmount,
        tokenAmount: result.tokenAmount || 0,
        amountInSol: solAmount,
        type: 'BUY',
        txHash: result.txId,
        feeInUsd: result.feeInUSD,
        tokenPrice: parseFloat(selectedToken.priceUsd)
      }
      
      await orderApi.createBuyOrder(orderData)
      
      // Set success data
      setSuccessData({
        txId: result.txId,
        tokenSymbol: selectedToken.symbol,
        tokenAmount: result.tokenAmount || 0,
        usdAmount,
        feeInUSD: result.feeInUSD,
        tokenPrice: result.tokenPrice || parseFloat(selectedToken.priceUsd)
      })
      
      setShowProcessingModal(false)
      setShowSuccessModal(true)
      setSelectedToken(null)
      setBuyAmountUSD('')
      setQuoteData(null)
    } catch (error) {
      console.error('Buy failed:', error)
      setShowProcessingModal(false)
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

  const formatTokenAmount = (amount: number) => {
    if (amount >= 1) {
      return amount.toFixed(2)
    } else if (amount >= 0.01) {
      return amount.toFixed(4)
    } else {
      return amount.toFixed(6)
    }
  }

  const getEstimatedTokenAmount = () => {
    if (!quoteData || !buyAmountUSD) return 0
    const usdAmount = parseFloat(buyAmountUSD)
    const outAmount = parseFloat(quoteData.outAmount || '0')
    return outAmount / Math.pow(10, 9) // Assuming 9 decimals
  }

  return (
    <WalletCheck>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
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
        {!isLoading && tokensData && (
          <div className="space-y-3">
            {tokensData
              .filter(token => parseFloat(token.priceUsd) > 0) // Filter out tokens with zero price
              .map((token, index) => (
              <Card key={token.contractAddress} className="p-4 hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-usdt to-green-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{token.symbol.slice(0, 2)}</span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-white">{token.symbol}</h3>
                        <p className="text-gray-400 text-sm">{token.name}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">
                      ${formatPrice(token.priceUsd)}
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                      token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                      {token.priceChange24h >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                      {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                    <span>24h Vol: {formatVolume(token.volume24h)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                    <span>Contract: {token.contractAddress.slice(0, 8)}...{token.contractAddress.slice(-8)}</span>
                </div>
              </div>
              
              <Button
                  onClick={() => setSelectedToken(token)}
                className="w-full mt-3 bg-usdt hover:bg-primary-600"
                  disabled={token.error !== undefined}
              >
                  {token.error ? 'Data Unavailable' : `Buy ${token.symbol}`}
              </Button>
            </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && (!tokensData || tokensData.length === 0) && (
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
                  <div className="relative">
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
                      className="bg-gray-800 border-gray-700 text-white pr-20"
                />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                      Balance: ${solBalanceUSD.toFixed(2)}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum $10 USD - Buy fractional tokens</p>
                
                {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBuyAmountUSD('10')
                        getSwapQuote(10)
                      }}
                      className="h-8 text-xs"
                    >
                      $10
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setBuyAmountUSD('20')
                        getSwapQuote(20)
                      }}
                      className="h-8 text-xs"
                    >
                      $20
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const maxAmount = Math.floor(solBalanceUSD * 0.99) // Leave some for fees
                        setBuyAmountUSD(maxAmount.toString())
                        getSwapQuote(maxAmount)
                      }}
                      className="h-8 text-xs"
                    >
                      $Max
                    </Button>
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
                          {formatTokenAmount(getEstimatedTokenAmount())} {selectedToken.symbol}
                        </span>
                      </div>
                    </div>
                  )}
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
    </WalletCheck>
  )
} 