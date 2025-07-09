'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  ArrowUpDown, 
  Settings, 
  Info, 
  CheckCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { useDynamicWallet } from '../../hooks/useDynamicWallet'
import { useSwapV2 } from '../../hooks/useSwapV2'
import { formatUSDT, formatCurrency } from '../../lib/utils'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Navigation } from '../../components/Navigation'
import { PageHeader } from '../../components/PageHeader'
import TransactionStatus from '../../components/TransactionStatus'

interface Token {
  id: string
  symbol: string
  name: string
  icon: string
  price: number
  balance: number
  decimals: number
}

export default function SwapPage() {
  const [fromToken, setFromToken] = useState<Token | null>(null)
  const [toToken, setToToken] = useState<Token | null>(null)
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [slippage, setSlippage] = useState(0.5)
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input')
  const [showSettings, setShowSettings] = useState(false)
  const [txId, setTxId] = useState<string | null>(null)
  const [showTransactionStatus, setShowTransactionStatus] = useState(false)
  const { walletAddress } = useDynamicWallet()
  const { buyToken, sellToken, isLoading, isConfirming } = useSwapV2()
  const router = useRouter()

  // Mock tokens data
  const tokens: Token[] = [
    {
      id: 'usdt',
      symbol: 'USDT',
      name: 'Tether USD',
      icon: '💵',
      price: 1.00,
      balance: 0,
      decimals: 6,
    },
    {
      id: 'usdc',
      symbol: 'USDC',
      name: 'USD Coin',
      icon: '🪙',
      price: 1.00,
      balance: 250.50,
      decimals: 6,
    },
    {
      id: 'eth',
      symbol: 'ETH',
      name: 'Ethereum',
      icon: '🔷',
      price: 3200.00,
      balance: 0.5,
      decimals: 18,
    },
    {
      id: 'matic',
      symbol: 'MATIC',
      name: 'Polygon',
      icon: '🟣',
      price: 0.85,
      balance: 1000,
      decimals: 18,
    },
    {
      id: 'dai',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      icon: '🟡',
      price: 1.00,
      balance: 75.25,
      decimals: 18,
    },
  ]

  // Set default tokens
  React.useEffect(() => {
    if (!fromToken) {
      setFromToken(tokens[0]) // USDT
    }
    if (!toToken) {
      setToToken(tokens[1]) // USDC
    }
  }, [tokens])

  const handleFromAmountChange = (value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '')
    const parts = sanitized.split('.')
    if (parts.length > 2) return
    if (parts[1] && parts[1].length > 6) return
    
    setFromAmount(sanitized)
    
    // Calculate to amount based on token prices
    if (fromToken && toToken && sanitized) {
      const amount = parseFloat(sanitized)
      const rate = toToken.price / fromToken.price
      const calculated = amount * rate
      setToAmount(calculated.toFixed(6))
    } else {
      setToAmount('')
    }
  }

  const handleSwapTokens = () => {
    const temp = fromToken
    setFromToken(toToken)
    setToToken(temp)
    setFromAmount('')
    setToAmount('')
  }

  const handleMaxAmount = () => {
    if (fromToken) {
      setFromAmount(fromToken.balance.toString())
      const rate = toToken?.price && fromToken.price ? toToken.price / fromToken.price : 1
      setToAmount((fromToken.balance * rate).toFixed(6))
    }
  }

  const handleContinue = () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (!fromToken || !toToken) {
      toast.error('Please select tokens')
      return
    }
    if (parseFloat(fromAmount) > (fromToken.balance || 0)) {
      toast.error('Insufficient balance')
      return
    }
    setStep('confirm')
  }

  const handleSwap = async () => {
    if (!fromToken || !toToken || !fromAmount) {
      toast.error('Invalid swap parameters')
      return
    }

    try {
      setShowTransactionStatus(true)
      
      // Determine if this is a buy or sell operation
      const isBuying = fromToken.symbol === 'SOL' || fromToken.id === 'sol'
      const isSelling = toToken.symbol === 'SOL' || toToken.id === 'sol'
      
      let result
      if (isBuying) {
        // Buying token with SOL
        result = await buyToken(toToken.id, parseFloat(fromAmount))
      } else if (isSelling) {
        // Selling token for SOL
        result = await sellToken(fromToken.id, parseFloat(fromAmount))
      } else {
        // For now, treat as buying with SOL (you can enhance this logic)
        result = await buyToken(toToken.id, parseFloat(fromAmount))
      }
      
      setTxId(result.txId)
      setStep('success')
      toast.success(`Swap completed successfully! Fee: $${result.feeInUSD.toFixed(2)} 🔄`)
    } catch (error: any) {
      console.error('Swap failed:', error)
      toast.error(error.message || 'Swap failed. Please try again.')
    }
  }

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('input')
    } else if (step === 'success') {
      router.push('/')
    } else {
      router.back()
    }
  }

  const getExchangeRate = () => {
    if (!fromToken || !toToken) return null
    const rate = toToken.price / fromToken.price
    return `1 ${fromToken.symbol} = ${rate.toFixed(6)} ${toToken.symbol}`
  }

  const getPriceImpact = () => {
    // Mock price impact calculation
    const amount = parseFloat(fromAmount) || 0
    if (amount < 100) return 'Low'
    if (amount < 1000) return 'Medium'
    return 'High'
  }

  const getMinimumReceived = () => {
    if (!toAmount || !slippage) return '0'
    const amount = parseFloat(toAmount)
    const minAmount = amount * (1 - slippage / 100)
    return minAmount.toFixed(6)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <PageHeader>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          icon={<ArrowLeft className="w-5 h-5" />}
        >
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          icon={<Settings className="w-5 h-5" />}
        >
          Settings
        </Button>
      </PageHeader>

      <div className="px-4 py-6 space-y-6">
        {step === 'input' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Swap Interface */}
            <Card>
              <CardContent className="p-6 space-y-4">
                {/* From Token */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">From</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Balance:</span>
                      <span className="text-sm text-white">
                        {fromToken ? `${fromToken.balance.toFixed(2)} ${fromToken.symbol}` : '0.00'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleMaxAmount}
                        className="text-usdt hover:text-usdt/80"
                      >
                        Max
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-xl">
                    <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center text-2xl">
                      {fromToken?.icon}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="0.00"
                        value={fromAmount}
                        onChange={(e) => handleFromAmountChange(e.target.value)}
                        className="text-xl font-bold border-none bg-transparent p-0 focus:ring-0"
                      />
                      <p className="text-sm text-gray-400">
                        ≈ {fromAmount ? formatCurrency(parseFloat(fromAmount) * (fromToken?.price || 0), 'USD') : '$0.00'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/select-token?type=from')}
                      className="min-w-[100px]"
                    >
                      {fromToken?.symbol || 'Select'}
                    </Button>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSwapTokens}
                    className="w-10 h-10 rounded-full"
                    icon={<ArrowUpDown className="w-4 h-4" />}
                  >
                    Swap
                  </Button>
                </div>

                {/* To Token */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">To</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Balance:</span>
                      <span className="text-sm text-white">
                        {toToken ? `${toToken.balance.toFixed(2)} ${toToken.symbol}` : '0.00'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-xl">
                    <div className="w-12 h-12 bg-gray-600 rounded-xl flex items-center justify-center text-2xl">
                      {toToken?.icon}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="0.00"
                        value={toAmount}
                        readOnly
                        className="text-xl font-bold border-none bg-transparent p-0 focus:ring-0"
                      />
                      <p className="text-sm text-gray-400">
                        ≈ {toAmount ? formatCurrency(parseFloat(toAmount) * (toToken?.price || 0), 'USD') : '$0.00'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/select-token?type=to')}
                      className="min-w-[100px]"
                    >
                      {toToken?.symbol || 'Select'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Swap Details */}
            {fromAmount && toAmount && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Exchange Rate</span>
                    <span className="text-sm text-white">{getExchangeRate()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Price Impact</span>
                    <span className={`text-sm ${
                      getPriceImpact() === 'Low' ? 'text-green-400' : 
                      getPriceImpact() === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {getPriceImpact()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Network Fee</span>
                    <span className="text-sm text-white">~$0.50</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Swap Button */}
            <Button
              onClick={handleContinue}
              className="w-full h-14 text-lg"
              icon={<ArrowUpDown className="w-5 h-5" />}
              disabled={!fromAmount || !toAmount || parseFloat(fromAmount) <= 0}
            >
              {fromAmount && toAmount ? `Swap ${fromToken?.symbol} for ${toToken?.symbol}` : 'Enter an amount'}
            </Button>
          </motion.div>
        )}

        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-white">Confirm Swap</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">You Pay</span>
                    <div className="text-right">
                      <span className="font-semibold text-lg text-white">
                        {fromAmount} {fromToken?.symbol}
                      </span>
                      <p className="text-sm text-gray-400">
                        ≈ {formatCurrency(parseFloat(fromAmount) * (fromToken?.price || 0), 'USD')}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">You Receive</span>
                    <div className="text-right">
                      <span className="font-semibold text-lg text-white">
                        {toAmount} {toToken?.symbol}
                      </span>
                      <p className="text-sm text-gray-400">
                        ≈ {formatCurrency(parseFloat(toAmount) * (toToken?.price || 0), 'USD')}
                      </p>
                    </div>
                  </div>
                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Rate</span>
                      <span className="text-white">{getExchangeRate()}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-300">Price Impact</span>
                      <span className={`${
                        getPriceImpact() === 'Low' ? 'text-green-400' : 
                        getPriceImpact() === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {getPriceImpact()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-300">Minimum Received</span>
                      <span className="text-white">{getMinimumReceived()} {toToken?.symbol}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={handleSwap}
                loading={isLoading}
                className="w-full h-14 text-lg"
                icon={<Zap className="w-5 h-5" />}
              >
                Confirm Swap
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep('input')}
                className="w-full"
              >
                Back to Edit
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6"
          >
            <div className="w-20 h-20 bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Swap Successful! 🔄</h2>
              <p className="text-gray-300">
                You swapped {fromAmount} {fromToken?.symbol} for {toAmount} {toToken?.symbol}
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Transaction Hash</span>
                    <span className="font-mono text-sm text-white">
                      {txId ? `${txId.slice(0, 8)}...${txId.slice(-8)}` : 'Processing...'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Status</span>
                    <span className="text-green-400 font-medium">Completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Time</span>
                    <span className="font-medium text-white">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={handleBack}
                className="w-full h-14 text-lg"
              >
                Done
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep('input')}
                className="w-full"
              >
                Swap Again
              </Button>
            </div>
          </motion.div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md"
            >
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-white">Swap Settings</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Slippage Tolerance
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[0.1, 0.5, 1.0].map((value) => (
                        <Button
                          key={value}
                          variant={slippage === value ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setSlippage(value)}
                        >
                          {value}%
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => setShowSettings(false)}
                      className="flex-1"
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowSettings(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
      
      {/* Transaction Status Modal */}
      {showTransactionStatus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <TransactionStatus
            txId={txId}
            isConfirming={isConfirming}
            onClose={() => setShowTransactionStatus(false)}
          />
        </div>
      )}
      
      {/* Bottom Navigation */}
      <Navigation />
    </div>
  )
} 