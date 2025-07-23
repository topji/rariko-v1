'use client'

import React, { useState } from 'react'
import QRCode from 'qrcode.react'
import { Copy, Download } from 'lucide-react'
import { Button } from './Button'
import { toast } from 'react-hot-toast'

interface QRCodeDisplayProps {
  value: string
  size?: number
  title?: string
  subtitle?: string
  showCopyButton?: boolean
  showDownloadButton?: boolean
}

export function QRCodeDisplay({
  value,
  size = 200,
  title,
  subtitle,
  showCopyButton = true,
  showDownloadButton = true,
}: QRCodeDisplayProps) {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setIsCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const downloadQR = () => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.download = 'rizz-qr.png'
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      {title && (
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      
      <div className="p-4 bg-white rounded-xl border border-gray-200">
        <QRCode
          value={value}
          size={size}
          level="H"
          includeMargin={true}
          bgColor="#ffffff"
          fgColor="#1DBF73"
        />
      </div>
      
      <div className="flex flex-col space-y-3 w-full max-w-xs">
        {showCopyButton && (
          <Button
            variant="secondary"
            onClick={copyToClipboard}
            icon={<Copy className="w-4 h-4" />}
            className="w-full"
          >
            {isCopied ? 'Copied!' : 'Copy Address'}
          </Button>
        )}
        
        {showDownloadButton && (
          <Button
            variant="outline"
            onClick={downloadQR}
            icon={<Download className="w-4 h-4" />}
            className="w-full"
          >
            Download QR
          </Button>
        )}
      </div>
    </div>
  )
} 