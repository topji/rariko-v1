import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Copy, ExternalLink, X, TrendingUp, DollarSign } from 'lucide-react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

interface TransactionSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  txId: string
  tokenSymbol: string
  tokenAmount: number
  usdAmount: number
  feeInUSD: number
  tokenPrice: number
  transactionType?: 'buy' | 'sell'
}

export default function TransactionSuccessModal({
  isOpen,
  onClose,
  txId,
  tokenSymbol,
  tokenAmount,
  usdAmount,
  feeInUSD,
  tokenPrice,
  transactionType = 'buy'
}: TransactionSuccessModalProps) {
  const handleCopyTxId = async () => {
    try {
      await navigator.clipboard.writeText(txId)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy transaction ID:', error)
    }
  }

  const handleViewOnExplorer = () => {
    window.open(`https://solscan.io/tx/${txId}`, '_blank')
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md"
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>

              {/* Success animation */}
              <div className="relative p-8 text-center">
                {/* Animated success icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 15, stiffness: 200 }}
                  className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25"
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>

                {/* Success message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-2 mb-6"
                >
                  <h2 className="text-2xl font-bold text-white">
                    {transactionType === 'sell' ? 'Sale Successful! 🎉' : 'Purchase Successful! 🎉'}
                  </h2>
                  <p className="text-gray-300 text-sm">
                    You've successfully {transactionType === 'sell' ? 'sold' : 'bought'} {tokenSymbol} tokens
                  </p>
                </motion.div>

                {/* Token amount card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-usdt/10 to-primary-600/10 border border-usdt/20 rounded-xl p-4 mb-6"
                >
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-usdt rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg font-semibold text-white">
                      {formatTokenAmount(tokenAmount)} {tokenSymbol}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-300 text-sm">≈ ${usdAmount.toFixed(2)} USD</p>
                    <p className="text-gray-400 text-xs">@ ${tokenPrice.toFixed(4)} per {tokenSymbol}</p>
                  </div>
                </motion.div>

                {/* Transaction details */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3 mb-6"
                >
                  <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Transaction ID</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white text-xs">
                          {txId.slice(0, 8)}...{txId.slice(-8)}
                        </span>
                        <button
                          onClick={handleCopyTxId}
                          className="p-1 rounded hover:bg-gray-700 transition-colors"
                        >
                          <Copy className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Platform Fee</span>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-yellow-400" />
                        <span className="text-white text-sm">{feeInUSD.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Status</span>
                      <span className="text-green-400 text-sm font-medium">Confirmed</span>
                    </div>
                  </div>
                </motion.div>

                {/* Action buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-3"
                >
                  <Button
                    onClick={handleViewOnExplorer}
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Explorer
                  </Button>
                  <Button
                    onClick={onClose}
                    className="flex-1 bg-usdt hover:bg-primary-600"
                  >
                    Done
                  </Button>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 