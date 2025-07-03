'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, User, Mail, Phone, QrCode, DollarSign } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { useWallet } from '../../contexts/WalletContext'
import { formatUSDT } from '../../lib/utils'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Navigation } from '../../components/Navigation'
import { PageHeader } from '../../components/PageHeader'

export default function SendPage() {
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [note, setNote] = useState('')
  const [step, setStep] = useState<'input' | 'preview' | 'success'>('input')
  const [isLoading, setIsLoading] = useState(false)
  const { wallet, sendTransaction } = useWallet()
  const router = useRouter()

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

  const handleContinue = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    if (!recipient) {
      toast.error('Please enter recipient details')
      return
    }
    if (parseFloat(amount) > (wallet?.balance || 0)) {
      toast.error('Insufficient balance')
      return
    }
    setStep('preview')
  }

  const handleSend = async () => {
    setIsLoading(true)
    try {
      await sendTransaction(recipient, parseFloat(amount), note)
      setStep('success')
      toast.success('Transaction sent successfully! 💸')
    } catch (error) {
      toast.error('Transaction failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (step === 'preview') {
      setStep('input')
    } else {
      router.back()
    }
  }

  const handleDone = () => {
    router.push('/')
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
      </PageHeader>

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
                <h2 className="text-lg font-semibold text-white">Amount</h2>
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
                <div className="text-center text-sm text-gray-400">
                  Available: {formatUSDT(wallet?.balance || 0)}
                </div>
              </CardContent>
            </Card>

            {/* Recipient Input */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-white">Recipient</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Username, email, or wallet address"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  icon={<User className="w-4 h-4" />}
                />
                
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRecipient('john.doe')}
                    className="h-12"
                    icon={<User className="w-4 h-4" />}
                  >
                    Username
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRecipient('john@example.com')}
                    className="h-12"
                    icon={<Mail className="w-4 h-4" />}
                  >
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRecipient('+1234567890')}
                    className="h-12"
                    icon={<Phone className="w-4 h-4" />}
                  >
                    Phone
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Note Input */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-white">Note (Optional)</h2>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="What's this payment for?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Continue Button */}
            <Button
              onClick={handleContinue}
              className="w-full h-14 text-lg"
              icon={<Send className="w-5 h-5" />}
              disabled={!amount || !recipient}
            >
              Continue
            </Button>
          </motion.div>
        )}

        {step === 'preview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-white">Transaction Preview</h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Amount</span>
                    <span className="font-semibold text-lg text-white">{formatUSDT(parseFloat(amount))}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Recipient</span>
                    <span className="font-medium text-white">{recipient}</span>
                  </div>
                  {note && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-300">Note</span>
                      <span className="font-medium text-white">{note}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-300">Network Fee</span>
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
                onClick={handleSend}
                loading={isLoading}
                className="w-full h-14 text-lg"
                icon={<Send className="w-5 h-5" />}
              >
                Send {formatUSDT(parseFloat(amount))}
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
              <Send className="w-10 h-10 text-green-400" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Transaction Sent! 💸</h2>
              <p className="text-gray-300">
                Your payment of {formatUSDT(parseFloat(amount))} has been sent to {recipient}
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
                    <span className="text-gray-300">Time</span>
                    <span className="font-medium text-white">{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={handleDone}
                className="w-full h-14 text-lg"
              >
                Done
              </Button>
              <Button
                variant="outline"
                onClick={() => setStep('input')}
                className="w-full"
              >
                Send Another
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