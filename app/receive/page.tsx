'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Share2, Download, QrCode, User } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { QRCodeDisplay } from '../../components/ui/QRCodeDisplay'
import { useAuth } from '../../contexts/AuthContext'
import { useWallet } from '../../contexts/WalletContext'
import { shortenAddress } from '../../lib/utils'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Navigation } from '../../components/Navigation'
import { PageHeader } from '../../components/PageHeader'

export default function ReceivePage() {
  const [copied, setCopied] = useState(false)
  const { user } = useAuth()
  const { wallet } = useWallet()
  const router = useRouter()

  const handleCopyAddress = async () => {
    if (!wallet?.address) return
    
    try {
      await navigator.clipboard.writeText(wallet.address)
      setCopied(true)
      toast.success('Wallet address copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy address')
    }
  }

  const handleShare = async () => {
    if (!wallet?.address) return
    
    const shareData = {
      title: 'Send me USDT',
      text: `Send USDT to my RariKo wallet: ${user?.username || 'user'}`,
      url: `https://rariko.app/pay/${user?.username || wallet.address}`,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
        toast.success('Payment link copied!')
      }
    } catch (error) {
      toast.error('Failed to share')
    }
  }

  const handleBack = () => {
    router.back()
  }

  if (!wallet) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-usdt mx-auto mb-4"></div>
          <p className="text-gray-300">Loading wallet...</p>
        </div>
      </div>
    )
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* QR Code */}
          <div className="flex flex-col items-center space-y-6 p-6 bg-gray-800 rounded-2xl shadow-sm border border-gray-700">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white">Scan to send USDT</h3>
              <p className="text-sm text-gray-400 mt-1">@{user?.username || 'user'}</p>
            </div>
            
            <div className="p-4 bg-white rounded-xl border border-gray-600">
              <QRCodeDisplay
                value={wallet.address}
                size={250}
                showCopyButton={false}
                showDownloadButton={false}
              />
            </div>
          </div>

          {/* Wallet Address */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-white">Wallet Address</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-700 rounded-xl p-4">
                <p className="font-mono text-sm break-all text-gray-200">
                  {wallet.address}
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  onClick={handleCopyAddress}
                  icon={<Copy className="w-4 h-4" />}
                  className="flex-1"
                >
                  {copied ? 'Copied!' : 'Copy Address'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShare}
                  icon={<Share2 className="w-4 h-4" />}
                  className="flex-1"
                >
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                onClick={() => router.push('/invoices')}
                icon={<User className="w-4 h-4" />}
                className="w-full justify-start"
              >
                Create Invoice
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/tipping')}
                icon={<QrCode className="w-4 h-4" />}
                className="w-full justify-start"
              >
                Generate Tip Link
              </Button>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-blue-900 border-blue-700">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <QrCode className="w-3 h-3 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-200 mb-1">How to receive USDT</h3>
                  <ul className="text-sm text-blue-300 space-y-1">
                    <li>• Share your QR code or wallet address</li>
                    <li>• Anyone can send you USDT instantly</li>
                    <li>• No gas fees - transactions are free</li>
                    <li>• Funds appear in your wallet immediately</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Bottom Navigation */}
      <Navigation />
    </div>
  )
} 