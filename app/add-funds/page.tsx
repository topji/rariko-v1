'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  CreditCard, 
  Building2, 
  Wallet, 
  ArrowUpRight, 
  CheckCircle,
  DollarSign,
  Plus,
  Minus
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { useWallet } from '../../contexts/WalletContext'
import { formatUSDT, formatCurrency } from '../../lib/utils'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Navigation } from '../../components/Navigation'

interface PaymentMethod {
  id: string
  type: 'card' | 'bank' | 'crypto'
  name: string
  icon: React.ReactNode
  last4?: string
  isDefault?: boolean
}

export default function AddFundsPage() {
  const [amount, setAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input')
  const [isLoading, setIsLoading] = useState(false)
  const { wallet, updateBalance } = useWallet()
  const router = useRouter()

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card-1',
      type: 'card',
      name: 'Visa ending in 4242',
      icon: <CreditCard className="w-5 h-5" />,
      last4: '4242',
      isDefault: true,
    },
    {
      id: 'bank-1',
      type: 'bank',
      name: 'Chase Bank',
      icon: <Building2 className="w-5 h-5" />,
      last4: '1234',
    },
    {
      id: 'crypto-1',
      type: 'crypto',
      name: 'Ethereum Wallet',
      icon: <Wallet className="w-5 h-5" />,
    },
  ]

  const quickAmounts = [10, 25, 50, 100, 250, 500]

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimals
    const sanitized = value.replace(/[^0-9.]/g, '')
    // Prevent multiple decimals
    const parts = sanitized.split('.')
    if (parts.length > 2) return
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) return
    setAmount(sanitized)
  }

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString())
  }

  const handleContinue = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (!selectedMethod) {
      toast.error('Please select a payment method')
      return
    }
    setStep('confirm')
  }

  const handleAddFunds = async () => {
    setIsLoading(true)
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newBalance = (wallet?.balance || 0) + parseFloat(amount)
      updateBalance(newBalance)
      
      setStep('success')
      toast.success('Funds added successfully! 💰')
    } catch (error) {
      toast.error('Failed to add funds. Please try again.')
    } finally {
      setIsLoading(false)
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

  const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod)

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            icon={<ArrowLeft className="w-5 h-5" />}
          >
            Back
          </Button>
          <h1 className="text-lg font-semibold text-white">Add Funds</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {step === 'input' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Amount Input */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-white">Amount to Add</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="text-2xl font-bold text-center"
                    icon={<DollarSign className="w-6 h-6" />}
                  />
                </div>
                
                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((value) => (
                    <Button
                      key={value}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAmount(value)}
                      className="h-10"
                    >
                      ${value}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-white">Payment Method</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? 'border-usdt bg-usdt/10'
                        : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          selectedMethod === method.id ? 'bg-usdt' : 'bg-gray-600'
                        }`}>
                          <span className={selectedMethod === method.id ? 'text-white' : 'text-gray-300'}>
                            {method.icon}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{method.name}</p>
                          {method.isDefault && (
                            <p className="text-xs text-usdt">Default</p>
                          )}
                        </div>
                      </div>
                      {selectedMethod === method.id && (
                        <CheckCircle className="w-5 h-5 text-usdt" />
                      )}
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  className="w-full"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add New Payment Method
                </Button>
              </CardContent>
            </Card>

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              className="w-full h-14 text-lg"
              icon={<ArrowUpRight className="w-5 h-5" />}
              disabled={!amount || !selectedMethod}
            >
              Continue
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
                <h2 className="text-lg font-semibold text-white">Confirm Transaction</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Amount</span>
                    <span className="font-semibold text-lg text-white">{formatUSDT(parseFloat(amount))}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Payment Method</span>
                    <span className="font-medium text-white">{selectedPaymentMethod?.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Processing Fee</span>
                    <span className="font-medium text-green-400">Free</span>
                  </div>
                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">Total</span>
                      <span className="text-white font-bold text-lg">{formatUSDT(parseFloat(amount))}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={handleAddFunds}
                loading={isLoading}
                className="w-full h-14 text-lg"
                icon={<Plus className="w-5 h-5" />}
              >
                Add {formatUSDT(parseFloat(amount))}
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
              <h2 className="text-2xl font-bold text-white">Funds Added! 💰</h2>
              <p className="text-gray-300">
                {formatUSDT(parseFloat(amount))} has been added to your wallet
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-3 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Transaction ID</span>
                    <span className="font-mono text-sm text-white">0x1234...5678</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Status</span>
                    <span className="text-green-400 font-medium">Completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">New Balance</span>
                    <span className="font-medium text-white">
                      {formatUSDT((wallet?.balance || 0) + parseFloat(amount))}
                    </span>
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
                Add More Funds
              </Button>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Bottom Navigation */}
      <Navigation />
    </div>
  )
} 