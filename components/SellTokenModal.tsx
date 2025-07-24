import React, { useState, useEffect } from 'react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { TrendingUp, TrendingDown, DollarSign, Loader2, X } from 'lucide-react'
import { useSwapV2 } from '../hooks/useSwapV2'
import { useDynamicWallet } from '../hooks/useDynamicWallet'
import { NATIVE_MINT } from '@solana/spl-token'
import { orderApi } from '../lib/api'

interface TokenData {
  symbol: string
  name: string
  priceUsd: string
  volume24h: number
  priceChange24h: number
  contractAddress: string
  balance: number
  decimals: number
}

interface SellTokenModalProps {
  isOpen: boolean
  onClose: () => void
  token: TokenData
  onSuccess: (result: any) => void
}

export default function SellTokenModal({ isOpen, onClose, token, onSuccess }: SellTokenModalProps) {
  const [sellAmount, setSellAmount] = useState('')
  const [quoteData, setQuoteData] = useState<any>(null)
  const [isGettingQuote, setIsGettingQuote] = useState(false)
  const [solPrice, setSolPrice] = useState<number>(0)
  const [showProcessingModal, setShowProcessingModal] = useState(false)
  const [processingMessage, setProcessingMessage] = useState('')
  
  const { sellToken, getQuote, isLoading: isSwapLoading } = useSwapV2()
  const { isConnected, walletAddress } = useDynamicWallet()

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

  // Get quote for sell estimation
  const getSellQuote = async (tokenAmount: number) => {
    if (!isConnected || solPrice === 0) return
    
    setIsGettingQuote(true)
    try {
      // Convert token amount to raw amount using the correct decimals
      const rawAmount = Math.floor(tokenAmount * Math.pow(10, token.decimals))
      
      const quote = await getQuote(
        token.contractAddress,
        NATIVE_MINT.toBase58(),
        rawAmount.toString()
      )
      
      setQuoteData(quote)
    } catch (error) {
      console.error('Error getting quote:', error)
      setQuoteData(null)
    } finally {
      setIsGettingQuote(false)
    }
  }

  // Handle sell amount change
  const handleSellAmountChange = (value: string) => {
    setSellAmount(value)
    const amount = parseFloat(value)
    if (amount > 0 && amount <= token.balance) {
      getSellQuote(amount)
    } else {
      setQuoteData(null)
    }
  }

  // Handle sell
  const handleSell = async () => {
    if (!sellAmount || !isConnected || solPrice === 0) return
    
    const tokenAmount = parseFloat(sellAmount)
    const usdValue = tokenAmount * parseFloat(token.priceUsd)
    const solAmount = usdValue / solPrice
    const feeAmount = solAmount * 0.01 // 1% fee
    const totalSolReceived = solAmount - feeAmount
    
    if (tokenAmount > token.balance) {
      alert(`Insufficient ${token.symbol} balance. You have ${token.balance.toFixed(6)} ${token.symbol}.`)
      return
    }
    
    // Show processing modal
    setShowProcessingModal(true)
    setProcessingMessage('Creating sell order...')
    
    try {
      if (!walletAddress) {
        alert('Wallet not connected')
        return
      }

      // Create backend order first
      const orderData = {
        walletAddress,
        tokenSymbol: token.symbol,
        tokenAddress: token.contractAddress,
        amount: tokenAmount,
        price: parseFloat(token.priceUsd),
        totalValue: usdValue,
        metadata: {
          solAmount,
          feeAmount,
          timestamp: new Date()
        }
      }
      
      const orderResponse = await orderApi.createSellOrder(orderData)
      setProcessingMessage('Processing transaction...')
      
      // Convert token amount to raw amount using the correct decimals
      const rawAmount = Math.floor(tokenAmount * Math.pow(10, token.decimals))
      
      const result = await sellToken(token.contractAddress, rawAmount)
      
      // Update order status to completed
      await orderApi.completeOrder(orderResponse.order.id, {
        transactionHash: result.txId,
        tokenAmount,
        feeInUSD: result.feeInUSD
      })
      
      setShowProcessingModal(false)
      onSuccess({
        txId: result.txId,
        tokenAmount,
        feeInUSD: result.feeInUSD
      })
    } catch (error) {
      console.error('Sell failed:', error)
      setShowProcessingModal(false)
      alert('Transaction failed. Please try again.')
    }
  }

  // Format functions
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

  const getEstimatedSolAmount = () => {
    if (!quoteData || !sellAmount) return 0
    const outAmount = parseFloat(quoteData.outAmount || '0')
    return outAmount / Math.pow(10, 9) // Convert from lamports to SOL
  }

  const getEstimatedUsdAmount = () => {
    const solAmount = getEstimatedSolAmount()
    return solAmount * solPrice
  }

  // Initialize SOL price
  useEffect(() => {
    if (isOpen) {
      fetchSolPrice()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Sell {token.symbol}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        
        {!isConnected && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">Please connect your wallet to sell tokens</p>
          </div>
        )}
        
        <div className="space-y-4">
          {/* Token Info */}
          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <span className="text-gray-400">Current Price</span>
            <span className="font-semibold text-white">${formatPrice(token.priceUsd)}</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <span className="text-gray-400">24h Change</span>
            <span className={`font-semibold ${
              token.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
            <span className="text-gray-400">Your Balance</span>
            <span className="font-semibold text-white">
              {formatTokenAmount(token.balance)} {token.symbol}
            </span>
          </div>
          
          {/* Sell Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Amount to Sell</label>
            <Input
              type="number"
              placeholder="0.00"
              value={sellAmount}
              onChange={(e) => handleSellAmountChange(e.target.value)}
              className="w-full"
              disabled={!isConnected}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSellAmountChange((token.balance * 0.25).toString())}
                disabled={!isConnected}
                className="flex-1"
              >
                25%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSellAmountChange((token.balance * 0.5).toString())}
                disabled={!isConnected}
                className="flex-1"
              >
                50%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSellAmountChange((token.balance * 0.75).toString())}
                disabled={!isConnected}
                className="flex-1"
              >
                75%
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSellAmountChange(token.balance.toString())}
                disabled={!isConnected}
                className="flex-1"
              >
                Max
              </Button>
            </div>
          </div>

          {/* Quote Information */}
          {sellAmount && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400">Platform Fee (1%)</span>
                <span className="font-semibold text-white text-yellow-400">
                  ${(parseFloat(sellAmount) * parseFloat(token.priceUsd) * 0.01).toFixed(2)}
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
                    <span className="text-gray-400">Estimated USD Value</span>
                    <span className="font-semibold text-white">
                      ${getEstimatedUsdAmount().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSell}
              disabled={!sellAmount || parseFloat(sellAmount) <= 0 || parseFloat(sellAmount) > token.balance || isSwapLoading || !isConnected}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isSwapLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                'Sell Tokens'
              )}
            </Button>
          </div>
        </div>
      </Card>

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