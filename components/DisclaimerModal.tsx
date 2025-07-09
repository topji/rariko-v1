import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, AlertTriangle, X } from 'lucide-react'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

interface DisclaimerModalProps {
  isOpen: boolean
  onAccept: () => void
}

export default function DisclaimerModal({ isOpen, onAccept }: DisclaimerModalProps) {
  const [hasAccepted, setHasAccepted] = useState(false)

  const handleAccept = () => {
    if (hasAccepted) {
      onAccept()
    }
  }

  if (!isOpen) return null

  return (
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
        className="w-full max-w-lg"
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50">
          {/* Header */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Important Disclaimer</h2>
            </div>
            <p className="text-gray-300 text-sm">
              Please read and accept the following terms before using RariKo
            </p>
          </div>

          {/* Disclaimer Content */}
          <div className="p-6">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 mb-6">
              <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
                <p>
                  <strong className="text-white">I agree that RariKo offers a platform to invest in tokenized assets like stocks backed by real world stocks.</strong>
                </p>
                
                <p>
                  <strong className="text-white">I fully understand that I have full custody of my investments and funds in my Wallet and RariKo cannot access my funds.</strong>
                </p>
                
                <p>
                  <strong className="text-white">I am not a US citizen.</strong>
                </p>
                
                <p>
                  <strong className="text-white">I myself am responsible for my own investments and any Profit/Loss I may incur.</strong>
                </p>
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex items-start gap-3 mb-6">
              <input
                type="checkbox"
                id="disclaimer-accept"
                checked={hasAccepted}
                onChange={(e) => setHasAccepted(e.target.checked)}
                className="w-5 h-5 text-usdt bg-gray-800 border-gray-600 rounded focus:ring-usdt focus:ring-2 mt-0.5"
              />
              <label htmlFor="disclaimer-accept" className="text-gray-300 text-sm leading-relaxed">
                I have read, understood, and agree to the above disclaimer. I confirm that I meet all the requirements stated above.
              </label>
            </div>

            {/* Warning */}
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-300 text-xs">
                  <strong>Important:</strong> By accepting this disclaimer, you confirm that you are not a US citizen and understand the risks associated with investing in tokenized assets.
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="p-6 border-t border-gray-700/50">
            <Button
              onClick={handleAccept}
              disabled={!hasAccepted}
              className="w-full bg-usdt hover:bg-primary-600 text-white font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Accept & Continue
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
} 